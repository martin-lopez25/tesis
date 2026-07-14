import { useMemo, useState } from 'react';
import { Atom, Activity, Clock3, Radiation } from 'lucide-react';
import Panel from '../components/Panel';
import NumberInput from '../components/NumberInput';
import StatCard from '../components/StatCard';
import LineChart from '../components/LineChart';

type QuantityMode = 'activities' | 'masses' | 'moles' | 'numbers';

type DecayProduct = { nuclide: string; final_value: number };

type DecayResult = {
  isotope: string;
  input_isotope: string;
  input_units: string;
  input_value: number;
  output_mode: QuantityMode;
  output_units: string;
  time_units: 's' | 'm' | 'h' | 'd' | 'y';
  times: number[];
  series_by_nuclide: Record<string, number[]>;
  parent_series: number[];
  total_series: number[];
  final_parent_value: number;
  inventory_after: Record<string, number>;
  fractions: Record<string, number>;
  cumulative_decays: Record<string, number>;
  half_life_years: number | null;
  half_life_label: string;
  nuclide_data: {
    progeny: string[];
    branching_fractions: number[];
    decay_modes: string[];
    Z: number;
    A: number;
    atomic_mass: number;
  };
  chain_data: {
    half_lives: Record<string, string>;
    progeny: Record<string, string[]>;
    branching_fractions: Record<string, number[]>;
    decay_modes: Record<string, string[]>;
  };
  products: DecayProduct[];
};

const ISOTOPES = [
  'Mo-99',
  'Xe-135',
  'I-135',
  'Cs-137',
  'Co-60',
  'I-131',
  'Sr-90',
  'Tc-99m',
  'Tc-99',
  'Ba-137m',
  'Ba-137',
  'Kr-85',
  'Kr-85m',
  'C-14',
  'H-3',
  'Ra-226',
  'Rn-222',
  'U-238',
  'U-235',
  'Th-232',
  'Ra-228',
  'Po-210',
  'Pu-239',
  'Am-241',
  'Cf-252',
];

const ELEMENT_NAMES_ES: Record<string, string> = {
  H: 'Hidrogeno',
  He: 'Helio',
  Li: 'Litio',
  Be: 'Berilio',
  B: 'Boro',
  C: 'Carbono',
  N: 'Nitrogeno',
  O: 'Oxigeno',
  F: 'Fluor',
  Ne: 'Neon',
  Na: 'Sodio',
  Mg: 'Magnesio',
  Al: 'Aluminio',
  Si: 'Silicio',
  P: 'Fosforo',
  S: 'Azufre',
  Cl: 'Cloro',
  Ar: 'Argon',
  K: 'Potasio',
  Ca: 'Calcio',
  Sc: 'Escandio',
  Ti: 'Titanio',
  V: 'Vanadio',
  Cr: 'Cromo',
  Mn: 'Manganeso',
  Fe: 'Hierro',
  Co: 'Cobalto',
  Ni: 'Niquel',
  Cu: 'Cobre',
  Zn: 'Zinc',
  Ga: 'Galio',
  Ge: 'Germanio',
  As: 'Arsenico',
  Se: 'Selenio',
  Br: 'Bromo',
  Kr: 'Kripton',
  Rb: 'Rubidio',
  Sr: 'Estroncio',
  Y: 'Itrio',
  Zr: 'Circonio',
  Nb: 'Niobio',
  Mo: 'Molibdeno',
  Tc: 'Tecnecio',
  Ru: 'Rutenio',
  Rh: 'Rodio',
  Pd: 'Paladio',
  Ag: 'Plata',
  Cd: 'Cadmio',
  In: 'Indio',
  Sn: 'Estano',
  Sb: 'Antimonio',
  Te: 'Telurio',
  I: 'Yodo',
  Xe: 'Xenon',
  Cs: 'Cesio',
  Ba: 'Bario',
  La: 'Lantano',
  Ce: 'Cerio',
  Pr: 'Praseodimio',
  Nd: 'Neodimio',
  Pm: 'Prometio',
  Sm: 'Samario',
  Eu: 'Europio',
  Gd: 'Gadolinio',
  Tb: 'Terbio',
  Dy: 'Disprosio',
  Ho: 'Holmio',
  Er: 'Erbio',
  Tm: 'Tulio',
  Yb: 'Iterbio',
  Lu: 'Lutecio',
  Hf: 'Hafnio',
  Ta: 'Tantalio',
  W: 'Wolframio',
  Re: 'Renio',
  Os: 'Osmio',
  Ir: 'Iridio',
  Pt: 'Platino',
  Au: 'Oro',
  Hg: 'Mercurio',
  Tl: 'Talio',
  Pb: 'Plomo',
  Bi: 'Bismuto',
  Po: 'Polonio',
  At: 'Astato',
  Rn: 'Radon',
  Fr: 'Francio',
  Ra: 'Radio',
  Ac: 'Actinio',
  Th: 'Torio',
  Pa: 'Protactinio',
  U: 'Uranio',
  Np: 'Neptunio',
  Pu: 'Plutonio',
  Am: 'Americio',
  Cm: 'Curio',
  Bk: 'Berkelio',
  Cf: 'Californio',
};

