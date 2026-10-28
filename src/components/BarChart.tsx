import { useEffect, useMemo, useRef, useState } from 'react';

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

const DEFAULT_W = 760;
const PADDING = { top: 20, right: 20, bottom: 44, left: 60 };

export default function BarChart({
  data,
  xLabel,
  yLabel,
  height = 280,
  yLog = false,
}: BarChartProps) {
  const [chartWidth, setChartWidth] = useState(DEFAULT_W);
  const chartRef = useRef<HTMLDivElement | null>(null);
  const W = Math.max(240, Math.min(DEFAULT_W, chartWidth));
  const H = height;
  const plotW = W - PADDING.left - PADDING.right;
  const plotH = H - PADDING.top - PADDING.bottom;

  useEffect(() => {
    const chart = chartRef.current;
    if (!chart || typeof ResizeObserver === 'undefined') return;

    const observer = new ResizeObserver(([entry]) => {
      const nextWidth = Math.floor(entry.contentRect.width);
      if (nextWidth > 0) setChartWidth(nextWidth);
    });
    observer.observe(chart);
    return () => observer.disconnect();
  }, []);

  const { yTicks, bars, labelInterval } = useMemo(() => {
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

    const labelInterval = Math.max(1, Math.ceil(data.length / Math.max(1, Math.floor(plotW / 42))));

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

    return { yTicks, bars, labelInterval };
  }, [data, yLog, plotW, plotH]);

  const xAxisFontSize = Math.min(11, Math.max(8, plotW / Math.max(1, xLabel.length * 0.56)));
  const yAxisFontSize = Math.min(11, Math.max(8, plotH / Math.max(1, yLabel.length * 0.56)));

  return (
    <div ref={chartRef} className="min-w-0 w-full max-w-full bg-white rounded-xl border border-slate-border p-3 shadow-sm">
      <svg viewBox={`0 0 ${W} ${H}`} className="block h-auto w-full max-w-full" preserveAspectRatio="xMidYMid meet">
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
            {data.length <= 35 && (i % labelInterval === 0 || i === data.length - 1) && (
              <text
                x={b.x + b.w / 2}
                y={PADDING.top + plotH + 16}
                textAnchor="middle"
                className="font-mono-tech"
                fontSize={Math.min(data.length > 20 ? 8 : 10, Math.max(7, plotW / Math.max(1, data.length * 1.6)))}
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
          fontSize={xAxisFontSize}
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
          fontSize={yAxisFontSize}
          fill="#123B5D"
          fontWeight="600"
        >
          {yLabel}
        </text>
      </svg>
    </div>
  );
}
