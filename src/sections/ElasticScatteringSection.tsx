import { useMemo, useState, useEffect } from 'react';
import { Activity, Gauge, Waves, Info } from 'lucide-react';
import Panel from '../components/Panel';
import NumberInput from '../components/NumberInput';
import StatCard from '../components/StatCard';
import LineChart from '../components/LineChart';

import { computeElasticScattering, type ScatteringResult } from '../lib/physics';

const MASS_PRESETS = [
  { label: '¹H (Hidrógeno)', mass: 1 },
  { label: '²D (Deuterio)', mass: 2 },
  { label: '¹²C (Carbono)', mass: 12 },
  { label: '⁵⁶Fe (Hierro)', mass: 56 },
  { label: '²³⁸U (Uranio)', mass: 238 },
];

export default function ElasticScatteringSection() {
  const [energy, setEnergy] = useState(2.0);
  const [mass, setMass] = useState(56);
  const [points, setPoints] = useState(180);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ScatteringResult | null>(null);

  const run = () => {
    setLoading(true);
    setError(null);
    try {
      const payload = computeElasticScattering(energy, mass, points);
      setResult(payload);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error al calcular dispersión');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    run();
  }, []);

  const energySeries = useMemo(() => {
    if (!result) return [];
    return [{ name: 'Energía Final Ef (MeV)', color: '#1976D2', data: result.energy_after.map((v) => Number(v ?? 0)) }];
  }, [result]);

  const sigmaSeries = useMemo(() => {
    if (!result) return [];
    return [{ name: 'Sección Eficaz σ(E) [barn]', color: '#123B5D', data: result.cross_section.map((v) => Number(v ?? 0)) }];
  }, [result]);

  return (
    <div className="animate-fade-up space-y-6">
      {/* Header */}
      <div className="border-b border-slate-border pb-3">
        <span className="font-mono-tech text-xs font-bold uppercase tracking-wider text-techno">
          SUB-02 · CINEMÁTICA NUCLEAR
        </span>
        <h2 className="font-display text-2xl font-bold tracking-tight text-nuclear-deep sm:text-3xl mt-0.5">
          Dispersión Elástica Neutrón-Núcleo
        </h2>
        <p className="font-body text-xs text-slate-secondary mt-1">
          Relación cinemática entre el ángulo de dispersión en el Centro de Masas (CM), masa del blanco (A) y energía residual del neutrón moderado.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[340px_1fr]">
        {/* Left Column: Parameters */}
        <div className="space-y-4">
          <Panel title="Parámetros de Entrada" badge="CINEMÁTICA" accent="nuclear">
            <div className="space-y-4">
              <NumberInput
                label="Energía Neutrónica Incidente (Ei)"
                value={energy}
                min={0.01}
                max={50}
                step={0.1}
                unit="MeV"
                onChange={setEnergy}
              />

              <div>
                <NumberInput
                  label="Número de Masa del Blanco (A)"
                  value={mass}
                  min={1}
                  max={260}
                  step={1}
                  onChange={setMass}
                />
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {MASS_PRESETS.map((p) => (
                    <button
                      key={p.mass}
                      type="button"
                      onClick={() => setMass(p.mass)}
                      className={`font-mono-tech text-[10px] px-2 py-1 rounded border transition-colors ${
                        mass === p.mass
                          ? 'bg-nuclear-deep text-white border-nuclear-deep font-bold'
                          : 'bg-slate-50 text-slate-secondary border-slate-border hover:bg-slate-100'
                      }`}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>

              <NumberInput
                label="Puntos de Muestreo Angular"
                value={points}
                min={20}
                max={360}
                step={10}
                onChange={setPoints}
              />

              <button onClick={run} className="btn-primary w-full shadow-sm mt-2" disabled={loading}>
                {loading ? 'CALCULANDO CINEMÁTICA...' : 'EJECUTAR CÁLCULO'}
              </button>

              {error && <p className="text-xs text-critical font-medium">{error}</p>}
            </div>
          </Panel>

          {/* Mathematical Foundation Card */}
          <Panel title="Formulación Física" badge="TEORÍA" accent="cyan">
            <div className="font-mono-tech text-xs text-nuclear-deep space-y-2 bg-slate-50 p-3 rounded-lg border border-slate-border">
              <div>
                <span className="text-slate-secondary block text-[10px]">Parámetro de colisión α:</span>
                <span className="font-bold">α = ((A - 1) / (A + 1))²</span>
              </div>
              <div className="pt-2 border-t border-slate-border/80">
                <span className="text-slate-secondary block text-[10px]">Energía dispersada Ef(θ):</span>
                <span className="font-bold text-[11px]">Ef = Ei/2 · [(1 + α) + (1 - α)cos θ]</span>
              </div>
              <div className="pt-2 border-t border-slate-border/80 text-[10px] text-slate-secondary">
                <Info size={12} className="inline mr-1 text-techno" />
                Para Hidrógeno (A=1), α=0: el neutrón puede perder hasta el 100% de su energía en una colisión frontal.
              </div>
            </div>
          </Panel>
        </div>

        {/* Right Column: Computed Metrics & Interactive Graphs */}
        <div className="space-y-6">
          <Panel title="Métricas Cinemáticas Calculadas" badge="RESULTADOS" accent="amber">
            <div className="grid gap-3 sm:grid-cols-3">
              <StatCard
                label="Parámetro α"
                value={(result?.alpha ?? 0).toFixed(6)}
                sublabel="Fracción mínima transferida"
                icon={<Gauge size={16} />}
                accent="cyan"
              />
              <StatCard
                label="Energía Residual Mínima"
                value={`${(result?.min_energy ?? 0).toFixed(4)} MeV`}
                sublabel="Colisión frontal (θ = 180°)"
                icon={<Waves size={16} />}
                accent="nuclear"
              />
              <StatCard
                label="Pérdida Máxima de Energía"
                value={`${(((result?.max_energy_loss_fraction ?? 0) * 100).toFixed(2))}%`}
                sublabel="(1 - α) · 100%"
                icon={<Activity size={16} />}
                accent="amber"
              />
            </div>
          </Panel>

          <Panel title="Curva de Energía Residual vs Ángulo de Dispersión (CM)" badge="GRÁFICA Ef(θ)" accent="nuclear">
            {result ? (
              <LineChart
                series={energySeries}
                xLabels={result.angles_deg.map((a) => a.toFixed(0))}
                xLabel="Ángulo de Dispersión θ en Centro de Masas (grados °)"
                yLabel="Energía Residual del Neutrón Ef (MeV)"
                height={280}
              />
            ) : (
              <p className="text-sm text-slate-secondary p-4 text-center">Ejecuta el cálculo para visualizar la curva.</p>
            )}
          </Panel>

          <Panel title="Sección Eficaz Microscópica Diferencial Estimada σ(E)" badge="RESONANCIA" accent="cyan">
            {result ? (
              <LineChart
                series={sigmaSeries}
                xLabels={result.energies_grid.map((e) => e.toFixed(2))}
                xLabel="Energía Neutrónica Incident (MeV)"
                yLabel="Sección Eficaz Microscópica σ (barn)"
                height={280}
              />
            ) : (
              <p className="text-sm text-slate-secondary p-4 text-center">Sin datos de sección eficaz.</p>
            )}
          </Panel>
        </div>
      </div>
    </div>
  );
}