function isotopeToSymbol(isotope: string): string {
  return isotope.trim().split('-')[0] || isotope.trim();
}

function isotopeToElementNameEs(isotope: string): string {
  const symbol = isotopeToSymbol(isotope);
  return ELEMENT_NAMES_ES[symbol] ?? symbol;
}

const UNIT_OPTIONS: Array<{ value: DecayResult['time_units']; label: string }> = [
  { value: 's', label: 'segundos' },
  { value: 'm', label: 'minutos' },
  { value: 'h', label: 'horas' },
  { value: 'd', label: 'dias' },
  { value: 'y', label: 'anios' },
];

const MODE_OPTIONS: Array<{ value: QuantityMode; label: string }> = [
  { value: 'activities', label: 'actividades' },
  { value: 'masses', label: 'masas' },
  { value: 'moles', label: 'moles' },
  { value: 'numbers', label: 'numero de nucleos' },
];

const INPUT_UNITS = ['Bq', 'Ci', 'dpm', 'g', 'kg', 'mol', 'kmol', 'num'];

const OUTPUT_UNITS_BY_MODE: Record<QuantityMode, string[]> = {
  activities: ['Bq', 'Ci', 'dpm'],
  masses: ['g', 'kg'],
  moles: ['mol', 'kmol'],
  numbers: ['num'],
};

function formatScientific(v: number): string {
  if (!Number.isFinite(v)) return '0';
  if (v === 0) return '0';
  if (Math.abs(v) >= 1e4 || Math.abs(v) < 1e-2) return v.toExponential(3);
  return v.toFixed(3);
}

