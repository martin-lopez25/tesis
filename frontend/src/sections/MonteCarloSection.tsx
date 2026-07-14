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

export default function MonteCarloSection() {
  const [initial, setInitial] = useState(1000);
  const [generations, setGenerations] = useState(30);
  const [probability, setProbability] = useState(0.55);
  const [nu, setNu] = useState(2.43);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<MonteCarloResult | null>(null);

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
        </div>
      </div>
    </div>
  );
}
