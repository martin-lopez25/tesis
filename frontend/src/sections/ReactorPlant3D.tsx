import { useRef, useEffect, useState, useCallback } from 'react';
import { X, ZoomIn, ZoomOut, RotateCcw } from 'lucide-react';

const BASE_S = 48;

function iso(wx: number, wy: number, wz: number, s: number): [number, number] {
  return [(wx - wy) * s, (wx + wy) * s * 0.5 - wz * s * 0.78];
}

function toScreen(wx: number, wy: number, wz: number, s: number, ox: number, oy: number): [number, number] {
  const [px, py] = iso(wx, wy, wz, s);
  return [px + ox, py + oy];
}

type Ctx = CanvasRenderingContext2D;

function polygon(ctx: Ctx, pts: [number, number][], fill: string, stroke?: string, lw = 0.8) {
  ctx.beginPath();
  ctx.moveTo(pts[0][0], pts[0][1]);
  for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i][0], pts[i][1]);
  ctx.closePath();
  ctx.fillStyle = fill;
  ctx.fill();
  if (stroke) {
    ctx.strokeStyle = stroke;
    ctx.lineWidth = lw;
    ctx.stroke();
  }
}

function drawBox(
  ctx: Ctx,
  bx: number,
  by: number,
  bz: number,
  dx: number,
  dy: number,
  dz: number,
  cTop: string,
  cLeft: string,
  cRight: string,
  s: number,
  ox: number,
  oy: number,
  border?: string,
) {
  const p = (x: number, y: number, z: number) => toScreen(x, y, z, s, ox, oy);
  polygon(ctx, [p(bx, by, bz), p(bx + dx, by, bz), p(bx + dx, by, bz + dz), p(bx, by, bz + dz)], cRight, border);
  polygon(ctx, [p(bx, by, bz), p(bx, by + dy, bz), p(bx, by + dy, bz + dz), p(bx, by, bz + dz)], cLeft, border);
  polygon(ctx, [p(bx, by, bz + dz), p(bx + dx, by, bz + dz), p(bx + dx, by + dy, bz + dz), p(bx, by + dy, bz + dz)], cTop, border);
}

interface PlantPart {
  id: string;
  label: string;
  wx: number;
  wy: number;
  wz: number;
  dx: number;
  dy: number;
  dz: number;
  color: string;
  depth: number;
  description: string;
}

const PARTS: PlantPart[] = [
  { id: 'containment', label: 'Contencion', wx: 0, wy: 0.8, wz: 0, dx: 2.8, dy: 2.8, dz: 3.5, color: '#2a4c68', depth: 0, description: 'Estructura principal de contencion.' },
  { id: 'core', label: 'Nucleo', wx: 0.8, wy: 1.5, wz: 0.2, dx: 1.2, dy: 1.2, dz: 2.2, color: '#f59e0b', depth: 1, description: 'Zona activa de fision.' },
  { id: 'steam', label: 'Generador Vapor', wx: 3.5, wy: 1.2, wz: 0, dx: 1.2, dy: 1.0, dz: 2.6, color: '#0ea5e9', depth: 2, description: 'Intercambiador de calor primario-secundario.' },
  { id: 'turbine', label: 'Turbina', wx: 5.2, wy: 1.0, wz: 0, dx: 1.5, dy: 1.0, dz: 1.2, color: '#22c55e', depth: 3, description: 'Conversion de vapor en trabajo mecanico.' },
  { id: 'generator', label: 'Generador', wx: 7.0, wy: 0.9, wz: 0, dx: 1.3, dy: 1.0, dz: 1.1, color: '#fb923c', depth: 4, description: 'Conversion mecanica a electrica.' },
  { id: 'cooling', label: 'Torre', wx: 8.8, wy: 2.1, wz: 0, dx: 1.6, dy: 1.6, dz: 4.5, color: '#475569', depth: 5, description: 'Disipacion termica en circuito de enfriamiento.' },
];

