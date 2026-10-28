import { useMemo, useState, useEffect } from 'react';
import { Activity, Gauge, Layers3, ShieldCheck } from 'lucide-react';
import Panel from '../components/Panel';
import NumberInput from '../components/NumberInput';
import StatCard from '../components/StatCard';
import BarChart from '../components/BarChart';
import LineChart from '../components/LineChart';

import { computeMonteCarloFission, type MonteCarloResult } from '../lib/physics';

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
      label: x0.toFixed(2),
      value: count,
      color: '#1976D2',
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

  const [moderatorMass, setModeratorMass] = useState(12);
  const [moderatorEi, setModeratorEi] = useState(2.0);
  const [moderatorEf, setModeratorEf] = useState(1e-6);
  const [moderatorNeutrons, setModeratorNeutrons] = useState(1000);
  const [moderationEvents, setModerationEvents] = useState<number[]>([]);

  const [wattEmax, setWattEmax] = useState(10);
  const [wattSamples, setWattSamples] = useState(120);
  const [wattRunId, setWattRunId] = useState(0);

  const run = () => {
    setLoading(true);
    setError(null);
    try {
      const payload = computeMonteCarloFission(initial, generations, probability, nu);
      setResult(payload);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error al calcular simulación');
    } finally {
      setLoading(false);
    }
  };

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

  useEffect(() => {
    run();
    runModerationStudy();
  }, []);

  const popData = useMemo(() => {
    if (!result) return [];
    return result.generations.map((g, i) => ({
      label: String(g),
      value: Number(result.population[i] ?? 0),
      color: '#1976D2',
    }));
  }, [result]);

  const kSeries = useMemo(() => {
    if (!result) return [];
    return [
      {
        name: 'k efectivo por generación',
        color: '#123B5D',
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
    const palette = ['#1976D2', '#123B5D', '#F4C542', '#10B981', '#E11D48', '#8B5CF6', '#0284C7', '#D97706'];
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
    return buildHistogram(moderationEvents, 35);
  }, [moderationEvents]);

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

  const regimeBadge = useMemo(() => {
    if (!result) return null;
    if (result.regime === 'critical') {
      return { text: 'CRÍTICO ESTACIONARIO (k ≈ 1.00)', bg: 'bg-emerald-50 text-emerald-800 border-emerald-300' };
    }
    if (result.regime === 'supercritical') {
      return { text: 'SUPERCRÍTICO (k > 1.02) - CRECIMIENTO EXPONENCIAL', bg: 'bg-rose-50 text-rose-800 border-rose-300' };
    }
    return { text: 'SUBCRÍTICO (k < 0.98) - EXTINCIÓN NEUTRÓNICA', bg: 'bg-amber-50 text-amber-800 border-amber-300' };
  }, [result]);

  return (
    <div className="animate-fade-up space-y-6">
      {/* Submodule Header */}
      <div className="border-b border-slate-border pb-3">
        <span className="font-mono-tech text-xs font-bold uppercase tracking-wider text-techno">
          SUB-01 · FÍSICA ESTOCÁSTICA
        </span>
        <h2 className="font-display text-2xl font-bold tracking-tight text-nuclear-deep sm:text-3xl mt-0.5">
          Simulación Monte Carlo de Criticalidad
        </h2>
        <p className="font-body text-xs text-slate-secondary mt-1">
          Muestreo estocástico de fisión nuclear multigeneracional, factor de multiplicación efectivo (k_eff), moderación neutrónica y espectro de fisión de Watt.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[340px_1fr]">
        {/* Left Parameter Panel */}
        <div className="space-y-4">
          <Panel title="Parámetros de Simulación" badge="INPUT" accent="nuclear">
            <div className="space-y-4">
              <NumberInput
                label="Neutrones Iniciales (N₀)"
                value={initial}
                min={10}
                max={100000}
                step={100}
                onChange={setInitial}
              />
              <NumberInput
                label="Generaciones a Simular (g)"
                value={generations}
                min={5}
                max={200}
                step={5}
                onChange={setGenerations}
              />
              <NumberInput
                label="Probabilidad de Fisión (p)"
                value={probability}
                min={0}
                max={1}
                step={0.01}
                onChange={setProbability}
              />
              <NumberInput
                label="Neutrones Liberados por Fisión (ν)"
                value={nu}
                min={1}
                max={5}
                step={0.01}
                onChange={setNu}
              />

              <button
                onClick={run}
                className="btn-primary w-full shadow-sm mt-2"
                disabled={loading}
              >
                {loading ? 'SIMULANDO MONTE CARLO...' : 'EJECUTAR SIMULACIÓN'}
              </button>

              {error && <p className="text-xs text-critical font-medium">{error}</p>}
            </div>
          </Panel>

          {/* Regime Indicator Card */}
          {regimeBadge && (
            <div className={`p-4 rounded-xl border font-mono-tech text-xs space-y-1 shadow-sm ${regimeBadge.bg}`}>
              <div className="font-bold flex items-center gap-1.5">
                <ShieldCheck size={14} />
                <span>Régimen Operativo:</span>
              </div>
              <div className="font-display font-bold text-sm tracking-wide">
                {regimeBadge.text}
              </div>
            </div>
          )}

          {/* Theoretical Box */}
          <Panel title="Fundamento Monte Carlo" badge="TEORÍA" accent="cyan">
            <div className="font-mono-tech text-xs text-nuclear-deep space-y-2 bg-slate-50 p-3 rounded-lg border border-slate-border">
              <p className="text-slate-secondary text-[11px] leading-relaxed">
                Cada neutrón de la población tiene una probabilidad estocástica <span className="font-bold text-nuclear-deep">p</span> de inducir fisión. La cantidad de nuevos neutrones emitidos sigue una distribución de Poisson con media <span className="font-bold text-nuclear-deep">ν = 2.43</span>.
              </p>
              <div className="pt-2 border-t border-slate-border text-[11px]">
                <span className="text-slate-secondary">Condición crítica: </span>
                <span className="font-bold text-techno">k = p · ν ≈ 1.00</span>
              </div>
            </div>
          </Panel>
        </div>

        {/* Right Output Dashboard */}
        <div className="space-y-6">
          <Panel title="Métricas Globales de la Población" badge="RESULTADOS" accent="amber">
            <div className="grid gap-3 sm:grid-cols-3">
              <StatCard
                label="Población Final"
                value={Number(result?.final_population ?? 0).toLocaleString()}
                sublabel="Neutrones en la última generación"
                icon={<Layers3 size={16} />}
                accent="cyan"
              />
              <StatCard
                label="Total de Fisiones"
                value={Number(result?.total_fissions ?? 0).toLocaleString()}
                sublabel="Reacciones nucleares ocurridas"
                icon={<Gauge size={16} />}
                accent="nuclear"
              />
              <StatCard
                label="k Efectivo Medio"
                value={(result?.average_k ?? 0).toFixed(4)}
                sublabel="Factor de multiplicación generacional"
                icon={<Activity size={16} />}
                accent="amber"
              />
            </div>
          </Panel>

          <Panel title="Población Neutrónica por Generación" badge="HISTOGRAMA" accent="nuclear">
            {result ? (
              <BarChart
                data={popData}
                xLabel="Generación"
                yLabel="Número de Neutrones Libres"
                height={280}
              />
            ) : (
              <p className="text-sm text-slate-secondary p-4 text-center">Ejecuta la simulación para visualizar la evolución temporal.</p>
            )}
          </Panel>

          <Panel title="Evolución del Factor de Multiplicación k_eff" badge="ESTABILIDAD" accent="cyan">
            {result ? (
              <LineChart
                series={kSeries}
                xLabels={result.generations.map((g) => String(g))}
                xLabel="Generación"
                yLabel="Factor k_eff"
                height={260}
              />
            ) : (
              <p className="text-sm text-slate-secondary p-4 text-center">Sin datos generacionales de k_eff.</p>
            )}
          </Panel>

          {/* Sub-Experiment: Angular Energy Ratio */}
          <Panel title="Dependencia Angular de la Energía Saliente (LAB/CM)" badge="MULTIMASA" accent="nuclear">
            <div className="mb-4 space-y-2">
              <label className="font-mono-tech text-xs font-semibold text-nuclear-deep block">
                Números de masa diana A (separados por coma):
              </label>
              <div className="flex gap-2">
                <input
                  className="input-tech flex-1"
                  value={massListInput}
                  onChange={(e) => setMassListInput(e.target.value)}
                  placeholder="1, 12, 23, 56, 238"
                />
              </div>
            </div>

            {angleEnergySeries.length > 0 ? (
              <LineChart
                series={angleEnergySeries}
                xLabels={angleLabels}
                xLabel="Ángulo θ en el Centro de Masas (grados °)"
                yLabel="Razón de energía Ef / Ei"
                height={290}
                yMax={1}
              />
            ) : (
              <p className="text-sm text-slate-secondary">Ingresa al menos un número de masa válido.</p>
            )}
          </Panel>

          {/* Sub-Experiment: Moderation Study */}
          <Panel title="Estudio de Letargia y Moderación Neutrónica" badge="TERMALIZACIÓN" accent="amber">
            <div className="mb-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <NumberInput label="Masa Moderador (A)" value={moderatorMass} min={1} max={260} step={1} onChange={setModeratorMass} />
              <NumberInput label="Energía Inicial (Ei)" value={moderatorEi} min={0.01} max={20} step={0.1} unit="MeV" onChange={setModeratorEi} />
              <NumberInput label="Energía Final Térmica (Ef)" value={moderatorEf} min={1e-8} max={0.1} step={1e-5} unit="MeV" onChange={setModeratorEf} />
              <NumberInput label="Neutrones a Muestrear" value={moderatorNeutrons} min={50} max={10000} step={50} onChange={setModeratorNeutrons} />
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 mb-3 p-3 bg-slate-50 rounded-lg border border-slate-border">
              <button className="btn-secondary text-xs px-4 py-2" onClick={runModerationStudy}>
                SIMULAR FRENADO NEUTRÓNICO
              </button>
              {moderationEvents.length > 0 && (
                <div className="font-mono-tech text-xs text-nuclear-deep font-semibold">
                  Colisiones medias: <span className="text-techno">{moderationStats.mean.toFixed(1)}</span> (σ = {moderationStats.std.toFixed(1)})
                </div>
              )}
            </div>

            {moderationHistogram.length > 0 ? (
              <BarChart
                data={moderationHistogram}
                xLabel="Número de Colisiones Elásticas hasta Termalización"
                yLabel="Frecuencia (Neutrones)"
                height={280}
              />
            ) : (
              <p className="text-sm text-slate-secondary p-4 text-center">Ejecuta el estudio para estimar el número de choques requeridos para frenar el neutrón rápido.</p>
            )}
          </Panel>

          {/* Sub-Experiment: Watt Fission Spectrum */}
          <Panel title="Muestreo del Espectro de Fisión de Watt" badge="RECHAZO DE VON NEUMANN" accent="nuclear">
            <div className="mb-4 grid gap-3 sm:grid-cols-3">
              <NumberInput label="Energía Máxima (Emax)" value={wattEmax} min={0.5} max={20} step={0.5} unit="MeV" onChange={setWattEmax} />
              <NumberInput label="Muestras Aleatorias" value={wattSamples} min={20} max={2000} step={10} onChange={setWattSamples} />
              <div className="flex items-end">
                <button className="btn-primary w-full shadow-sm" onClick={() => setWattRunId((v) => v + 1)}>
                  RE-MUESTREAR ESPECTRO
                </button>
              </div>
            </div>

            <div className="min-w-0 w-full rounded-xl border border-slate-border bg-white p-3 shadow-sm">
              <svg viewBox="0 0 760 280" className="block h-auto w-full max-w-full">
                {/* Subtle grid */}
                {Array.from({ length: 6 }, (_, i) => i).map((i) => {
                  const y = 20 + i * 40;
                  return <line key={`gy-${i}`} x1="45" y1={y} x2="735" y2={y} stroke="#E2E8F0" strokeWidth="1" strokeDasharray="3 3" />;
                })}

                {Array.from({ length: 8 }, (_, i) => i).map((i) => {
                  const x = 45 + i * (690 / 7);
                  return <line key={`gx-${i}`} x1={x} y1="20" x2={x} y2="260" stroke="#E2E8F0" strokeWidth="1" strokeDasharray="3 3" />;
                })}

                {/* Axes */}
                <line x1="45" y1="20" x2="45" y2="260" stroke="#CBD5E1" strokeWidth="1.5" />
                <line x1="45" y1="260" x2="735" y2="260" stroke="#CBD5E1" strokeWidth="1.5" />

                {/* Continuous Watt Spectrum Theoretical Curve */}
                <polyline
                  fill="none"
                  stroke="#1976D2"
                  strokeWidth="2.5"
                  points={Array.from({ length: 300 }, (_, i) => {
                    const x = (i / 299) * wattStudy.eMax;
                    const y = wattSpectrum(x);
                    const px = 45 + (x / wattStudy.eMax) * 690;
                    const py = 260 - (y / wattStudy.maxW) * 240;
                    return `${px},${py}`;
                  }).join(' ')}
                />

                {/* Monte Carlo Accepted vs Rejected Points */}
                {wattStudy.samples.map((p, i) => {
                  const px = 45 + (p.x / wattStudy.eMax) * 690;
                  const py = 260 - (p.y / wattStudy.maxW) * 240;
                  return (
                    <circle
                      key={`pt-${i}`}
                      cx={px}
                      cy={py}
                      r="3.5"
                      fill={p.accepted ? '#10B981' : '#EF4444'}
                      fillOpacity={p.accepted ? 0.9 : 0.6}
                    />
                  );
                })}

                <text x="50" y="16" fill="#123B5D" fontSize="11" fontWeight="600" className="font-mono-tech">χ(E) [Probabilidad / MeV]</text>
                <text x="640" y="275" fill="#123B5D" fontSize="11" fontWeight="600" className="font-mono-tech">Energía E (MeV)</text>
              </svg>
            </div>

            <div className="mt-3 flex flex-wrap items-center justify-between text-xs font-mono-tech text-slate-secondary p-2 bg-slate-50 rounded-lg border border-slate-border">
              <span>Muestras aceptadas: <strong className="text-emerald-700">{wattStudy.accepted}</strong> / {wattStudy.samples.length}</span>
              <span>Eficiencia del método: <strong className="text-techno">{(100 * wattStudy.efficiency).toFixed(1)}%</strong></span>
              <span className="flex items-center gap-2">
                <span className="inline-block h-2.5 w-2.5 rounded-full bg-emerald-500" /> Aceptado
                <span className="inline-block h-2.5 w-2.5 rounded-full bg-rose-500 ml-2" /> Rechazado
              </span>
            </div>
          </Panel>
        </div>
      </div>
    </div>
  );
}
