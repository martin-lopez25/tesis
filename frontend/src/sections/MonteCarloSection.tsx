import { useMemo, useState } from 'react';
import { Activity, Gauge, Layers3 } from 'lucide-react';
import Panel from '../components/Panel';
import NumberInput from '../components/NumberInput';
import StatCard from '../components/StatCard';
import BarChart from '../components/BarChart';
import LineChart from '../components/LineChart';

type MonteCarloResult = {
  generations: number[];
  population: number[];
  fissions: number[];
  k_effective: number[];
  total_fissions: number;
  final_population: number;
  average_k: number;
  regime: 'subcritical' | 'critical' | 'supercritical';
};

function alphaFromA(A: number): number {
  return ((A - 1) / (A + 1)) ** 2;
}

function energyRatioFromMuC(muC: number, A: number): number {
  const alpha = alphaFromA(A);
  return 0.5 * ((1 + alpha) + (1 - alpha) * muC);
}

function buildHistogram(values: number[], bins: number, minValue?: number, maxValue?: number) {
  if (values.length === 0 || bins <= 0) return [];

  const min = minValue ?? Math.min(...values);
  const max = maxValue ?? Math.max(...values);
  const width = max > min ? (max - min) / bins : 1;
  const counts = Array.from({ length: bins }, () => 0);

  for (const value of values) {
    if (!Number.isFinite(value)) continue;
    const raw = Math.floor((value - min) / width);
    const idx = Math.max(0, Math.min(bins - 1, raw));
    counts[idx] += 1;
  }

  return counts.map((count, i) => {
    const x0 = min + i * width;
    return {
      label: x0.toFixed(3),
      value: count,
      color: '#22d3ee',
    };
  });
}

function neutronLetargizer(Ei: number, Ef: number, A: number): number {
  let events = 0;
  let E = Ei;
  const hardLimit = 1_000_000;

  while (E >= Ef && events < hardLimit) {
    const muC = 2 * Math.random() - 1;
    E = E * energyRatioFromMuC(muC, A);
    events += 1;
  }

  return events;
}

function wattSpectrum(E: number): number {
  const C1 = 0.453;
  const C2 = 0.965;
  const C3 = 2.29;
  return C1 * Math.exp(-E / C2) * Math.sinh(Math.sqrt(C3 * E));
}

