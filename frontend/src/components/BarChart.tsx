import { useEffect, useMemo, useState } from 'react';

export interface BarGroup {
  label: string;
  value: number;
  color: string;
}

interface BarChartProps {
  data: BarGroup[];
  xLabel: string;
  yLabel: string;
  height?: number;
  yLog?: boolean;
}

const W = 760;
const PADDING = { top: 20, right: 16, bottom: 44, left: 56 };

export default function BarChart({
  data,
  xLabel,
  yLabel,
  height = 280,
  yLog = false,
}: BarChartProps) {
  const [phase, setPhase] = useState(0);
  const H = height;
  const plotW = W - PADDING.left - PADDING.right;
  const plotH = H - PADDING.top - PADDING.bottom;

  useEffect(() => {
    let raf = 0;
    const tick = (t: number) => {
      setPhase((t * 0.0007) % 1);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  const { yTicks, bars } = useMemo(() => {
    const maxVal = Math.max(1, ...data.map((d) => d.value));

    const transform = (v: number): number => {
      if (yLog) {
        return v <= 0 ? 0 : Math.log10(v + 1) / Math.log10(maxVal + 1);
      }
      return v / maxVal;
    };

    const n = Math.max(1, data.length);
    const barW = (plotW / n) * 0.6;
    const gap = (plotW / n) * 0.4;

    const bars = data.map((d, i) => {
      const x = PADDING.left + i * (barW + gap) + gap / 2;
      const h = transform(d.value) * plotH;
      const y = PADDING.top + plotH - h;
      return { ...d, x, y, w: barW, h };
    });

    const yTickCount = 5;
    const yTicks: { y: number; label: string }[] = [];
    for (let i = 0; i <= yTickCount; i++) {
      const frac = i / yTickCount;
      const v = yLog ? Math.pow(10, frac * Math.log10(maxVal + 1)) - 1 : frac * maxVal;
      const y = PADDING.top + plotH - frac * plotH;
      const label = v >= 1000 ? `${(v / 1000).toFixed(1)}k` : v.toFixed(v < 10 ? 1 : 0);
      yTicks.push({ y, label });
    }

    return { yTicks, bars };
  }, [data, yLog, plotW, plotH]);

  return (
    <div className="w-full">
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" preserveAspectRatio="xMidYMid meet">
        {yTicks.map((t, i) => (
          <g key={i}>
            <line
              x1={PADDING.left}
              y1={t.y}
              x2={W - PADDING.right}
              y2={t.y}
              stroke="rgba(34,211,238,0.1)"
              strokeDasharray="2 4"
            />
            <text
              x={PADDING.left - 8}
              y={t.y + 4}
              textAnchor="end"
              className="font-mono-tech"
              fontSize="10"
              fill="rgba(214,243,255,0.55)"
            >
              {t.label}
            </text>
          </g>
        ))}

        <line x1={PADDING.left} y1={PADDING.top} x2={PADDING.left} y2={PADDING.top + plotH} stroke="rgba(34,211,238,0.35)" />
        <line x1={PADDING.left} y1={PADDING.top + plotH} x2={W - PADDING.right} y2={PADDING.top + plotH} stroke="rgba(34,211,238,0.35)" />

        {bars.map((b, i) => (
          <g key={i}>
            <rect
              x={b.x}
              y={b.y}
              width={b.w}
              height={Math.max(0, b.h)}
              fill={b.color}
              opacity={0.65 + 0.25 * Math.sin(phase * Math.PI * 2 + i * 0.55)}
              rx={2}
              style={{ filter: `drop-shadow(0 0 6px ${b.color}88)` }}
            />
            <rect
              x={b.x}
              y={b.y}
              width={b.w}
              height={Math.max(0, b.h)}
              fill="url(#bar-shine)"
              opacity="0.35"
              rx={2}
            />
            <text
              x={b.x + b.w / 2}
              y={PADDING.top + plotH + 16}
              textAnchor="middle"
              className="font-mono-tech"
              fontSize="10"
              fill="rgba(214,243,255,0.65)"
            >
              {b.label}
            </text>
          </g>
        ))}

        <text
          x={14}
          y={H / 2}
          textAnchor="middle"
          transform={`rotate(-90 14 ${H / 2})`}
          className="font-display"
          fontSize="10"
          fill="rgba(34,211,238,0.7)"
        >
          {yLabel}
        </text>
        <text
          x={W / 2}
          y={H - 6}
          textAnchor="middle"
          className="font-display"
          fontSize="10"
          fill="rgba(34,211,238,0.7)"
        >
          {xLabel}
        </text>

        <defs>
          <linearGradient id="bar-shine" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="rgba(255,255,255,0.25)" />
            <stop offset="50%" stopColor="rgba(255,255,255,0.02)" />
            <stop offset="100%" stopColor="rgba(255,255,255,0.18)" />
          </linearGradient>
        </defs>

        <rect
          x={PADDING.left + (plotW + 40) * phase - 40}
          y={PADDING.top}
          width="40"
          height={plotH}
          fill="rgba(34,211,238,0.08)"
          style={{ mixBlendMode: 'screen' }}
        />
      </svg>
    </div>
  );
}
