import { useState, useEffect, useRef, useCallback } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  Zap,
  Thermometer,
  Droplets,
  Gauge,
  Factory,
  Radio,
  Power,
  Activity,
  Flame,
  Wind,
  LayoutGrid,
  Box,
  Atom,
} from 'lucide-react';
import Panel from '../components/Panel';
import Slider from '../components/Slider';
import StatCard from '../components/StatCard';
import { computeReactorState, formatNumber, type ReactorParams } from '../lib/physics';
import ReactorPlant3D from './ReactorPlant3D';

interface FlowParticle {
  stage: number;
  t: number;
  speed: number;
  color: string;
  size: number;
}

const STAGE_CENTERS = [
  { x: 95, y: 180 },
  { x: 235, y: 180 },
  { x: 375, y: 180 },
  { x: 515, y: 180 },
  { x: 515, y: 340 },
  { x: 375, y: 340 },
  { x: 235, y: 340 },
];

const PIPE_PATHS: [number, number][] = [
  [0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [5, 6],
];

const STAGE_META = [
  { name: 'Fision', icon: Flame, color: 'rgb(239 68 68)' },
  { name: 'Nucleo', icon: Atom, color: 'rgb(251 191 36)' },
  { name: 'Refrigerante', icon: Droplets, color: 'rgb(56 189 248)' },
  { name: 'Vapor', icon: Wind, color: 'rgb(34 211 238)' },
  { name: 'Turbina', icon: Factory, color: 'rgb(162 255 64)' },
  { name: 'Generador', icon: Zap, color: 'rgb(251 146 60)' },
  { name: 'Red electrica', icon: Power, color: 'rgb(34 211 238)' },
];

const DEFAULT_PARAMS: ReactorParams = {
  controlRods: 50,
  enrichment: 4.5,
  coolantFlow: 1200,
  turbineEfficiency: 0.85,
};

const STATUS_STYLES: Record<string, { color: string; border: string; bg: string; label: string }> = {
  parada: { color: 'text-[#7a9ab0]', border: 'border-[#7a9ab0]/40', bg: 'bg-[#7a9ab0]/5', label: 'PARADA' },
  arranque: { color: 'text-cyan', border: 'border-cyan/40', bg: 'bg-cyan/5', label: 'ARRANQUE' },
  operacion: { color: 'text-reactor', border: 'border-reactor/40', bg: 'bg-reactor/5', label: 'OPERACION' },
  'potencia maxima': { color: 'text-amber', border: 'border-amber/40', bg: 'bg-amber/5', label: 'POTENCIA MAX' },
  emergencia: { color: 'text-critical', border: 'border-critical/40', bg: 'bg-critical/5', label: 'EMERGENCIA' },
};

export default function ReactorSection() {
  const [view, setView] = useState<'diagram' | '3d'>('diagram');
  const [params, setParams] = useState<ReactorParams>(DEFAULT_PARAMS);
  const [running, setRunning] = useState(true);
  const [particles, setParticles] = useState<FlowParticle[]>([]);
  const [tick, setTick] = useState(0);
  const animRef = useRef<number>(0);
  const lastSpawnRef = useRef(0);

  const update = <K extends keyof ReactorParams>(key: K, value: ReactorParams[K]) =>
    setParams((p) => ({ ...p, [key]: value }));

  const reset = () => {
    setParams(DEFAULT_PARAMS);
    setRunning(true);
  };

  const state = computeReactorState(params);
  const statusStyle = STATUS_STYLES[state.status];
  const flowIntensity = Math.min(1, state.thermalPower / 3000);

  useEffect(() => {
    if (!running) return;

    const animate = (time: number) => {
      setTick((t) => t + 1);

      setParticles((prev) => {
        let next = prev
          .map((p) => ({ ...p, t: p.t + p.speed * flowIntensity }))
          .filter((p) => p.t < 1);

        next = next.flatMap((p) => {
          if (p.t >= 1) {
            if (p.stage < 5) {
              return [{ ...p, stage: p.stage + 1, t: 0, color: STAGE_META[p.stage + 1].color }];
            }
            return [];
          }
          return [p];
        });

        if (time - lastSpawnRef.current > Math.max(150, 600 - flowIntensity * 500)) {
          lastSpawnRef.current = time;
          if (flowIntensity > 0.01) {
            const count = 1 + Math.floor(flowIntensity * 2);
            for (let i = 0; i < count; i++) {
              next.push({
                stage: 0,
                t: Math.random() * 0.1,
                speed: 0.008 + Math.random() * 0.006,
                color: STAGE_META[0].color,
                size: 2.5 + Math.random() * 2,
              });
            }
          }
        }

        return next.slice(-80);
      });

      animRef.current = requestAnimationFrame(animate);
    };

    animRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animRef.current);
  }, [running, flowIntensity]);

  const getParticlePos = useCallback((stage: number, t: number) => {
    const [from, to] = PIPE_PATHS[stage] ?? [stage, stage + 1];
    const a = STAGE_CENTERS[from];
    const b = STAGE_CENTERS[to];
    if (!b) return a;
    return { x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t };
  }, []);

  const turbineRotation = (tick * flowIntensity * 6) % 360;
  const generatorRotation = (tick * flowIntensity * 5) % 360;

  return (
    <div className="animate-fade-up space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="flex flex-col items-end gap-2">
          <div className="flex border border-navy-border">
            <button
              onClick={() => setView('diagram')}
              className={`flex items-center gap-1.5 px-3 py-1.5 font-display text-[10px] font-bold uppercase tracking-widest transition-all ${
                view === 'diagram' ? 'bg-reactor/10 text-reactor' : 'text-[#7a9ab0] hover:text-cyan'
              }`}
            >
              <LayoutGrid size={12} /> DIAGRAMA
            </button>
            <button
              onClick={() => setView('3d')}
              className={`flex items-center gap-1.5 border-l border-navy-border px-3 py-1.5 font-display text-[10px] font-bold uppercase tracking-widest transition-all ${
                view === '3d' ? 'bg-reactor/10 text-reactor' : 'text-[#7a9ab0] hover:text-cyan'
              }`}
            >
              <Box size={12} /> VISTA 3D
            </button>
          </div>
          <div className={`flex items-center gap-2 border ${statusStyle.border} ${statusStyle.bg} px-3 py-1.5`}>
            <span className={`h-2 w-2 rounded-full bg-current animate-pulse-reactor ${statusStyle.color}`} />
            <span className={`font-display text-sm font-bold uppercase tracking-widest ${statusStyle.color}`}>
              {statusStyle.label}
            </span>
          </div>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-[320px_1fr]">
        <div className="space-y-4">
          <Panel title="Controles del reactor" badge="INPUT" accent="reactor">
            <div className="space-y-4">
              <Slider
                label="Barras de control"
                value={params.controlRods}
                min={0}
                max={100}
                step={1}
                display={(v) => `${v}%`}
                unit=""
                onChange={(v) => update('controlRods', v)}
              />
              <div className="border border-navy-border bg-navy-deep/50 px-3 py-2 text-xs text-[#7a9ab0]">
                <span className="hud-label">Barras insertadas {'->'} </span>
                <span className="text-cyan">absorben neutrones y reducen potencia</span>
              </div>
              <Slider
                label="Enriquecimiento U-235"
                value={params.enrichment}
                min={0.5}
                max={20}
                step={0.1}
                display={(v) => v.toFixed(1)}
                unit="%"
                onChange={(v) => update('enrichment', v)}
                accent="amber"
              />
              <Slider
                label="Caudal refrigerante"
                value={params.coolantFlow}
                min={100}
                max={3000}
                step={50}
                display={(v) => v.toFixed(0)}
                unit=" kg/s"
                onChange={(v) => update('coolantFlow', v)}
                accent="cyan"
              />
              <Slider
                label="Eficiencia turbina"
                value={params.turbineEfficiency}
                min={0.3}
                max={0.98}
                step={0.01}
                display={(v) => `${(v * 100).toFixed(0)}%`}
                unit=""
                onChange={(v) => update('turbineEfficiency', v)}
              />

              <div className="flex gap-2 pt-2">
                <button onClick={() => setRunning((r) => !r)} className="btn-primary flex-1">
                  {running ? <><Pause size={16} /> PAUSAR</> : <><Play size={16} /> REANUDAR</>}
                </button>
                <button onClick={reset} className="btn-ghost">
                  <RotateCcw size={14} />
                </button>
              </div>
            </div>
          </Panel>

          <Panel title="Telemetria del reactor" badge="LIVE" accent="cyan">
            <div className="grid grid-cols-2 gap-2">
              <StatCard label="k-efectivo" value={formatNumber(state.kEff, 3)} sublabel={state.kEff < 0.98 ? 'subcritico' : state.kEff > 1.02 ? 'supercritico' : 'critico'} accent={state.kEff > 1.02 ? 'critical' : state.kEff >= 0.98 ? 'reactor' : 'cyan'} icon={<Activity size={14} />} />
              <StatCard label="Potencia termica" value={formatNumber(state.thermalPower, 0)} sublabel="MWth" accent="critical" icon={<Flame size={14} />} />
              <StatCard label="Temp. nucleo" value={`${formatNumber(state.coreTemperature, 0)}°`} sublabel="°C" accent="amber" icon={<Thermometer size={14} />} />
              <StatCard label="Temp. vapor" value={`${formatNumber(state.steamTemperature, 0)}°`} sublabel="°C" accent="cyan" icon={<Thermometer size={14} />} />
              <StatCard label="Presion vapor" value={formatNumber(state.steamPressure, 0)} sublabel="bar" accent="cyan" icon={<Gauge size={14} />} />
              <StatCard label="Potencia electrica" value={formatNumber(state.electricalPower, 0)} sublabel="MWe" accent="reactor" icon={<Zap size={14} />} />
            </div>
            <div className="mt-2 space-y-1 border border-navy-border bg-navy-deep/50 px-3 py-2">
              <div className="flex justify-between">
                <span className="hud-label">Eficiencia global: </span>
                <span className="font-mono-tech text-xs text-reactor">{formatNumber(state.overallEfficiency, 1)}%</span>
              </div>
              <div className="flex justify-between">
                <span className="hud-label">Tasa de fision: </span>
                <span className="font-mono-tech text-xs text-critical">
                  {state.fissionRate > 0 ? `${formatNumber(state.fissionRate / 1e18, 2)} x10^18/s` : '0'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="hud-label">Energia/fision: </span>
                <span className="font-mono-tech text-xs text-amber">{state.energyPerFission} MeV</span>
              </div>
            </div>
          </Panel>
        </div>

        <div className="space-y-4">
          {view === '3d' ? (
            <ReactorPlant3D />
          ) : (
            <>
              <Panel title="Esquema del ciclo energetico" badge="FLOW" accent="reactor" className="overflow-hidden">
                <svg viewBox="0 0 620 440" className="w-full" style={{ background: '#020c18' }}>
                  <defs>
                    <radialGradient id="core-glow" cx="50%" cy="50%" r="50%">
                      <stop offset="0%" stopColor="rgba(251,191,36,0.6)" />
                      <stop offset="100%" stopColor="rgba(251,191,36,0)" />
                    </radialGradient>
                    <radialGradient id="fission-glow" cx="50%" cy="50%" r="50%">
                      <stop offset="0%" stopColor="rgba(239,68,68,0.6)" />
                      <stop offset="100%" stopColor="rgba(239,68,68,0)" />
                    </radialGradient>
                    <marker id="flow-arrow" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
                      <path d="M0,0 L6,3 L0,6 z" fill="rgba(34,211,238,0.4)" />
                    </marker>
                  </defs>

                  {Array.from({ length: 22 }).map((_, i) => (
                    <line key={`gh${i}`} x1={0} y1={i * 20} x2={620} y2={i * 20} stroke="rgba(34,211,238,0.04)" />
                  ))}
                  {Array.from({ length: 31 }).map((_, i) => (
                    <line key={`gv${i}`} x1={i * 20} y1={0} x2={i * 20} y2={440} stroke="rgba(34,211,238,0.04)" />
                  ))}

                  {PIPE_PATHS.map(([from, to], i) => {
                    const a = STAGE_CENTERS[from];
                    const b = STAGE_CENTERS[to];
                    return (
                      <line key={`pipe${i}`} x1={a.x + 30} y1={a.y} x2={b.x - 30} y2={b.y} stroke="rgba(34,211,238,0.2)" strokeWidth="3" strokeDasharray="4 4" markerEnd="url(#flow-arrow)" />
                    );
                  })}

                  <rect x={195} y={120} width={80} height={120} rx={6} fill="none" stroke="rgba(251,191,36,0.3)" strokeWidth="1.5" />
                  <rect x={205} y={130} width={60} height={100} rx={4} fill="url(#core-glow)" opacity={0.3 + flowIntensity * 0.5} />

                  {Array.from({ length: 5 }).map((_, i) => {
                    const rodInsertion = (100 - params.controlRods) / 100;
                    const rodY = 120 + rodInsertion * 60 + i * 8;
                    return (
                      <line key={`rod${i}`} x1={210 + i * 12} y1={120} x2={210 + i * 12} y2={rodY} stroke="rgba(120,120,140,0.8)" strokeWidth="3" />
                    );
                  })}

                  {particles.map((p, i) => {
                    const pos = getParticlePos(p.stage, p.t);
                    return (
                      <g key={i}>
                        <circle cx={pos.x} cy={pos.y} r={p.size * 3} fill={p.color} opacity={0.2} />
                        <circle cx={pos.x} cy={pos.y} r={p.size} fill={p.color} opacity={0.9} />
                      </g>
                    );
                  })}

                  {STAGE_CENTERS.map((c, i) => {
                    const meta = STAGE_META[i];
                    const isActive = state.thermalPower > 1;
                    const nodeSize = 26;
                    return (
                      <g key={`node${i}`}>
                        {isActive && <circle cx={c.x} cy={c.y} r={nodeSize + 8} fill={meta.color} opacity={0.08} />}
                        <circle cx={c.x} cy={c.y} r={nodeSize} fill="rgba(2,12,24,0.9)" stroke={meta.color} strokeWidth="2" opacity={isActive ? 1 : 0.4} />
                        <text x={c.x} y={c.y - nodeSize - 8} textAnchor="middle" className="font-mono-tech" fontSize="9" fill={meta.color} opacity={0.8}>
                          {String(i + 1).padStart(2, '0')}
                        </text>
                        <text x={c.x} y={c.y + nodeSize + 14} textAnchor="middle" className="font-display" fontSize="9" fontWeight="700" fill={meta.color}>
                          {meta.name.toUpperCase()}
                        </text>
                      </g>
                    );
                  })}

                  <g transform={`translate(${STAGE_CENTERS[4].x}, ${STAGE_CENTERS[4].y}) rotate(${turbineRotation})`} opacity={flowIntensity > 0.05 ? 1 : 0.3}>
                    <circle r="14" fill="none" stroke="rgb(162 255 64)" strokeWidth="1.5" />
                    {[0, 45, 90, 135, 180, 225, 270, 315].map((a) => {
                      const rad = (a * Math.PI) / 180;
                      return <line key={a} x1={Math.cos(rad) * 4} y1={Math.sin(rad) * 4} x2={Math.cos(rad) * 13} y2={Math.sin(rad) * 13} stroke="rgb(162 255 64)" strokeWidth="2" />;
                    })}
                    <circle r="3" fill="rgb(162 255 64)" />
                  </g>

                  <g transform={`translate(${STAGE_CENTERS[5].x}, ${STAGE_CENTERS[5].y}) rotate(${generatorRotation})`} opacity={flowIntensity > 0.05 ? 1 : 0.3}>
                    <circle r="14" fill="none" stroke="rgb(251 146 60)" strokeWidth="1.5" />
                    {[0, 60, 120, 180, 240, 300].map((a) => {
                      const rad = (a * Math.PI) / 180;
                      return <line key={a} x1={Math.cos(rad) * 3} y1={Math.sin(rad) * 3} x2={Math.cos(rad) * 12} y2={Math.sin(rad) * 12} stroke="rgb(251 146 60)" strokeWidth="2" />;
                    })}
                    <circle r="3" fill="rgb(251 146 60)" />
                  </g>

                  <circle cx={STAGE_CENTERS[1].x} cy={STAGE_CENTERS[1].y} r={18 + Math.sin(tick * 0.1) * 3 * flowIntensity} fill="url(#fission-glow)" opacity={flowIntensity} />
                  <circle cx={STAGE_CENTERS[0].x} cy={STAGE_CENTERS[0].y} r={16 + Math.sin(tick * 0.12 + 1) * 4 * flowIntensity} fill="url(#fission-glow)" opacity={flowIntensity} />
                </svg>
              </Panel>

              <Panel title="Cadena de transformacion energetica" badge="PIPELINE" accent="amber">
                <div className="grid gap-2 sm:grid-cols-2">
                  {STAGE_META.map((meta, i) => {
                    const Icon = meta.icon;
                    const active = state.thermalPower > 1;
                    return (
                      <div key={i} className={`flex items-start gap-2.5 border p-2.5 transition-all ${active ? 'border-navy-border bg-navy-deep/40' : 'border-[#0e2030]/40 bg-navy-deep/20 opacity-50'}`}>
                        <div className="flex h-7 w-7 shrink-0 items-center justify-center border" style={{ borderColor: `${meta.color}40`, backgroundColor: `${meta.color}15` }}>
                          <Icon size={14} style={{ color: meta.color }} />
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-baseline gap-1.5">
                            <span className="font-mono-tech text-[10px] text-[#7a9ab0]">{String(i + 1).padStart(2, '0')}</span>
                            <span className="font-display text-xs font-bold tracking-wide" style={{ color: meta.color }}>{meta.name}</span>
                          </div>
                          <p className="mt-0.5 font-body text-xs leading-snug text-[#7a9ab0]">
                            {[
                              'U-235 absorbe un neutron y se divide, liberando ~200 MeV y 2-3 neutrones.',
                              'Las barras de combustible sostienen la reaccion en cadena controlada.',
                              'Agua a alta presion extrae el calor del nucleo sin hervir.',
                              'El intercambiador transfiere calor al circuito secundario que produce vapor.',
                              'El vapor a alta presion expande y hace girar la turbina.',
                              'El generador convierte energia mecanica en electrica por induccion.',
                              'Un transformador eleva voltaje para distribucion a la red publica.',
                            ][i]}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </Panel>

              <Panel title="Salida de potencia" badge="OUTPUT" accent="reactor">
                <div className="space-y-3">
                  <div>
                    <div className="mb-1 flex justify-between">
                      <span className="hud-label">Potencia termica (MWth)</span>
                      <span className="font-mono-tech text-sm font-bold text-critical">{formatNumber(state.thermalPower, 0)}</span>
                    </div>
                    <div className="h-3 overflow-hidden bg-navy-light/60">
                      <div className="h-full bg-gradient-to-r from-amber to-critical transition-all duration-300" style={{ width: `${(state.thermalPower / 3200) * 100}%` }} />
                    </div>
                  </div>
                  <div>
                    <div className="mb-1 flex justify-between">
                      <span className="hud-label">Potencia electrica (MWe)</span>
                      <span className="font-mono-tech text-sm font-bold text-reactor">{formatNumber(state.electricalPower, 0)}</span>
                    </div>
                    <div className="h-3 overflow-hidden bg-navy-light/60">
                      <div className="h-full bg-gradient-to-r from-cyan to-reactor transition-all duration-300" style={{ width: `${(state.electricalPower / 1100) * 100}%` }} />
                    </div>
                  </div>
                  <div className="flex items-center justify-between border border-navy-border bg-navy-deep/50 px-3 py-2">
                    <span className="hud-label flex items-center gap-1.5">
                      <Radio size={12} className="text-reactor" /> Conversion termica {'->'} electrica
                    </span>
                    <span className="font-mono-tech text-sm font-bold text-reactor">{formatNumber(state.overallEfficiency, 1)}%</span>
                  </div>
                </div>
              </Panel>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
