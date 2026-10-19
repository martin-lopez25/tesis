import { useMemo } from 'react';

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
const PADDING = { top: 20, right: 20, bottom: 44, left: 60 };

export default function BarChart({
  data,
  xLabel,
  yLabel,
  height = 280,
  yLog = false,
}: BarChartProps) {
  const H = height;
  const plotW = W - PADDING.left - PADDING.right;
  const plotH = H - PADDING.top - PADDING.bottom;

  const { yTicks, bars } = useMemo(() => {
    const maxVal = Math.max(1, ...data.map((d) => d.value));

    const transform = (v: number): number => {
      if (yLog) {
        return v <= 0 ? 0 : Math.log10(v + 1) / Math.log10(maxVal + 1);
      }
      return v / maxVal;
    };

    const n = Math.max(1, data.length);
    const barW = (plotW / n) * 0.65;
    const gap = (plotW / n) * 0.35;

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
      const label = v >= 1000 ? `${(v / 1000).toFixed(1)}k` : v.toFixed(v < 10 && v > 0 ? 1 : 0);
      yTicks.push({ y, label });
    }

    return { yTicks, bars };
  }, [data, yLog, plotW, plotH]);

  return (
    <div className="w-full bg-white rounded-xl border border-slate-border p-3 shadow-sm">
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

        {/* Bars */}
        {bars.map((b, i) => (
          <g key={i}>
            <rect
              x={b.x}
              y={b.y}
              width={b.w}
              height={Math.max(2, b.h)}
              fill={b.color}
              rx="3"
              ry="3"
            />
            {data.length <= 35 && (
              <text
                x={b.x + b.w / 2}
                y={PADDING.top + plotH + 16}
                textAnchor="middle"
                className="font-mono-tech"
                fontSize={data.length > 20 ? '8' : '10'}
                fill="#64748B"
                fontWeight="500"
              >
                {b.label}
              </text>
            )}
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
      </svg>
    </div>
  );
}
