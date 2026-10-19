import { useMemo, useState, useEffect } from 'react';
import { Atom, Activity, Clock3, Download } from 'lucide-react';
import Panel from '../components/Panel';
import NumberInput from '../components/NumberInput';
import StatCard from '../components/StatCard';
import LineChart from '../components/LineChart';

import {
  computeRadioactiveDecay,
  type DecayResult,
  type QuantityMode,
  NUCLEAR_DATABASE,
} from '../lib/physics';

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
  H: 'Hidrógeno',
  He: 'Helio',
  Li: 'Litio',
  Be: 'Berilio',
  B: 'Boro',
  C: 'Carbono',
  N: 'Nitrógeno',
  O: 'Oxígeno',
  F: 'Flúor',
  Ne: 'Neón',
  Na: 'Sodio',
  Mg: 'Magnesio',
  Al: 'Aluminio',
  Si: 'Silicio',
  P: 'Fósforo',
  S: 'Azufre',
  Cl: 'Cloro',
  Ar: 'Argón',
  K: 'Potasio',
  Ca: 'Calcio',
  Sc: 'Escandio',
  Ti: 'Titanio',
  V: 'Vanadio',
  Cr: 'Cromo',
  Mn: 'Manganeso',
  Fe: 'Hierro',
  Co: 'Cobalto',
  Ni: 'Níquel',
  Cu: 'Cobre',
  Zn: 'Zinc',
  Ga: 'Galio',
  Ge: 'Germanio',
  As: 'Arsénico',
  Se: 'Selenio',
  Br: 'Bromo',
  Kr: 'Kriptón',
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
  Sn: 'Estaño',
  Sb: 'Antimonio',
  Te: 'Telurio',
  I: 'Yodo',
  Xe: 'Xenón',
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
  Rn: 'Radón',
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
  { value: 's', label: 'Segundos' },
  { value: 'm', label: 'Minutos' },
  { value: 'h', label: 'Horas' },
  { value: 'd', label: 'Días' },
  { value: 'y', label: 'Años' },
];

const MODE_OPTIONS: Array<{ value: QuantityMode; label: string }> = [
  { value: 'activities', label: 'Actividad radiactiva (Bq / Ci)' },
  { value: 'masses', label: 'Masa remanente (g / kg)' },
  { value: 'moles', label: 'Moles' },
  { value: 'numbers', label: 'Número de núcleos' },
];

