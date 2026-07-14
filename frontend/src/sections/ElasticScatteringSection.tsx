import { useMemo, useState } from 'react';
import { Activity, Gauge, Waves } from 'lucide-react';
import Panel from '../components/Panel';
import NumberInput from '../components/NumberInput';
import StatCard from '../components/StatCard';
import LineChart from '../components/LineChart';

type ScatteringResult = {
  angles_deg: number[];
  energy_after: number[];
  energies_grid: number[];
  cross_section: number[];
  alpha: number;
  min_energy: number;
  max_energy_loss_fraction: number;
};

export default function ElasticScatteringSection() {
  const [energy, setEnergy] = useState(2);
  const [mass, setMass] = useState(56);
  const [points, setPoints] = useState(180);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ScatteringResult | null>(null);

  const run = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/django/api/simulations/scattering-elastic/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ initial_energy: energy, nucleus_mass: mass, num_points: points }),
      });
      const payload = (await res.json()) as ScatteringResult | { error: string };
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

  const energySeries = useMemo(() => {
    if (!result) return [];
    return [{ name: 'Energia (MeV)', color: '#fbbf24', data: result.energy_after.map((v) => Number(v ?? 0)) }];
  }, [result]);

  const sigmaSeries = useMemo(() => {
    if (!result) return [];
    return [{ name: 'Sigma', color: '#22d3ee', data: result.cross_section.map((v) => Number(v ?? 0)) }];
  }, [result]);

  return (
    <div className="animate-fade-up space-y-4">
      <div>
        <span className="hud-label">MOD-02 · NEUTRONES</span>
        <h2 className="mt-2 font-display text-2xl font-bold tracking-wide text-white sm:text-3xl">
          Dispersion Elastica
        </h2>
      </div>

      <div className="grid gap-4 lg:grid-cols-[320px_1fr]">
        <Panel title="Parametros" badge="INPUT" accent="cyan">
          <div className="space-y-3">
            <NumberInput label="Energia inicial" value={energy} min={0.01} max={50} step={0.01} unit="MeV" onChange={setEnergy} />
            <NumberInput label="Masa nuclear (A)" value={mass} min={1} max={260} step={1} onChange={setMass} />
            <NumberInput label="Puntos de muestreo" value={points} min={10} max={360} step={1} onChange={setPoints} />
            <button onClick={run} className="btn-primary w-full" disabled={loading}>
              {loading ? 'CALCULANDO...' : 'CALCULAR'}
            </button>
            {error ? <p className="text-xs text-critical">{error}</p> : null}
          </div>
        </Panel>

        <div className="space-y-4">
          <Panel title="Metricas" badge="LIVE" accent="amber">
            <div className="grid gap-2 sm:grid-cols-3">
              <StatCard label="Alpha" value={(result?.alpha ?? 0).toFixed(6)} icon={<Gauge size={14} />} accent="cyan" />
              <StatCard label="Energia minima" value={`${(result?.min_energy ?? 0).toFixed(4)} MeV`} icon={<Waves size={14} />} accent="amber" />
              <StatCard label="Perdida maxima" value={`${(((result?.max_energy_loss_fraction ?? 0) * 100).toFixed(2))}%`} icon={<Activity size={14} />} accent="critical" />
            </div>
          </Panel>

          <Panel title="Energia vs Angulo" badge="CHART" accent="cyan">
            {result ? (
              <LineChart
                series={energySeries}
                xLabels={result.angles_deg.map((a) => a.toFixed(0))}
                xLabel="Angulo (deg)"
                yLabel="Energia (MeV)"
                height={290}
              />
            ) : (
              <p className="text-sm text-[#7a9ab0]">Ejecuta el calculo para ver la curva.</p>
            )}
          </Panel>

          <Panel title="Seccion eficaz aproximada" badge="CHART" accent="reactor">
            {result ? (
              <LineChart
                series={sigmaSeries}
                xLabels={result.energies_grid.map((e) => e.toFixed(2))}
                xLabel="Energia"
                yLabel="Sigma"
                height={290}
              />
            ) : (
              <p className="text-sm text-[#7a9ab0]">Sin datos.</p>
            )}
          </Panel>
        </div>
      </div>
    </div>
  );
}
