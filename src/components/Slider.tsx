interface SliderProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  unit?: string;
  display?: (v: number) => string;
  onChange: (v: number) => void;
  accent?: 'reactor' | 'cyan' | 'amber';
}

export default function Slider({
  label,
  value,
  min,
  max,
  step,
  unit = '',
  display,
  onChange,
  accent = 'cyan',
}: SliderProps) {
  const accentColor =
    accent === 'amber'
      ? '#F4C542'
      : accent === 'reactor'
      ? '#10B981'
      : '#1976D2';

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <label className="font-mono-tech text-xs font-semibold text-nuclear-deep">
          {label}
        </label>
        <span className="font-mono-tech text-xs font-bold px-2 py-0.5 rounded bg-azure-light text-techno border border-techno/20">
          {display ? display(value) : value} {unit}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="slider-tech w-full"
        style={{
          accentColor,
        }}
      />
      <div className="flex justify-between font-mono-tech text-[10px] text-slate-secondary">
        <span>{min} {unit}</span>
        <span>{max} {unit}</span>
      </div>
    </div>
  );
}
