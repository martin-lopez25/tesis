import { useState } from 'react';
import Header from './components/Header';
import LandingPage from './components/LandingPage';
import MonteCarloSection from './sections/MonteCarloSection';
import ElasticScatteringSection from './sections/ElasticScatteringSection';
import Simulation3DSection from './sections/Simulation3DSection';
import ReactorSection from './sections/ReactorSection';

type Tab = 'monte-carlo' | 'dispersion' | 'simulacion-3d' | 'reactor';

function App() {
  const [view, setView] = useState<'landing' | 'lab'>('landing');
  const [tab, setTab] = useState<Tab>('monte-carlo');

  const enterLab = (target: string) => {
    setTab(target as Tab);
    setView('lab');
  };

  const goHome = () => setView('landing');

  if (view === 'landing') {
    return (
      <div className="relative min-h-screen bg-navy-deep">
        <div className="pointer-events-none fixed inset-0 circuit-grid opacity-40" />
        <div className="pointer-events-none fixed inset-0 scanline opacity-30" />
        <div className="relative z-10">
          <LandingPage onEnter={enterLab} />
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-navy-deep">
      <div className="pointer-events-none fixed inset-0 circuit-grid opacity-30" />
      <div className="pointer-events-none fixed inset-0 scanline opacity-20" />

      <div className="relative z-10">
        <Header activeTab={tab} onTabChange={(t) => setTab(t as Tab)} onHome={goHome} />

        <main className="mx-auto max-w-7xl px-4 py-6">
          {tab === 'monte-carlo' && <MonteCarloSection />}
          {tab === 'dispersion' && <ElasticScatteringSection />}
          {tab === 'reactor' && <ReactorSection />}
          {tab === 'simulacion-3d' && <Simulation3DSection />}
        </main>

        <footer className="mt-8 border-t border-navy-border">
          <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 px-4 py-6 text-center sm:flex-row sm:text-left">
            <span className="font-display text-xs font-bold uppercase tracking-widest text-[#c8e8f0]">
              NuclearLab · {new Date().getFullYear()}
            </span>
            <span className="font-mono-tech text-[10px] text-[#7a9ab0]">
              Open educational tool · Simulated data · No real radiation
            </span>
          </div>
        </footer>
      </div>
    </div>
  );
}

export default App;