export default function MonteCarloSection() {
  const [initial, setInitial] = useState(1000);
  const [generations, setGenerations] = useState(30);
  const [probability, setProbability] = useState(0.55);
  const [nu, setNu] = useState(2.43);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<MonteCarloResult | null>(null);

  const [massListInput, setMassListInput] = useState('1, 12, 23, 56, 238');
  const [scatterMass, setScatterMass] = useState(12);
  const [scatterEi, setScatterEi] = useState(1);
  const [scatterSamples, setScatterSamples] = useState(50000);

  const [moderatorMass, setModeratorMass] = useState(12);
  const [moderatorEi, setModeratorEi] = useState(2.0);
  const [moderatorEf, setModeratorEf] = useState(1e-6);
  const [moderatorNeutrons, setModeratorNeutrons] = useState(1000);
  const [moderationEvents, setModerationEvents] = useState<number[]>([]);

  const [wattEmax, setWattEmax] = useState(10);
  const [wattSamples, setWattSamples] = useState(100);
  const [wattRunId, setWattRunId] = useState(0);

  const run = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/django/api/simulations/monte-carlo-fission/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          initial_neutrons: initial,
          generations,
          fission_probability: probability,
          neutrons_per_fission: nu,
        }),
      });
      const payload = (await res.json()) as MonteCarloResult | { error: string };
      if (!res.ok || 'error' in payload) {
        throw new Error('error' in payload ? payload.error : `HTTP ${res.status}`);
      }
      setResult(payload);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  };

  const popData = useMemo(() => {
    if (!result) return [];
    return result.generations.map((g, i) => ({
      label: String(g),
      value: Number(result.population[i] ?? 0),
      color: '#22d3ee',
    }));
  }, [result]);

  const kSeries = useMemo(() => {
    if (!result) return [];
    return [
      {
        name: 'k efectivo',
        color: '#a2ff40',
        data: result.k_effective.map((v) => Number(v ?? 0)),
      },
    ];
  }, [result]);

  const parsedMasses = useMemo(() => {
    const values = massListInput
      .split(',')
      .map((v) => Number(v.trim()))
      .filter((v) => Number.isFinite(v) && v > 0);

    return Array.from(new Set(values)).slice(0, 8);
  }, [massListInput]);

  const angleLabels = useMemo(() => {
    return Array.from({ length: 361 }, (_, i) => String(i));
  }, []);

  const angleEnergySeries = useMemo(() => {
    const palette = ['#22d3ee', '#a2ff40', '#fbbf24', '#34d399', '#f97316', '#60a5fa', '#f43f5e', '#eab308'];
    if (parsedMasses.length === 0) return [];

    return parsedMasses.map((A, index) => {
      const data = Array.from({ length: 361 }, (_, deg) => {
        const muC = Math.cos((deg * Math.PI) / 180);
        return energyRatioFromMuC(muC, A);
      });

      return {
        name: `A=${A}`,
        color: palette[index % palette.length],
        data,
      };
    });
  }, [parsedMasses]);

  const scatterEnergyHistogram = useMemo(() => {
    const N = Math.max(1000, Math.min(200000, Math.round(scatterSamples)));
    const A = Math.max(1, scatterMass);
    const Ei = Math.max(1e-6, scatterEi);

    const energies = Array.from({ length: N }, () => {
      const muC = 2 * Math.random() - 1;
      return Ei * energyRatioFromMuC(muC, A);
    });

    return buildHistogram(energies, 60, alphaFromA(A) * Ei, Ei);
  }, [scatterMass, scatterEi, scatterSamples]);

  const moderationStats = useMemo(() => {
    if (moderationEvents.length === 0) {
      return { mean: 0, std: 0 };
    }

    const mean = moderationEvents.reduce((acc, value) => acc + value, 0) / moderationEvents.length;
    const variance = moderationEvents.reduce((acc, value) => acc + (value - mean) ** 2, 0) / moderationEvents.length;
    return { mean, std: Math.sqrt(variance) };
  }, [moderationEvents]);

  const moderationHistogram = useMemo(() => {
    if (moderationEvents.length === 0) return [];
    return buildHistogram(moderationEvents, 40);
  }, [moderationEvents]);

  const runModerationStudy = () => {
    const A = Math.max(1, moderatorMass);
    const Ei = Math.max(1e-6, moderatorEi);
    const Ef = Math.max(1e-9, moderatorEf);
    const N = Math.max(50, Math.min(10000, Math.round(moderatorNeutrons)));

    if (Ei <= Ef) {
      setError('En frenado, Ei debe ser mayor que Ef.');
      return;
    }

    const events = Array.from({ length: N }, () => neutronLetargizer(Ei, Ef, A));
    setModerationEvents(events);
  };

  const wattStudy = useMemo(() => {
    const eMax = Math.max(0.5, wattEmax);
    const n = Math.max(20, Math.min(2000, Math.round(wattSamples)));

    const maxGrid = Array.from({ length: 2000 }, (_, i) => (i / 1999) * eMax);
    const maxW = Math.max(...maxGrid.map((x) => wattSpectrum(x)), 1e-12);

    const samples = Array.from({ length: n }, () => {
      const x = Math.random() * eMax;
      const y = Math.random() * maxW;
      const accepted = y < wattSpectrum(x);
      return { x, y, accepted };
    });

    const accepted = samples.reduce((acc, p) => acc + (p.accepted ? 1 : 0), 0);
    const efficiency = accepted / n;

    return { eMax, maxW, samples, accepted, efficiency };
  }, [wattEmax, wattSamples, wattRunId]);

  const angleConclusion = useMemo(() => {
    if (parsedMasses.length === 0) return 'Define al menos un A para analizar la dependencia angular.';
    const minA = Math.min(...parsedMasses);
    const maxA = Math.max(...parsedMasses);
    return `Para A pequeno (ej. ${minA}) la energia puede caer mucho al retrodispersar; para A grande (ej. ${maxA}) la razon En'/En cambia menos y la perdida por choque es menor.`;
  }, [parsedMasses]);

  return (
    <div className="animate-fade-up space-y-4">
      <div>
        <span className="hud-label">MOD-01 · CRITICALIDAD</span>
        <h2 className="mt-2 font-display text-2xl font-bold tracking-wide text-white sm:text-3xl">
          Monte Carlo de Fision
        </h2>
      </div>

      <div className="grid gap-4 lg:grid-cols-[320px_1fr]">
        <div className="space-y-4">
          <Panel title="Parametros" badge="INPUT" accent="reactor">
            <div className="space-y-3">
              <NumberInput label="Neutrones iniciales" value={initial} min={1} max={100000} step={1} onChange={setInitial} />
              <NumberInput label="Generaciones" value={generations} min={1} max={200} step={1} onChange={setGenerations} />
              <NumberInput label="Probabilidad de fision" value={probability} min={0} max={1} step={0.01} onChange={setProbability} />
              <NumberInput label="Neutrones por fision" value={nu} min={1} max={5} step={0.01} onChange={setNu} />
              <button onClick={run} className="btn-primary w-full" disabled={loading}>
                {loading ? 'SIMULANDO...' : 'EJECUTAR'}
              </button>
              {error ? <p className="text-xs text-critical">{error}</p> : null}
            </div>
          </Panel>
        </div>

        <div className="space-y-4">
          <Panel title="Metricas" badge="LIVE" accent="cyan">
            <div className="grid gap-2 sm:grid-cols-3">
              <StatCard label="Poblacion final" value={String(result?.final_population ?? 0)} icon={<Layers3 size={14} />} accent="cyan" />
              <StatCard label="Total fisiones" value={String(result?.total_fissions ?? 0)} icon={<Gauge size={14} />} accent="critical" />
              <StatCard label="k promedio" value={(result?.average_k ?? 0).toFixed(4)} icon={<Activity size={14} />} accent="reactor" />
            </div>
          </Panel>

          <Panel title="Poblacion por generacion" badge="CHART" accent="reactor">
            {result ? <BarChart data={popData} xLabel="Generacion" yLabel="Neutrones" height={290} /> : <p className="text-sm text-[#7a9ab0]">Ejecuta la simulacion para ver resultados.</p>}
          </Panel>

          <Panel title="Evolucion k" badge="CHART" accent="amber">
            {result ? (
              <LineChart
                series={kSeries}
                xLabels={result.generations.map((g) => String(g))}
                xLabel="Generacion"
                yLabel="k"
                height={260}
              />
            ) : (
              <p className="text-sm text-[#7a9ab0]">Sin datos.</p>
            )}
          </Panel>

          <Panel title="Relacion angulo-energia (dispersion elastica)" badge="EXP-ANG" accent="reactor">
            <div className="mb-3 grid gap-3 sm:grid-cols-[1fr_auto]">
              <div>
                <label className="hud-label mb-1.5 block">Numeros de masa A (separados por coma)</label>
                <input
                  className="input-tech"
                  value={massListInput}
                  onChange={(e) => setMassListInput(e.target.value)}
                  placeholder="1, 12, 23, 56, 238"
                />
              </div>
              <div className="border border-navy-border bg-navy-deep/50 px-3 py-2 font-mono-tech text-xs text-[#7a9ab0]">
                <div>A procesados: {parsedMasses.length}</div>
                <div>Angulos: 0-360 deg</div>
              </div>
            </div>

            {angleEnergySeries.length > 0 ? (
              <LineChart
                series={angleEnergySeries}
                xLabels={angleLabels}
                xLabel="Angulo en CM (deg)"
                yLabel="En'/En"
                height={300}
                yMax={1}
              />
            ) : (
              <p className="text-sm text-[#7a9ab0]">Ingresa al menos un numero de masa valido.</p>
            )}

            <p className="mt-2 border border-navy-border bg-navy-deep/40 px-3 py-2 text-xs text-[#c8e8f0]">{angleConclusion}</p>
          </Panel>

          <Panel title="Distribucion de energia saliente" badge="EXP-EF" accent="cyan">
            <div className="mb-3 grid gap-3 sm:grid-cols-3">
              <NumberInput label="A objetivo" value={scatterMass} min={1} max={260} step={1} onChange={setScatterMass} />
              <NumberInput label="Energia inicial" value={scatterEi} min={0.000001} max={20} step={0.1} unit="MeV" onChange={setScatterEi} />
              <NumberInput label="Muestras" value={scatterSamples} min={1000} max={200000} step={1000} onChange={setScatterSamples} />
            </div>

            <BarChart
              data={scatterEnergyHistogram}
              xLabel="Energia final Ef (MeV)"
              yLabel="Frecuencia"
              height={290}
            />

            <p className="mt-2 text-xs text-[#7a9ab0]">
              Limites teoricos: [{(alphaFromA(Math.max(1, scatterMass)) * Math.max(1e-6, scatterEi)).toExponential(3)} , {Math.max(1e-6, scatterEi).toExponential(3)}] MeV.
            </p>
          </Panel>

          <Panel title="Frenado Monte Carlo" badge="EXP-SLOW" accent="amber">
            <div className="mb-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <NumberInput label="A moderador" value={moderatorMass} min={1} max={260} step={1} onChange={setModeratorMass} />
              <NumberInput label="Ei" value={moderatorEi} min={0.000001} max={20} step={0.1} unit="MeV" onChange={setModeratorEi} />
              <NumberInput label="Ef" value={moderatorEf} min={1e-9} max={1} step={1e-6} unit="MeV" onChange={setModeratorEf} />
              <NumberInput label="Neutrones" value={moderatorNeutrons} min={50} max={10000} step={50} onChange={setModeratorNeutrons} />
            </div>

            <div className="mb-3 flex items-center gap-2">
              <button className="btn-primary" onClick={runModerationStudy}>EJECUTAR ESTUDIO DE FRENADO</button>
              {moderationEvents.length > 0 ? (
                <span className="font-mono-tech text-xs text-[#7a9ab0]">media={moderationStats.mean.toFixed(2)} · sigma={moderationStats.std.toFixed(2)}</span>
              ) : null}
            </div>

            {moderationHistogram.length > 0 ? (
              <BarChart
                data={moderationHistogram}
                xLabel="Eventos de dispersion hasta Ef"
                yLabel="Frecuencia"
                height={280}
              />
            ) : (
              <p className="text-sm text-[#7a9ab0]">Ejecuta el estudio para estimar cuantos choques se necesitan para frenar el neutron.</p>
            )}
          </Panel>

          <Panel title="Muestreo de espectro de Watt (rechazo)" badge="EXP-WATT" accent="critical">
            <div className="mb-3 grid gap-3 sm:grid-cols-3">
              <NumberInput label="Energia maxima" value={wattEmax} min={0.5} max={20} step={0.5} unit="MeV" onChange={setWattEmax} />
              <NumberInput label="Muestras aleatorias" value={wattSamples} min={20} max={2000} step={10} onChange={setWattSamples} />
              <div className="flex items-end">
                <button className="btn-primary w-full" onClick={() => setWattRunId((v) => v + 1)}>RE-MUESTREAR</button>
              </div>
            </div>

            <div className="overflow-x-auto border border-navy-border bg-navy-deep/50 p-2">
              <svg viewBox="0 0 760 280" className="w-full min-w-[700px]">
                <rect x="0" y="0" width="760" height="280" fill="#081623" />

                {Array.from({ length: 6 }, (_, i) => i).map((i) => {
                  const y = 20 + i * 40;
                  return <line key={`gy-${i}`} x1="45" y1={y} x2="735" y2={y} stroke="rgba(122,154,176,0.18)" strokeWidth="1" />;
                })}

                {Array.from({ length: 8 }, (_, i) => i).map((i) => {
                  const x = 45 + i * (690 / 7);
                  return <line key={`gx-${i}`} x1={x} y1="20" x2={x} y2="260" stroke="rgba(122,154,176,0.16)" strokeWidth="1" />;
                })}

                <polyline
                  fill="none"
                  stroke="#22d3ee"
                  strokeWidth="2"
                  points={Array.from({ length: 300 }, (_, i) => {
                    const x = (i / 299) * wattStudy.eMax;
                    const y = wattSpectrum(x);
                    const px = 45 + (x / wattStudy.eMax) * 690;
                    const py = 260 - (y / wattStudy.maxW) * 240;
                    return `${px},${py}`;
                  }).join(' ')}
                />

                {wattStudy.samples.map((p, i) => {
                  const px = 45 + (p.x / wattStudy.eMax) * 690;
                  const py = 260 - (p.y / wattStudy.maxW) * 240;
                  return (
                    <circle
                      key={`pt-${i}`}
                      cx={px}
                      cy={py}
                      r="2.4"
                      fill={p.accepted ? '#34d399' : '#f43f5e'}
                      fillOpacity="0.85"
                    />
                  );
                })}

                <text x="48" y="16" fill="#c8e8f0" fontSize="11" className="font-mono-tech">chi(E)</text>
                <text x="650" y="274" fill="#c8e8f0" fontSize="11" className="font-mono-tech">E (MeV)</text>
              </svg>
            </div>

            <p className="mt-2 text-xs text-[#7a9ab0]">
              Aceptados: {wattStudy.accepted}/{wattStudy.samples.length} · Eficiencia estimada: {(100 * wattStudy.efficiency).toFixed(1)}%
              {' '}· Verde = aceptado, rojo = rechazado.
            </p>
          </Panel>
        </div>
      </div>
    </div>
  );
}
