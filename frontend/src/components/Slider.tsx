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
  accent = 'reactor',
}: SliderProps) {
  return (
    <div>
      <div className="mb-1.5 flex items-baseline justify-between">
        <label className="hud-label">{label}</label>
        <span className="font-mono-tech text-sm font-bold text-cyan-100">
          {display ? display(value) : value}
          {unit}
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
          accentColor:
            accent === 'reactor'
              ? 'rgb(162 255 64)'
              : accent === 'cyan'
                ? 'rgb(34 211 238)'
                : 'rgb(251 191 36)',
        }}
      />
    </div>
  );
}