export default function DecaySection() {
  const [isotope, setIsotope] = useState('Mo-99');
  const [initialValue, setInitialValue] = useState(2);
  const [inputUnits, setInputUnits] = useState('Bq');
  const [duration, setDuration] = useState(20);
  const [timeUnits, setTimeUnits] = useState<DecayResult['time_units']>('h');
  const [points, setPoints] = useState(240);
  const [outputMode, setOutputMode] = useState<QuantityMode>('activities');
  const [outputUnits, setOutputUnits] = useState('Bq');

  const [loading, setLoading] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [originalPlotUrl, setOriginalPlotUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<DecayResult | null>(null);
  const currentElementNameEs = isotopeToElementNameEs(result?.isotope ?? isotope);

  const run = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/django/api/simulations/radioactive-decay/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          isotope,
          initial_value: initialValue,
          input_units: inputUnits,
          duration,
          time_units: timeUnits,
          points,
          output_mode: outputMode,
          output_units: outputUnits,
        }),
      });

      const payload = (await res.json()) as DecayResult | { error: string };
      if (!res.ok || 'error' in payload) {
        throw new Error('error' in payload ? payload.error : `HTTP ${res.status}`);
      }
      setResult(payload);
      setOriginalPlotUrl(
        `/django/api/simulations/radioactive-decay-chain-image/?isotope=${encodeURIComponent(payload.isotope)}&theme=lab&t=${Date.now()}`
      );
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  };

  const activitySeries = useMemo(() => {
    if (!result) return [];
    return [
      {
        name: `${result.isotope} (padre)`,
        color: '#fbbf24',
        data: result.parent_series,
      },
      {
        name: 'Total',
        color: '#22d3ee',
        data: result.total_series,
        dashed: true,
      },
    ];
  }, [result]);

  const xLabels = useMemo(() => {
    if (!result) return [];
    return result.times.map((t) => {
      if (t >= 1000) return t.toFixed(0);
      if (t >= 100) return t.toFixed(1);
      if (t >= 10) return t.toFixed(2);
      return t.toFixed(3);
    });
  }, [result]);

  const exportOriginalChain = async () => {
    setExporting(true);
    setError(null);
    try {
      const isotopeToExport = result?.isotope || isotope;
      const res = await fetch('/django/api/simulations/radioactive-decay-chain-export/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isotope: isotopeToExport }),
      });

      if (!res.ok) {
        const payload = (await res.json().catch(() => null)) as { error?: string } | null;
        throw new Error(payload?.error || `HTTP ${res.status}`);
      }

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `decay_chain_${String(isotopeToExport).replace(/[^a-zA-Z0-9_-]/g, '_')}.png`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'No se pudo exportar el diagrama original');
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="animate-fade-up space-y-4">
      <div>
        <span className="hud-label">MOD-05 · RADIACTIVIDAD</span>
        <h2 className="mt-2 font-display text-2xl font-bold tracking-wide text-white sm:text-3xl">
          Decaimiento Radiactivo
        </h2>
      </div>

      <div className="grid gap-4 lg:grid-cols-[320px_1fr]">
        <Panel title="Parametros" badge="INPUT" accent="amber">
          <div className="space-y-3">
            <div>
              <label className="hud-label mb-1.5 block">Isotopo</label>
              <select value={isotope} onChange={(e) => setIsotope(e.target.value)} className="input-tech mb-2">
                {ISOTOPES.map((iso) => (
                  <option key={iso} value={iso}>{`${iso} · ${isotopeToElementNameEs(iso)}`}</option>
                ))}
              </select>
              <input
                list="isotopes-list"
                value={isotope}
                onChange={(e) => setIsotope(e.target.value)}
                className="input-tech"
                placeholder="O escribe uno manual, por ejemplo: Xe-135"
              />
              <datalist id="isotopes-list">
                {ISOTOPES.map((iso) => (
                  <option key={iso} value={iso} label={`${iso} · ${isotopeToElementNameEs(iso)}`}>
                    {`${iso} · ${isotopeToElementNameEs(iso)}`}
                  </option>
                ))}
              </datalist>
              <p className="mt-1 text-[11px] font-mono-tech text-[#7a9ab0]">Elemento: {currentElementNameEs}. Puedes elegir de la lista o escribir cualquier isotopo valido.</p>
            </div>

            <NumberInput
              label="Valor inicial"
              value={initialValue}
              min={0.001}
              max={1e9}
              step={1}
              unit={inputUnits}
              onChange={setInitialValue}
            />

            <div>
              <label className="hud-label mb-1.5 block">Unidad de inventario (entrada)</label>
              <select value={inputUnits} onChange={(e) => setInputUnits(e.target.value)} className="input-tech">
                {INPUT_UNITS.map((u) => (
                  <option key={u} value={u}>{u}</option>
                ))}
              </select>
            </div>

            <NumberInput
              label="Duracion de simulacion"
              value={duration}
              min={0.001}
              max={1e8}
              step={1}
              onChange={setDuration}
            />

            <div>
              <label className="hud-label mb-1.5 block">Unidad de tiempo</label>
              <select
                value={timeUnits}
                onChange={(e) => setTimeUnits(e.target.value as DecayResult['time_units'])}
                className="input-tech"
              >
                {UNIT_OPTIONS.map((unit) => (
                  <option key={unit.value} value={unit.value}>
                    {unit.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="hud-label mb-1.5 block">Modo de salida</label>
              <select
                value={outputMode}
                onChange={(e) => {
                  const next = e.target.value as QuantityMode;
                  setOutputMode(next);
                  setOutputUnits(OUTPUT_UNITS_BY_MODE[next][0]);
                }}
                className="input-tech"
              >
                {MODE_OPTIONS.map((mode) => (
                  <option key={mode.value} value={mode.value}>{mode.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="hud-label mb-1.5 block">Unidad de salida</label>
              <select value={outputUnits} onChange={(e) => setOutputUnits(e.target.value)} className="input-tech">
                {OUTPUT_UNITS_BY_MODE[outputMode].map((u) => (
                  <option key={u} value={u}>{u}</option>
                ))}
              </select>
            </div>

            <NumberInput
              label="Puntos de muestreo"
              value={points}
              min={20}
              max={1200}
              step={1}
              onChange={(v) => setPoints(Math.round(v))}
            />

            <button onClick={run} className="btn-primary w-full" disabled={loading}>
              {loading ? 'CALCULANDO...' : 'SIMULAR DECAIMIENTO'}
            </button>
            {error ? <p className="text-xs text-critical">{error}</p> : null}
          </div>
        </Panel>

        <div className="space-y-4">
          <Panel title="Metricas" badge="LIVE" accent="cyan">
            <div className="grid gap-2 sm:grid-cols-3">
              <StatCard
                label="Isotopo"
                value={result?.isotope ?? isotope}
                icon={<Atom size={14} />}
                accent="amber"
              />
              <StatCard
                label="Vida media"
                value={result?.half_life_label ?? '-'}
                icon={<Clock3 size={14} />}
                accent="cyan"
              />
              <StatCard
                label="Actividad final"
                value={result ? `${formatScientific(result.final_parent_value)} ${result.output_units}` : `0 ${outputUnits}`}
                icon={<Activity size={14} />}
                accent="reactor"
              />
            </div>
          </Panel>

          <Panel title="Curva de decaimiento" badge="CHART" accent="reactor">
            {result ? (
              <LineChart
                series={activitySeries}
                xLabels={xLabels}
                xLabel={`Tiempo (${result.time_units})`}
                yLabel={`${result.output_mode} (${result.output_units})`}
                yLog
                height={300}
              />
            ) : (
              <p className="text-sm text-[#7a9ab0]">Selecciona un isotopo y ejecuta la simulacion.</p>
            )}
          </Panel>

          <Panel title="Resultado de Inventory.decay()" badge="DATA" accent="cyan">
            {result ? (
              <div className="grid gap-2 sm:grid-cols-2">
                {Object.entries(result.inventory_after).map(([key, value]) => (
                  <div key={key} className="border border-navy-border bg-navy-deep/50 px-3 py-2">
                    <div className="font-display text-xs uppercase tracking-wider text-[#c8e8f0]">{key}</div>
                    <div className="mt-1 font-mono-tech text-xs text-cyan">{formatScientific(value)} {result.output_units}</div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-[#7a9ab0]">Sin datos.</p>
            )}
          </Panel>

          <Panel title="cumulative_decays()" badge="ATOMS" accent="critical">
            {result ? (
              <div className="grid gap-2 sm:grid-cols-2">
                {Object.entries(result.cumulative_decays).map(([key, value]) => (
                  <div key={key} className="border border-navy-border bg-navy-deep/50 px-3 py-2">
                    <div className="font-display text-xs uppercase tracking-wider text-[#c8e8f0]">{key}</div>
                    <div className="mt-1 font-mono-tech text-xs text-critical">{formatScientific(value)} atomos</div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-[#7a9ab0]">Sin datos.</p>
            )}
          </Panel>

          <Panel title="Productos principales" badge="CHAIN" accent="amber">
            {result ? (
              result.products.length > 0 ? (
                <div className="grid gap-2 sm:grid-cols-2">
                  {result.products.slice(0, 8).map((p) => (
                    <div key={p.nuclide} className="border border-navy-border bg-navy-deep/50 px-3 py-2">
                      <div className="flex items-center justify-between">
                        <span className="font-display text-xs uppercase tracking-wider text-[#c8e8f0]">{p.nuclide}</span>
                        <Radiation size={12} className="text-critical" />
                      </div>
                      <div className="mt-1 font-mono-tech text-xs text-[#7a9ab0]">
                        {formatScientific(p.final_value)} {result.output_units}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-[#7a9ab0]">No se detectaron productos significativos para este intervalo.</p>
              )
            ) : (
              <p className="text-sm text-[#7a9ab0]">Sin datos.</p>
            )}
          </Panel>

          <Panel title="Diagrama de cadena de desintegracion" badge="GRAPH" accent="reactor">
            <div className="mb-3 flex justify-end">
              <button onClick={exportOriginalChain} className="btn-ghost" disabled={exporting}>
                {exporting ? 'EXPORTANDO...' : 'EXPORTAR ORIGINAL (Nuc.plot)'}
              </button>
            </div>
            {result ? (
              <div className="border border-navy-border bg-[#081623]/80 p-2">
                <div className="mx-auto w-full max-w-2xl">
                  <div className="mb-2 flex items-center justify-between">
                    <span className="hud-label">Original radioactivedecay · nuc.plot()</span>
                    <span className="font-mono-tech text-[10px] text-[#7a9ab0]">{result.isotope}</span>
                  </div>
                  {originalPlotUrl ? (
                    <img
                      src={originalPlotUrl}
                      alt={`Diagrama original de ${result.isotope}`}
                      className="w-full border border-navy-border bg-[#050f1a]"
                    />
                  ) : (
                    <p className="text-sm text-[#7a9ab0]">No se pudo cargar la imagen original.</p>
                  )}
                </div>
              </div>
            ) : (
              <p className="text-sm text-[#7a9ab0]">Ejecuta una simulacion para generar el diagrama.</p>
            )}
          </Panel>

          <Panel title="Datos nucleares" badge="NUCLIDE" accent="cyan">
            {result ? (
              <div className="space-y-2 text-xs font-mono-tech text-[#7a9ab0]">
                <div className="flex justify-between"><span>Elemento</span><span className="text-cyan">{currentElementNameEs}</span></div>
                <div className="flex justify-between"><span>Z (protones)</span><span className="text-cyan">{result.nuclide_data.Z}</span></div>
                <div className="flex justify-between"><span>A (nucleones)</span><span className="text-cyan">{result.nuclide_data.A}</span></div>
                <div className="flex justify-between"><span>Masa atomica</span><span className="text-cyan">{result.nuclide_data.atomic_mass.toFixed(6)} g/mol</span></div>
                <div className="flex justify-between"><span>Modos de decaimiento</span><span className="text-cyan">{result.nuclide_data.decay_modes.join(', ') || '-'}</span></div>
                <div className="flex justify-between"><span>Progenie directa</span><span className="text-cyan">{result.nuclide_data.progeny.join(', ') || '-'}</span></div>
              </div>
            ) : (
              <p className="text-sm text-[#7a9ab0]">Sin datos.</p>
            )}
          </Panel>
        </div>
      </div>
    </div>
  );
}
