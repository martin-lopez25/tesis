import { useEffect, useMemo, useState } from 'react';

export interface LineSeries {
  name: string;
  color: string;
  data: number[];
  dashed?: boolean;
}

interface LineChartProps {
  series: LineSeries[];
  xLabels?: string[];
  xLabel: string;
  yLabel: string;
  height?: number;
  yLog?: boolean;
  yMax?: number;
  showLegend?: boolean;
}

const W = 760;
const PADDING = { top: 20, right: 20, bottom: 44, left: 60 };

export default function LineChart({
  series,
  xLabels,
  xLabel,
  yLabel,
  height = 280,
  yLog = false,
  yMax,
  showLegend = true,
}: LineChartProps) {
  const [phase, setPhase] = useState(0);
  const H = height;
  const plotW = W - PADDING.left - PADDING.right;
  const plotH = H - PADDING.top - PADDING.bottom;

  useEffect(() => {
    let raf = 0;
    const tick = (t: number) => {
      setPhase((t * 0.001) % 1);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  const { yTicks, xTicks, paths, n, xStep, transform } = useMemo(() => {
    const allData = series.flatMap((s) => s.data);
    const rawMax = yMax ?? Math.max(1, ...allData);
    const maxVal = yLog ? Math.max(1, rawMax) : rawMax;

    const transform = (v: number): number => {
      if (yLog) {
        const logVal = v <= 0 ? 0 : Math.log10(v + 1);
        const logMax = Math.log10(maxVal + 1);
        return logVal / logMax;
      }
      return v / maxVal;
    };

    const n = series[0]?.data.length ?? 0;
    const xStep = n > 1 ? plotW / (n - 1) : 0;

    const paths = series.map((s) => {
      let d = '';
      s.data.forEach((v, i) => {
        const x = PADDING.left + i * xStep;
        const y = PADDING.top + plotH - transform(v) * plotH;
        d += `${i === 0 ? 'M' : 'L'}${x.toFixed(1)},${y.toFixed(1)} `;
      });
      return { ...s, d };
    });

    const yTickCount = 5;
    const yTicks: { y: number; label: string }[] = [];
    for (let i = 0; i <= yTickCount; i++) {
      const frac = i / yTickCount;
      const v = yLog ? Math.pow(10, frac * Math.log10(maxVal + 1)) - 1 : frac * maxVal;
      const y = PADDING.top + plotH - frac * plotH;
      const label = v >= 1000 ? `${(v / 1000).toFixed(1)}k` : v.toFixed(v < 10 && v > 0 ? 1 : 0);
      yTicks.push({ y, label });
    }

    const xTickCount = Math.min(8, Math.max(2, n - 1));
    const xTicks: { x: number; label: string }[] = [];
    for (let i = 0; i <= xTickCount; i++) {
      const idx = Math.round((i / xTickCount) * (n - 1));
      const x = PADDING.left + idx * xStep;
      const label = xLabels ? xLabels[idx] : String(idx);
      xTicks.push({ x, label });
    }

    return { yTicks, xTicks, paths, n, xStep, transform };
  }, [series, xLabels, yLog, yMax, plotW, plotH]);

  const markers = useMemo(() => {
    if (!n || n < 2) return [];

    return series.map((s, idx) => {
      const shiftedPhase = (phase + idx * 0.2) % 1;
      const at = shiftedPhase * (n - 1);
      const i0 = Math.floor(at);
      const i1 = Math.min(n - 1, i0 + 1);
      const local = at - i0;

      const v0 = s.data[i0] ?? 0;
      const v1 = s.data[i1] ?? v0;
      const v = v0 + (v1 - v0) * local;

      const x = PADDING.left + at * xStep;
      const y = PADDING.top + plotH - transform(v) * plotH;

      return { color: s.color, x, y };
    });
  }, [series, phase, n, xStep, transform, plotH]);

  return (
    <div className="w-full bg-white rounded-xl border border-slate-border p-3 shadow-sm">
      {showLegend && series.length > 0 && (
        <div className="flex flex-wrap items-center justify-end gap-3 mb-2 px-2 text-xs font-mono-tech">
          {series.map((s) => (
            <div key={s.name} className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: s.color }} />
              <span className="text-graphite font-semibold">{s.name}</span>
            </div>
          ))}
        </div>
      )}

      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" preserveAspectRatio="xMidYMid meet">
        {/* Subtle grid lines */}
        {yTicks.map((t, i) => (
          <g key={`y${i}`}>
            <line
              x1={PADDING.left}
              y1={t.y}
              x2={W - PADDING.right}
              y2={t.y}
              stroke="#E2E8F0"
              strokeDasharray="3 3"
            />
            <text
              x={PADDING.left - 8}
              y={t.y + 4}
              textAnchor="end"
              className="font-mono-tech"
              fontSize="10"
              fill="#64748B"
              fontWeight="500"
            >
              {t.label}
            </text>
          </g>
        ))}

        {/* Axes */}
        <line x1={PADDING.left} y1={PADDING.top} x2={PADDING.left} y2={PADDING.top + plotH} stroke="#CBD5E1" strokeWidth="1.5" />
        <line x1={PADDING.left} y1={PADDING.top + plotH} x2={W - PADDING.right} y2={PADDING.top + plotH} stroke="#CBD5E1" strokeWidth="1.5" />

        {/* X axis ticks */}
        {xTicks.map((t, i) => (
          <g key={`x${i}`}>
            <line x1={t.x} y1={PADDING.top + plotH} x2={t.x} y2={PADDING.top + plotH + 4} stroke="#CBD5E1" strokeWidth="1.5" />
            <text
              x={t.x}
              y={PADDING.top + plotH + 16}
              textAnchor="middle"
              className="font-mono-tech"
              fontSize="10"
              fill="#64748B"
              fontWeight="500"
            >
              {t.label}
            </text>
          </g>
        ))}

        {/* Axis labels */}
        <text
          x={PADDING.left + plotW / 2}
          y={H - 6}
          textAnchor="middle"
          className="font-mono-tech"
          fontSize="11"
          fill="#123B5D"
          fontWeight="600"
        >
          {xLabel}
        </text>

        <text
          x={14}
          y={PADDING.top + plotH / 2}
          textAnchor="middle"
          transform={`rotate(-90 14 ${PADDING.top + plotH / 2})`}
          className="font-mono-tech"
          fontSize="11"
          fill="#123B5D"
          fontWeight="600"
        >
          {yLabel}
        </text>

        {/* Data lines */}
        {paths.map((p) => (
          <path
            key={p.name}
            d={p.d}
            fill="none"
            stroke={p.color}
            strokeWidth="2.5"
            strokeDasharray={p.dashed ? '4 4' : undefined}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        ))}

        {/* Animated tracking markers */}
        {markers.map((m, i) => (
          <g key={i}>
            <circle cx={m.x} cy={m.y} r="5" fill="#FFFFFF" stroke={m.color} strokeWidth="2.5" />
          </g>
        ))}
      </svg>
    </div>
  );
}
