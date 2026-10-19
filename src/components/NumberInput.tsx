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
      <label className="font-mono-tech text-xs font-semibold text-nuclear-deep block mb-1.5">
        {label}
      </label>
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
          className="input-tech pr-14"
        />
        {unit && (
          <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 font-mono-tech text-xs font-medium text-slate-secondary bg-slate-100 px-2 py-0.5 rounded">
            {unit}
          </span>
        )}
      </div>
    </div>
  );
}