const INPUT_UNITS = ['Bq', 'kBq', 'MBq', 'GBq', 'Ci', 'mCi', 'dpm', 'g', 'mol', 'num'];

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
  const [inputUnits, setInputUnits] = useState('MBq');
  const [duration, setDuration] = useState(24);
  const [timeUnits, setTimeUnits] = useState<DecayResult['time_units']>('h');
  const points = 240;
  const [outputMode, setOutputMode] = useState<QuantityMode>('activities');
  const [outputUnits, setOutputUnits] = useState('Bq');

  const [loading, setLoading] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<DecayResult | null>(null);
  const currentElementNameEs = isotopeToElementNameEs(result?.isotope ?? isotope);

  const run = () => {
    setLoading(true);
    setError(null);
    try {
      const payload = computeRadioactiveDecay(
        isotope,
        initialValue,
        inputUnits,
        duration,
        timeUnits,
        points,
        outputMode,
        outputUnits
      );
      setResult(payload);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error al calcular decaimiento');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    run();
  }, []);

  const activitySeries = useMemo(() => {
    if (!result) return [];
    return [
      {
        name: `${result.isotope} (Padre)`,
        color: '#123B5D',
        data: result.parent_series,
      },
      {
        name: 'Actividad Total Acumulada',
        color: '#1976D2',
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

  const openExport = (url: string, filename: string) => {
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.target = '_blank';
    document.body.appendChild(a);
    a.click();
    a.remove();
  };

  const exportOriginalChain = async () => {
    setExporting(true);
    setError(null);
    try {
      const isotopeToExport = result?.isotope || isotope;
      const data = NUCLEAR_DATABASE[isotopeToExport];
      const filename = `cadena_decaimiento_${String(isotopeToExport).replace(/[^a-zA-Z0-9_-]/g, '_')}.png`;

      const canvas = document.createElement('canvas');
      canvas.width = 960;
      canvas.height = 480;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        // Clean academic background
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Header banner
        ctx.fillStyle = '#123B5D';
        ctx.fillRect(0, 0, canvas.width, 80);

        ctx.fillStyle = '#FFFFFF';
        ctx.font = 'bold 24px sans-serif';
        ctx.fillText(`CADENA DE DESINTEGRACIÓN RADIACTIVA: ${isotopeToExport}`, 40, 48);

        ctx.fillStyle = '#64748B';
        ctx.font = '13px monospace';
        ctx.fillText(`Laboratorio Nuclear · Ecuaciones de Bateman · Tesis de Física`, 40, 110);

        // Parent Box
        ctx.strokeStyle = '#123B5D';
        ctx.lineWidth = 2.5;
        ctx.fillStyle = '#F4F7FA';
        ctx.strokeRect(50, 150, 240, 150);
        ctx.fillRect(50, 150, 240, 150);

        ctx.fillStyle = '#123B5D';
        ctx.font = 'bold 26px sans-serif';
        ctx.fillText(isotopeToExport, 70, 195);

        ctx.fillStyle = '#64748B';
        ctx.font = '14px sans-serif';
        ctx.fillText(`Elemento: ${isotopeToElementNameEs(isotopeToExport)}`, 70, 225);
        ctx.fillText(`T½: ${data?.halfLifeReadable ?? 'Desconocido'}`, 70, 255);
        ctx.fillText(`Modo: ${data?.decayModes.join(', ') ?? 'β-'}`, 70, 280);

        // Daughters
        const progeny = data?.progeny ?? [];
        if (progeny.length > 0) {
          progeny.forEach((dName, idx) => {
            const yOffset = 150 + idx * 130;
            // Arrow
            ctx.strokeStyle = '#1976D2';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(290, 220);
            ctx.lineTo(440, yOffset + 60);
            ctx.stroke();

            // Daughter Box
            ctx.strokeStyle = '#1976D2';
            ctx.fillStyle = '#EAF4FB';
            ctx.strokeRect(440, yOffset, 280, 110);
            ctx.fillRect(440, yOffset, 280, 110);

            ctx.fillStyle = '#123B5D';
            ctx.font = 'bold 22px sans-serif';
            ctx.fillText(dName, 460, yOffset + 38);

            const dData = NUCLEAR_DATABASE[dName];
            ctx.fillStyle = '#64748B';
            ctx.font = '13px sans-serif';
            ctx.fillText(`T½: ${dData?.halfLifeReadable ?? 'Estable'}`, 460, yOffset + 68);
            ctx.fillText(`Fracción de ramificación: ${((data?.branchingFractions[idx] ?? 1) * 100).toFixed(1)}%`, 460, yOffset + 92);
          });
        }

        const url = canvas.toDataURL('image/png');
        openExport(url, filename);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error al exportar diagrama');
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="animate-fade-up space-y-6">
      {/* Submodule Header */}
      <div className="border-b border-slate-border pb-3">
        <span className="font-mono-tech text-xs font-bold uppercase tracking-wider text-techno">
          SUB-04 · CINÉTICA RADIACTIVA
        </span>
        <h2 className="font-display text-2xl font-bold tracking-tight text-nuclear-deep sm:text-3xl mt-0.5">
          Decaimiento Radiactivo y Ecuaciones de Bateman
        </h2>
        <p className="font-body text-xs text-slate-secondary mt-1">
          Inventario isotópico en cadenas sucesivas de filiación radiactiva, vidas medias físicas y cálculo analítico de actividades parentales e hijas.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[340px_1fr]">
        {/* Left Column: Isotope & Initial Value Parameters */}
        <div className="space-y-4">
          <Panel title="Parámetros del Isótopo" badge="INVENTARIO" accent="nuclear">
            <div className="space-y-4">
              <div>
                <label className="font-mono-tech text-xs font-semibold text-nuclear-deep block mb-1.5">
                  Isótopo Radiactivo Padre
                </label>
                <select
                  value={isotope}
                  onChange={(e) => setIsotope(e.target.value)}
                  className="input-tech mb-2"
                >
                  {ISOTOPES.map((iso) => (
                    <option key={iso} value={iso}>
                      {`${iso} · ${isotopeToElementNameEs(iso)}`}
                    </option>
                  ))}
                </select>
                <p className="text-[11px] font-mono-tech text-slate-secondary">
                  Elemento: <strong className="text-nuclear-deep">{currentElementNameEs}</strong>
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <NumberInput
                  label="Inventario Inicial"
                  value={initialValue}
                  min={0.001}
                  max={1e9}
                  step={1}
                  onChange={setInitialValue}
                />
                <div>
                  <label className="font-mono-tech text-xs font-semibold text-nuclear-deep block mb-1.5">
                    Unidad
                  </label>
                  <select
                    value={inputUnits}
                    onChange={(e) => setInputUnits(e.target.value)}
                    className="input-tech"
                  >
                    {INPUT_UNITS.map((u) => (
                      <option key={u} value={u}>{u}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <NumberInput
                  label="Duración"
                  value={duration}
                  min={0.01}
                  max={1e8}
                  step={1}
                  onChange={setDuration}
                />
                <div>
                  <label className="font-mono-tech text-xs font-semibold text-nuclear-deep block mb-1.5">
                    Unidad Tiempo
                  </label>
                  <select
                    value={timeUnits}
                    onChange={(e) => setTimeUnits(e.target.value as DecayResult['time_units'])}
                    className="input-tech"
                  >
                    {UNIT_OPTIONS.map((unit) => (
                      <option key={unit.value} value={unit.value}>{unit.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="font-mono-tech text-xs font-semibold text-nuclear-deep block mb-1.5">
                  Magnitud Física de Salida
                </label>
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

              <button
                onClick={run}
                className="btn-primary w-full shadow-sm mt-2"
                disabled={loading}
              >
                {loading ? 'CALCULANDO BATEMAN...' : 'RESOLVER CADENA'}
              </button>

              {error && <p className="text-xs text-critical font-medium">{error}</p>}
            </div>
          </Panel>

          {/* Nuclear Properties Box */}
          {result && (
            <Panel title="Propiedades Nucleares del Isótopo" badge="NUCLIDE" accent="cyan">
              <div className="space-y-2 text-xs font-mono-tech bg-slate-50 p-3 rounded-lg border border-slate-border">
                <div className="flex justify-between">
                  <span className="text-slate-secondary">Elemento:</span>
                  <span className="font-bold text-nuclear-deep">{currentElementNameEs}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-secondary">Número atómico Z:</span>
                  <span className="font-bold text-techno">{result.nuclide_data.Z} protones</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-secondary">Número de masa A:</span>
                  <span className="font-bold text-techno">{result.nuclide_data.A} nucleones</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-secondary">Masa atómica:</span>
                  <span className="font-bold text-nuclear-deep">{result.nuclide_data.atomic_mass.toFixed(4)} u</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-secondary">Modos de decaimiento:</span>
                  <span className="font-bold text-amber-700">{result.nuclide_data.decay_modes.join(', ') || 'Estable'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-secondary">Vida media física:</span>
                  <span className="font-bold text-emerald-700">{result.half_life_label}</span>
                </div>
              </div>
            </Panel>
          )}
        </div>

        {/* Right Column: Graphs & Results */}
        <div className="space-y-6">
          <Panel title="Métricas de Inventario y Actividad" badge="RESULTADOS" accent="amber">
            <div className="grid gap-3 sm:grid-cols-3">
              <StatCard
                label="Isótopo Padre"
                value={result?.isotope ?? isotope}
                sublabel={currentElementNameEs}
                icon={<Atom size={16} />}
                accent="nuclear"
              />
              <StatCard
                label="Vida Media T½"
                value={result?.half_life_label ?? '-'}
                sublabel="Período de semidesintegración"
                icon={<Clock3 size={16} />}
                accent="cyan"
              />
              <StatCard
                label="Actividad Final Padre"
                value={result ? `${formatScientific(result.final_parent_value)} ${result.output_units}` : `0 ${outputUnits}`}
                sublabel={`Al término de ${duration} ${timeUnits}`}
                icon={<Activity size={16} />}
                accent="amber"
              />
            </div>
          </Panel>

          <Panel title="Curva de Desintegración Logarítmica de Bateman" badge="GRÁFICA DE ACTIVIDAD" accent="nuclear">
            {result ? (
              <LineChart
                series={activitySeries}
                xLabels={xLabels}
                xLabel={`Tiempo transcurrido (${result.time_units})`}
                yLabel={`Actividad radiactiva (${result.output_units})`}
                yLog
                height={290}
              />
            ) : (
              <p className="text-sm text-slate-secondary p-4 text-center">Selecciona un isótopo para visualizar su curva.</p>
            )}
          </Panel>

          {/* Decay Chain Diagram with Progeny */}
          <Panel title="Diagrama Estructural de Filiación Radiactiva" badge="CADENA" accent="cyan">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3 p-3 bg-slate-50 rounded-lg border border-slate-border">
              <div className="text-xs text-slate-secondary">
                Esquema gráfico de transición parental e isótopos hijos según coeficientes de ramificación.
              </div>
              <button
                onClick={exportOriginalChain}
                className="btn-ghost flex items-center gap-1.5 text-xs py-1.5"
                disabled={exporting}
              >
                <Download size={13} />
                <span>{exporting ? 'EXPORTANDO...' : 'EXPORTAR DIAGRAMA (PNG)'}</span>
              </button>
            </div>

            {result && (
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-border">
                <div className="flex flex-col items-center justify-center gap-4 sm:flex-row sm:gap-6">
                  {/* Parent Node */}
                  <div className="p-4 rounded-xl border-2 border-nuclear-deep bg-white shadow-sm min-w-[180px] text-center">
                    <span className="font-display text-xl font-bold text-nuclear-deep">{result.isotope}</span>
                    <div className="text-xs font-mono-tech text-slate-secondary mt-1">T½: {result.half_life_label}</div>
                    <div className="text-[11px] font-mono-tech text-techno font-semibold mt-0.5">
                      Modo: {result.nuclide_data.decay_modes.join(', ') || 'Estable'}
                    </div>
                  </div>

                  {/* Arrow & Daughters */}
                  {result.nuclide_data.progeny && result.nuclide_data.progeny.length > 0 ? (
                    <div className="flex flex-col items-center gap-3 sm:flex-row">
                      <div className="text-techno font-bold text-sm sm:rotate-[-90deg]">↓</div>
                      <div className="flex flex-wrap justify-center gap-3">
                        {result.nuclide_data.progeny.map((prog, idx) => {
                          const bf = result.nuclide_data.branching_fractions?.[idx];
                          const progData = NUCLEAR_DATABASE[prog];
                          return (
                            <div key={prog} className="p-3.5 rounded-xl border border-techno/40 bg-azure-light min-w-[160px] text-center shadow-sm">
                              <span className="font-display text-lg font-bold text-techno">{prog}</span>
                              {bf !== undefined && (
                                <div className="text-[11px] font-mono-tech text-emerald-700 font-semibold mt-0.5">
                                  Ramificación: {(bf * 100).toFixed(1)}%
                                </div>
                              )}
                              <div className="text-[11px] font-mono-tech text-slate-secondary mt-0.5">
                                T½: {progData?.halfLifeReadable ?? 'Estable / Largo'}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ) : (
                    <div className="text-xs font-mono-tech text-emerald-700 bg-emerald-50 px-3 py-2 rounded-lg border border-emerald-200">
                      Isótopo estable: no presenta hijas radiactivas directas.
                    </div>
                  )}
                </div>
              </div>
            )}
          </Panel>

          {/* Breakdown Table: Inventory After Duration */}
          {result && (
            <Panel title="Inventario Isotópico Residual (Ecuaciones de Bateman)" badge="INVENTARIO" accent="nuclear">
              <div className="grid gap-2.5 sm:grid-cols-2">
                {Object.entries(result.inventory_after).map(([key, value]) => (
                  <div key={key} className="flex items-center justify-between p-3 bg-white rounded-lg border border-slate-border shadow-sm">
                    <span className="font-display text-xs font-bold text-nuclear-deep">{key}</span>
                    <span className="font-mono-tech text-xs font-bold text-techno">
                      {formatScientific(value)} {result.output_units}
                    </span>
                  </div>
                ))}
              </div>
            </Panel>
          )}
        </div>
      </div>
    </div>
  );
}
