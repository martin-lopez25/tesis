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
const PADDING = { top: 20, right: 16, bottom: 40, left: 56 };

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
      const label = v >= 1000 ? `${(v / 1000).toFixed(1)}k` : v.toFixed(v < 10 ? 1 : 0);
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
      const shiftedPhase = (phase + idx * 0.18) % 1;
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
    <div className="w-full">
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" preserveAspectRatio="xMidYMid meet">
        {yTicks.map((t, i) => (
          <g key={`y${i}`}>
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

        {xTicks.map((t, i) => (
          <g key={`x${i}`}>
            <line x1={t.x} y1={PADDING.top + plotH} x2={t.x} y2={PADDING.top + plotH + 4} stroke="rgba(34,211,238,0.35)" />
            <text
              x={t.x}
              y={PADDING.top + plotH + 16}
              textAnchor="middle"
              className="font-mono-tech"
              fontSize="10"
              fill="rgba(214,243,255,0.55)"
            >
              {t.label}
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

        {paths.map((s, i) => (
          <g key={i}>
            <path
              d={s.d}
              fill="none"
              stroke={s.color}
              strokeWidth="2"
              strokeLinejoin="round"
              strokeLinecap="round"
              strokeDasharray={s.dashed ? '5 4' : undefined}
              style={{ filter: `drop-shadow(0 0 4px ${s.color}88)` }}
            />
            <path
              d={s.d}
              fill="none"
              stroke={s.color}
              strokeWidth="1.4"
              strokeLinecap="round"
              strokeDasharray="8 14"
              strokeDashoffset={`${-phase * 120}`}
              opacity="0.75"
            />
          </g>
        ))}

        {markers.map((m, i) => (
          <g key={`marker-${i}`}>
            <circle cx={m.x} cy={m.y} r="7" fill={m.color} opacity="0.2" />
            <circle cx={m.x} cy={m.y} r="3" fill={m.color} opacity="0.95" />
          </g>
        ))}

        {showLegend && (
          <g transform={`translate(${PADDING.left + 4}, ${PADDING.top + 2})`}>
            {series.map((s, i) => (
              <g key={i} transform={`translate(${i * 140}, 0)`}>
                <line x1={0} y1={6} x2={18} y2={6} stroke={s.color} strokeWidth="2.5" />
                <text x={24} y={9} className="font-mono-tech" fontSize="10" fill="rgba(214,243,255,0.8)">
                  {s.name}
                </text>
              </g>
            ))}
          </g>
        )}
      </svg>
    </div>
  );
}
