import { Home, Radio, Activity, ShieldCheck } from 'lucide-react';
import AtomLogo from './AtomLogo';

interface HeaderProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  onHome: () => void;
}

const TABS = [
  { id: 'monte-carlo', label: 'Monte Carlo', sub: 'Criticalidad', code: 'MOD-01' },
  { id: 'dispersion', label: 'Dispersion Elastica', sub: 'Neutrones', code: 'MOD-02' },
  { id: 'reactor', label: 'Reactor Nuclear', sub: 'Ciclo Energetico', code: 'MOD-03' },
  { id: 'simulacion-3d', label: 'Simulacion 3D', sub: 'Reaccion Nuclear', code: 'MOD-04' },
];

export default function Header({ activeTab, onTabChange, onHome }: HeaderProps) {
  return (
    <header className="sticky top-0 z-50 border-b border-navy-border bg-navy-deep/90 backdrop-blur-lg">
      <div className="border-b border-navy-border/50">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-x-5 gap-y-1 px-4 py-1.5 font-mono-tech text-[9px] uppercase tracking-widest">
          <span className="flex items-center gap-1.5 text-reactor">
            <span className="h-1.5 w-1.5 bg-reactor animate-pulse-reactor" />
            SYS · ONLINE
          </span>
          <span className="hidden items-center gap-1.5 text-[#fbbf24] sm:flex">
            <Radio size={10} /> 0.18 uSv/h
          </span>
          <span className="hidden items-center gap-1.5 text-[#22d3ee] sm:flex">
            <Activity size={10} /> NEUTRON FLUX: NOMINAL
          </span>
          <span className="hidden items-center gap-1.5 text-[#7a9ab0] lg:flex">
            <ShieldCheck size={10} className="text-reactor" /> SIMULATED DATA
          </span>
          <span className="ml-auto hidden text-[#7a9ab0] lg:inline">{new Date().toISOString().slice(11, 19)} UTC</span>
        </div>
      </div>

      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3">
        <button onClick={onHome} className="flex shrink-0 items-center gap-3 transition-opacity hover:opacity-80">
          <AtomLogo size={38} />
          <div className="hidden sm:block">
            <div className="font-display text-base font-bold tracking-widest text-white">
              NUCLEAR<span className="text-reactor">LAB</span>
            </div>
            <div className="font-mono-tech text-[9px] uppercase tracking-[0.3em] text-[#22d3ee]/50">LAB v2.4</div>
          </div>
        </button>

        <nav className="flex flex-1 flex-wrap items-center justify-center gap-1">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`tab-btn ${
                activeTab === tab.id
                  ? 'tab-btn-active border-b-2 border-reactor'
                  : 'tab-btn-inactive border-b-2 border-transparent'
              }`}
            >
              <span className="font-mono-tech text-[9px] opacity-50">{tab.code}</span>
              <span className="hidden text-sm md:inline">{tab.label}</span>
              <span className="text-sm md:hidden">{tab.label.split(' ')[0]}</span>
            </button>
          ))}
        </nav>

        <button
          onClick={onHome}
          className="flex shrink-0 items-center gap-1.5 border border-navy-border px-3 py-2 font-display text-[10px] font-bold uppercase tracking-widest text-[#22d3ee] transition-all hover:border-[#22d3ee]/60 hover:bg-[#22d3ee]/5"
        >
          <Home size={14} />
          <span className="hidden sm:inline">INICIO</span>
        </button>
      </div>
    </header>
  );
}