const PIPE_CONNECTIONS: [string, string, string][] = [
  ['containment', 'steam', 'rgba(56,189,248,0.75)'],
  ['steam', 'turbine', 'rgba(34,211,238,0.8)'],
  ['turbine', 'generator', 'rgba(162,255,64,0.8)'],
  ['generator', 'cooling', 'rgba(251,146,60,0.8)'],
];

interface Camera {
  ox: number;
  oy: number;
  s: number;
  tOx: number;
  tOy: number;
  tS: number;
}

export default function ReactorPlant3D() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);
  const camRef = useRef<Camera>({ ox: 0, oy: 0, s: BASE_S, tOx: 0, tOy: 0, tS: BASE_S });
  const boundsRef = useRef<Map<string, [number, number, number, number]>>(new Map());

  const [selected, setSelected] = useState<PlantPart | null>(null);
  const [hovered, setHovered] = useState<string | null>(null);

  const getPartCenter = useCallback((part: PlantPart) => {
    return {
      x: part.wx + part.dx / 2,
      y: part.wy + part.dy / 2,
      z: part.wz + part.dz * 0.6,
    };
  }, []);

  const resetCam = useCallback((w: number, h: number) => {
    camRef.current.tS = BASE_S;
    const [px, py] = iso(4.2, 2.0, 1.3, BASE_S);
    camRef.current.tOx = w / 2 - px;
    camRef.current.tOy = h * 0.44 - py;
  }, []);

  const focusPart = useCallback((p: PlantPart, w: number, h: number) => {
    const s = BASE_S * 2.1;
    const [px, py] = iso(p.wx + p.dx / 2, p.wy + p.dy / 2, p.wz + p.dz / 2, s);
    camRef.current.tOx = w / 2 - px;
    camRef.current.tOy = h / 2 - py;
    camRef.current.tS = s;
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      resetCam(rect.width, rect.height);
    };

    resize();
    window.addEventListener('resize', resize);

    const draw = () => {
      const rect = canvas.getBoundingClientRect();
      const w = rect.width;
      const h = rect.height;
      const t = performance.now() * 0.001;

      const cam = camRef.current;
      cam.ox += (cam.tOx - cam.ox) * 0.09;
      cam.oy += (cam.tOy - cam.oy) * 0.09;
      cam.s += (cam.tS - cam.s) * 0.09;

      ctx.clearRect(0, 0, w, h);
      ctx.fillStyle = '#020c18';
      ctx.fillRect(0, 0, w, h);

      for (let gx = -2; gx <= 14; gx++) {
        for (let gy = -2; gy <= 9; gy++) {
          const [sx, sy] = toScreen(gx, gy, 0, cam.s, cam.ox, cam.oy);
          ctx.beginPath();
          ctx.arc(sx, sy, 0.9, 0, Math.PI * 2);
          ctx.fillStyle = 'rgba(34,211,238,0.12)';
          ctx.fill();
        }
      }

      const sorted = [...PARTS].sort((a, b) => a.depth - b.depth);
      const bounds = new Map<string, [number, number, number, number]>();

      PIPE_CONNECTIONS.forEach(([fromId, toId, color], idx) => {
        const from = PARTS.find((p) => p.id === fromId);
        const to = PARTS.find((p) => p.id === toId);
        if (!from || !to) return;

        const a = getPartCenter(from);
        const b = getPartCenter(to);
        const [ax, ay] = toScreen(a.x, a.y, a.z, cam.s, cam.ox, cam.oy);
        const [bx, by] = toScreen(b.x, b.y, b.z, cam.s, cam.ox, cam.oy);

        ctx.beginPath();
        ctx.moveTo(ax, ay);
        ctx.lineTo(bx, by);
        ctx.strokeStyle = 'rgba(34,211,238,0.2)';
        ctx.lineWidth = 3;
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(ax, ay);
        ctx.lineTo(bx, by);
        ctx.strokeStyle = color;
        ctx.setLineDash([5, 7]);
        ctx.lineDashOffset = -(t * 60 + idx * 20);
        ctx.lineWidth = 1.4;
        ctx.stroke();
        ctx.setLineDash([]);

        for (let i = 0; i < 3; i++) {
          const u = ((t * 0.45 + i * 0.26 + idx * 0.08) % 1 + 1) % 1;
          const px = ax + (bx - ax) * u;
          const py = ay + (by - ay) * u;
          ctx.beginPath();
          ctx.arc(px, py, 2.2, 0, Math.PI * 2);
          ctx.fillStyle = color;
          ctx.fill();
          ctx.beginPath();
          ctx.arc(px, py, 5.2, 0, Math.PI * 2);
          ctx.fillStyle = color.replace('0.8)', '0.15)').replace('0.75)', '0.15)');
          ctx.fill();
        }
      });

      sorted.forEach((part) => {
        const isHot = selected?.id === part.id || hovered === part.id;
        const top = isHot ? '#a2ff40' : part.color;
        const left = isHot ? '#74b818' : part.color;
        const right = isHot ? '#518b11' : '#0f2740';
        const border = isHot ? 'rgba(162,255,64,0.9)' : 'rgba(34,211,238,0.3)';

        drawBox(ctx, part.wx, part.wy, part.wz, part.dx, part.dy, part.dz, top, left, right, cam.s, cam.ox, cam.oy, border);

        const pulse = 0.5 + 0.5 * Math.sin(t * 2 + part.depth);
        if (part.id === 'core' || part.id === 'turbine' || part.id === 'generator') {
          const c = getPartCenter(part);
          const [cx, cy] = toScreen(c.x, c.y, c.z + 0.2, cam.s, cam.ox, cam.oy);
          ctx.beginPath();
          ctx.arc(cx, cy, 8 + pulse * 4, 0, Math.PI * 2);
          ctx.fillStyle = part.id === 'core' ? 'rgba(251,191,36,0.2)' : 'rgba(162,255,64,0.16)';
          ctx.fill();
        }

        const [lx, ly] = toScreen(part.wx + part.dx / 2, part.wy + part.dy / 2, part.wz + part.dz + 0.2, cam.s, cam.ox, cam.oy);
        ctx.font = `${Math.max(9, cam.s * 0.2)}px Orbitron`;
        ctx.fillStyle = isHot ? '#a2ff40' : 'rgba(200,232,240,0.75)';
        ctx.textAlign = 'center';
        ctx.fillText(part.label, lx, ly);

        const [a0x, a0y] = toScreen(part.wx, part.wy, part.wz, cam.s, cam.ox, cam.oy);
        const [a1x, a1y] = toScreen(part.wx + part.dx, part.wy + part.dy, part.wz + part.dz, cam.s, cam.ox, cam.oy);
        bounds.set(part.id, [Math.min(a0x, a1x) - cam.s * 0.6, Math.min(a0y, a1y) - cam.s, Math.max(a0x, a1x) + cam.s * 0.6, Math.max(a0y, a1y) + cam.s]);
      });

      boundsRef.current = bounds;
      animRef.current = requestAnimationFrame(draw);
    };

    animRef.current = requestAnimationFrame(draw);
    return () => {
      cancelAnimationFrame(animRef.current);
      window.removeEventListener('resize', resize);
    };
  }, [focusPart, hovered, resetCam, selected]);

  const handleClick = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      const rect = e.currentTarget.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      let found: PlantPart | null = null;
      for (const part of [...PARTS].reverse()) {
        const b = boundsRef.current.get(part.id);
        if (b && x >= b[0] && x <= b[2] && y >= b[1] && y <= b[3]) {
          found = part;
          break;
        }
      }
      if (found) {
        setSelected(found);
        focusPart(found, rect.width, rect.height);
      } else {
        setSelected(null);
        resetCam(rect.width, rect.height);
      }
    },
    [focusPart, resetCam],
  );

  const handleMove = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    let found: string | null = null;
    for (const part of [...PARTS].reverse()) {
      const b = boundsRef.current.get(part.id);
      if (b && x >= b[0] && x <= b[2] && y >= b[1] && y <= b[3]) {
        found = part.id;
        break;
      }
    }
    setHovered(found);
  }, []);

  return (
    <div className="space-y-4">
      <div className="relative overflow-hidden border border-navy-border bg-navy-mid/80">
        <canvas
          ref={canvasRef}
          className="h-[560px] w-full"
          onClick={handleClick}
          onMouseMove={handleMove}
          onMouseLeave={() => setHovered(null)}
          style={{ cursor: hovered ? 'pointer' : 'crosshair' }}
        />

        {selected && (
          <div className="absolute right-3 top-12 w-[300px] border border-navy-border bg-navy-deep/95 p-3">
            <div className="mb-2 flex items-start justify-between border-b border-navy-border pb-2">
              <h3 className="font-display text-sm font-bold text-white">{selected.label}</h3>
              <button onClick={() => setSelected(null)} className="text-[#7a9ab0] hover:text-white">
                <X size={16} />
              </button>
            </div>
            <p className="text-xs leading-relaxed text-[#7a9ab0]">{selected.description}</p>
          </div>
        )}

        <div className="absolute left-3 top-3 w-[290px] border border-navy-border bg-navy-deep/90 p-3">
          <div className="mb-2 flex items-center justify-between border-b border-navy-border pb-2">
            <h3 className="font-display text-xs font-bold uppercase tracking-widest text-[#c8e8f0]">Mapa de planta 3D</h3>
            <span className="font-mono-tech text-[10px] text-reactor">LIVE</span>
          </div>
          <div className="space-y-1.5">
            {PARTS.map((part) => {
              const active = selected?.id === part.id || hovered === part.id;
              return (
                <div key={part.id} className={`flex items-center justify-between border px-2 py-1.5 ${active ? 'border-reactor/60 bg-reactor/10' : 'border-navy-border bg-navy-mid/40'}`}>
                  <span className="font-body text-xs text-[#c8e8f0]">{part.label}</span>
                  <span className="font-mono-tech text-[10px] uppercase" style={{ color: part.color }}>{active ? 'Activo' : 'Nominal'}</span>
                </div>
              );
            })}
          </div>
          <div className="mt-2 border border-navy-border bg-navy-mid/40 px-2 py-1.5 font-mono-tech text-[10px] text-[#7a9ab0]">
            Click en un modulo para enfocar camara y ver detalle.
          </div>
        </div>

        <div className="absolute bottom-3 left-3 w-[260px] border border-navy-border bg-navy-deep/90 p-2.5">
          <div className="mb-1 flex items-center justify-between">
            <span className="hud-label">Flujo termico</span>
            <span className="font-mono-tech text-xs text-critical">Nucleo {'->'} Vapor</span>
          </div>
          <div className="h-2 overflow-hidden bg-navy-light/70">
            <div className="h-full bg-gradient-to-r from-amber to-critical" style={{ width: '78%' }} />
          </div>
          <div className="mt-2 mb-1 flex items-center justify-between">
            <span className="hud-label">Salida electrica</span>
            <span className="font-mono-tech text-xs text-reactor">Generador {'->'} Red</span>
          </div>
          <div className="h-2 overflow-hidden bg-navy-light/70">
            <div className="h-full bg-gradient-to-r from-cyan to-reactor" style={{ width: '64%' }} />
          </div>
        </div>

        <div className="absolute bottom-3 right-3 flex flex-col gap-1">
          <button
            onClick={() => {
              camRef.current.tS = Math.min(BASE_S * 3, camRef.current.tS * 1.25);
            }}
            className="flex h-8 w-8 items-center justify-center border border-navy-border bg-navy-deep/80 text-[#22d3ee]"
          >
            <ZoomIn size={14} />
          </button>
          <button
            onClick={() => {
              camRef.current.tS = Math.max(BASE_S * 0.5, camRef.current.tS * 0.8);
            }}
            className="flex h-8 w-8 items-center justify-center border border-navy-border bg-navy-deep/80 text-[#22d3ee]"
          >
            <ZoomOut size={14} />
          </button>
          <button
            onClick={() => {
              const canvas = canvasRef.current;
              if (!canvas) return;
              const rect = canvas.getBoundingClientRect();
              setSelected(null);
              resetCam(rect.width, rect.height);
            }}
            className="flex h-8 w-8 items-center justify-center border border-navy-border bg-navy-deep/80 text-[#22d3ee]"
          >
            <RotateCcw size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}
