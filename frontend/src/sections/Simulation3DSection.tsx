import Panel from '../components/Panel';

export default function Simulation3DSection() {
  return (
    <div className="animate-fade-up space-y-4">
      <div>
        <span className="hud-label">MOD-04 · VISUALIZACION</span>
        <h2 className="mt-2 font-display text-2xl font-bold tracking-wide text-white sm:text-3xl">
          Simulacion 3D de Fision
        </h2>
      </div>

      <Panel title="Simulacion interactiva" badge="3D" accent="reactor" className="overflow-hidden">
        <iframe
          src="/django/api/fision/"
          title="Simulacion de Fision Nuclear"
          className="h-[70vh] w-full border border-navy-border bg-navy-deep"
        />
      </Panel>
    </div>
  );
}
