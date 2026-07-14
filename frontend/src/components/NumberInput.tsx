interface NumberInputProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  unit?: string;
  onChange: (v: number) => void;
}

export default function NumberInput({
  label,
  value,
  min,
  max,
  step,
  unit,
  onChange,
}: NumberInputProps) {
  return (
    <div>
      <label className="hud-label mb-1.5 block">{label}</label>
      <div className="relative">
        <input
          type="number"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => {
            const v = parseFloat(e.target.value);
            if (!Number.isNaN(v)) onChange(v);
          }}
          className="input-tech pr-12"
        />
        {unit && (
          <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 font-mono-tech text-xs text-cyan-300/60">
            {unit}
          </span>
        )}
      </div>
    </div>
  );
}
