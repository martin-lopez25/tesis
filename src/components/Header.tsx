import { Home, Radio, Activity, ShieldCheck, ChevronLeft } from 'lucide-react';
import AtomLogo from './AtomLogo';

interface HeaderProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  onHome: () => void;
  onBackToHub?: () => void;
}

const TABS = [
  { id: 'monte-carlo', label: 'Monte Carlo', sub: 'Criticalidad', code: 'SUB-01' },
  { id: 'dispersion', label: 'Dispersión Elástica', sub: 'Cinemática', code: 'SUB-02' },
  { id: 'reactor', label: 'Reactor Simulación', sub: 'Termohidráulica', code: 'SUB-03' },
  { id: 'decaimiento', label: 'Decaimiento & Bateman', sub: 'Inventario', code: 'SUB-04' },
  { id: 'simulacion-fision', label: 'Fisión 3D', sub: 'Visualización', code: 'SUB-05' },
];

export default function Header({ activeTab, onTabChange, onHome, onBackToHub }: HeaderProps) {
  return (
    <header className="sticky top-0 z-40 border-b border-slate-border bg-white/95 backdrop-blur-md shadow-sm">
      {/* Top Academic Telemetry Bar */}
      <div className="border-b border-slate-border/80 bg-slate-50 px-4 py-1.5 font-mono-tech text-[10px] text-slate-secondary">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5 font-semibold text-emerald-700">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              SISTEMA NOMINAL · EN LÍNEA
            </span>
            <span className="hidden items-center gap-1 text-slate-secondary sm:flex">
              <Radio size={11} className="text-amber-600" /> Tasa de dosis de fondo: 0.18 µSv/h
            </span>
            <span className="hidden items-center gap-1 text-slate-secondary md:flex">
              <Activity size={11} className="text-techno" /> Flujo neutrónico térmico: Estable
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1 text-[9px] uppercase tracking-wider text-slate-secondary bg-white px-2 py-0.5 rounded border border-slate-border">
              <ShieldCheck size={11} className="text-techno" /> Datos simulados con rigor físico
            </span>
          </div>
        </div>
      </div>

      {/* Main Navigation Row */}
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-2.5">
        <div className="flex items-center gap-3">
          {onBackToHub && (
            <button
              onClick={onBackToHub}
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-border text-slate-secondary hover:border-techno hover:bg-azure-light hover:text-techno sm:hidden"
              title="Volver al panel del reactor"
            >
              <ChevronLeft size={18} />
            </button>
          )}

          <button onClick={onHome} className="flex items-center gap-2.5 transition-opacity hover:opacity-85 text-left">
            <AtomLogo size={34} />
            <div>
              <div className="font-display text-base font-bold tracking-tight text-nuclear-deep leading-none">
                NUCLEAR<span className="text-techno">LAB</span>
              </div>
              <div className="font-mono-tech text-[9px] uppercase tracking-widest text-slate-secondary mt-0.5">
                Laboratorio Virtual de Física
              </div>
            </div>
          </button>
        </div>

        {/* Submodule tabs */}
        <nav className="flex flex-1 flex-nowrap items-center justify-start gap-1 overflow-x-auto overscroll-x-contain px-2 sm:justify-center">
          {TABS.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={`flex items-center gap-1.5 whitespace-nowrap rounded-lg px-3 py-1.5 font-display text-xs font-bold uppercase tracking-wider transition-all duration-150 ${
                  isActive
                    ? 'bg-nuclear-deep text-white shadow-sm'
                    : 'text-slate-secondary hover:bg-slate-100 hover:text-nuclear-deep'
                }`}
              >
                <span className="hidden font-mono-tech text-[9px] opacity-70 sm:inline">{tab.code}</span>
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Home CTA */}
        <button
          onClick={onHome}
          className="flex shrink-0 items-center gap-1.5 rounded-lg border border-slate-border bg-slate-50 px-3 py-1.5 font-display text-xs font-bold uppercase tracking-wider text-nuclear-deep transition-all hover:border-techno hover:bg-azure-light hover:text-techno"
        >
          <Home size={13} />
          <span className="hidden sm:inline">INICIO</span>
        </button>
      </div>
    </header>
  );
}
