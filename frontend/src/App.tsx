import { useState } from 'react';
import { Activity, FlaskConical, Radio, Zap, ChevronRight, Box } from 'lucide-react';
import Header from './components/Header';
import LandingPage from './components/LandingPage';
import MonteCarloSection from './sections/MonteCarloSection';
import ElasticScatteringSection from './sections/ElasticScatteringSection';
import ReactorSection from './sections/ReactorSection';
import DecaySection from './sections/DecaySection';
import Simulation3DSection from './sections/Simulation3DSection';
import Panel from './components/Panel';

type ReactorTab = 'monte-carlo' | 'dispersion' | 'reactor' | 'decaimiento' | 'simulacion-fision';
type MainView = 'landing' | 'reactor-nuclear' | 'medicina-nuclear' | 'curso';
type ReactorScreen = 'hub' | 'module';

const REACTOR_SUBMODULES: Array<{
  id: ReactorTab;
  title: string;
  subtitle: string;
  desc: string;
  code: string;
  color: string;
  icon: React.ComponentType<{ size?: number; style?: React.CSSProperties }>;
}> = [
  {
    id: 'monte-carlo',
    title: 'Monte Carlo',
    subtitle: 'Criticalidad neutronica',
    desc: 'Simulacion estocastica de fision, evolucion de k y estudios de muestreo.',
    code: 'SUB-01',
    color: '#a2ff40',
    icon: Activity,
  },
  {
    id: 'dispersion',
    title: 'Dispersion Elastica',
    subtitle: 'Cinematica en LAB/CM',
    desc: 'Relacion entre angulo y energia para diferentes numeros de masa objetivo.',
    code: 'SUB-02',
    color: '#22d3ee',
    icon: FlaskConical,
  },
  {
    id: 'reactor',
    title: 'Reactor Simulacion',
    subtitle: 'Ciclo energetico',
    desc: 'Visualizacion del comportamiento de reactor con variables operativas clave.',
    code: 'SUB-03',
    color: '#fbbf24',
    icon: Zap,
  },
  {
    id: 'decaimiento',
    title: 'Decaimiento',
    subtitle: 'Cadenas radiactivas',
    desc: 'Analisis de inventario, actividad y diagrama de desintegracion por isotopo.',
    code: 'SUB-04',
    color: '#fb7185',
    icon: Radio,
  },
  {
    id: 'simulacion-fision',
    title: 'Simulacion de Fision',
    subtitle: 'Visualizacion interactiva',
    desc: 'Escena de fision en tiempo real integrada desde la simulacion de Django.',
    code: 'SUB-05',
    color: '#f97316',
    icon: Box,
  },
];

function App() {
  const [view, setView] = useState<MainView>('landing');
  const [tab, setTab] = useState<ReactorTab>('monte-carlo');
  const [reactorScreen, setReactorScreen] = useState<ReactorScreen>('hub');

  const enterMainModule = (target: string) => {
    if (target === 'reactor-nuclear') {
      setView('reactor-nuclear');
      setReactorScreen('hub');
      return;
    }
    if (target === 'medicina-nuclear') {
      setView('medicina-nuclear');
      return;
    }
    if (target === 'curso') {
      setView('curso');
      return;
    }

    if (target === 'monte-carlo' || target === 'dispersion' || target === 'reactor' || target === 'decaimiento' || target === 'simulacion-fision') {
      setTab(target as ReactorTab);
      setView('reactor-nuclear');
      setReactorScreen('module');
    }
  };

  const goHome = () => setView('landing');

  if (view === 'landing') {
    return (
      <div className="relative min-h-screen bg-navy-deep">
        <div className="pointer-events-none fixed inset-0 circuit-grid opacity-40" />
        <div className="pointer-events-none fixed inset-0 scanline opacity-30" />
        <div className="relative z-10">
          <LandingPage onEnter={enterMainModule} />
        </div>
      </div>
    );
  }

  if (view === 'reactor-nuclear') {
    return (
      <div className="relative min-h-screen bg-navy-deep">
        <div className="pointer-events-none fixed inset-0 circuit-grid opacity-30" />
        <div className="pointer-events-none fixed inset-0 scanline opacity-20" />

        <div className="relative z-10">
          {reactorScreen === 'hub' ? (
            <header className="sticky top-0 z-50 border-b border-navy-border bg-navy-deep/90 backdrop-blur-lg">
              <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3">
                <div>
                  <span className="hud-label">MODULO PRINCIPAL</span>
                  <h1 className="mt-1 font-display text-xl font-bold text-white sm:text-2xl">Reactor Nuclear</h1>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <button onClick={() => setView('medicina-nuclear')} className="btn-ghost">MEDICINA NUCLEAR</button>
                  <button onClick={() => setView('curso')} className="btn-ghost">CURSO</button>
                  <button onClick={goHome} className="btn-primary">INICIO</button>
                </div>
              </div>
            </header>
          ) : (
            <Header
              activeTab={tab}
              onTabChange={(t) => {
                setTab(t as ReactorTab);
                setReactorScreen('module');
              }}
              onHome={goHome}
            />
          )}

          <main className="mx-auto max-w-7xl px-4 py-6">
            {reactorScreen === 'hub' ? (
              <div className="space-y-6 animate-fade-up">
                <div>
                  <span className="hud-label">SELECCIONA UN SUBMODULO</span>
                  <h2 className="mt-2 font-display text-3xl font-bold text-white">Submodulos de Reactor Nuclear</h2>
                </div>

                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
                  {REACTOR_SUBMODULES.map((mod, i) => {
                    const Icon = mod.icon;
                    return (
                      <button
                        key={mod.id}
                        onClick={() => {
                          setTab(mod.id);
                          setReactorScreen('module');
                        }}
                        className="module-card group text-left"
                        style={{ animationDelay: `${i * 0.08}s` }}
                      >
                        <div className="mb-4 flex items-center justify-between">
                          <span className="font-mono-tech text-[10px] text-[#7a9ab0]">{mod.code}</span>
                          <span
                            className="flex h-9 w-9 items-center justify-center border transition-all group-hover:scale-110"
                            style={{ borderColor: `${mod.color}40`, backgroundColor: `${mod.color}10` }}
                          >
                            <Icon size={16} style={{ color: mod.color }} />
                          </span>
                        </div>

                        <h3 className="font-display text-lg font-bold text-white transition-colors group-hover:text-reactor">
                          {mod.title}
                        </h3>
                        <p className="mt-0.5 font-mono-tech text-[10px] uppercase tracking-wider" style={{ color: mod.color }}>
                          {mod.subtitle}
                        </p>
                        <p className="mt-3 font-body text-sm leading-relaxed text-[#7a9ab0]">{mod.desc}</p>

                        <div className="mt-4 flex items-center gap-1 font-mono-tech text-[10px] uppercase tracking-widest text-[#7a9ab0] transition-colors group-hover:text-reactor">
                          ABRIR SUBMODULO
                          <ChevronRight size={12} className="transition-transform group-hover:translate-x-1" />
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex justify-end">
                  <button className="btn-ghost" onClick={() => setReactorScreen('hub')}>
                    VER SUBMODULOS
                  </button>
                </div>

                {tab === 'monte-carlo' && <MonteCarloSection />}
                {tab === 'dispersion' && <ElasticScatteringSection />}
                {tab === 'reactor' && <ReactorSection />}
                {tab === 'decaimiento' && <DecaySection />}
                {tab === 'simulacion-fision' && <Simulation3DSection />}
              </div>
            )}
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

  return (
    <div className="relative min-h-screen bg-navy-deep">
      <div className="pointer-events-none fixed inset-0 circuit-grid opacity-30" />
      <div className="pointer-events-none fixed inset-0 scanline opacity-20" />

      <div className="relative z-10">
        <header className="sticky top-0 z-50 border-b border-navy-border bg-navy-deep/90 backdrop-blur-lg">
          <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3">
            <div>
              <span className="hud-label">MODULOS PRINCIPALES</span>
              <h1 className="mt-1 font-display text-xl font-bold text-white sm:text-2xl">
                {view === 'medicina-nuclear' ? 'Medicina Nuclear' : 'Curso'}
              </h1>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <button onClick={() => setView('reactor-nuclear')} className="btn-ghost">REACTOR NUCLEAR</button>
              <button onClick={() => setView('medicina-nuclear')} className="btn-ghost">MEDICINA NUCLEAR</button>
              <button onClick={() => setView('curso')} className="btn-ghost">CURSO</button>
              <button onClick={goHome} className="btn-primary">INICIO</button>
            </div>
          </div>
        </header>

        <main className="mx-auto max-w-7xl px-4 py-6">
          {view === 'medicina-nuclear' ? (
            <div className="space-y-4 animate-fade-up">
              <Panel title="Medicina Nuclear" badge="MAIN" accent="critical">
                <p className="text-sm text-[#c8e8f0]">
                  Este modulo principal queda listo para integrar dosimetrias, radiofarmacos, imagen SPECT/PET y planificacion clinica.
                </p>
              </Panel>
              <Panel title="Proximamente" badge="ROADMAP" accent="cyan">
                <ul className="space-y-1 text-sm text-[#7a9ab0]">
                  <li>- Cinética de radiofármacos y vida media efectiva</li>
                  <li>- Curvas de actividad-tiempo por órgano</li>
                  <li>- Comparador de isótopos médicos (Tc-99m, I-131, F-18)</li>
                </ul>
              </Panel>
            </div>
          ) : (
            <div className="space-y-4 animate-fade-up">
              <Panel title="Curso" badge="MAIN" accent="amber">
                <p className="text-sm text-[#c8e8f0]">
                  Espacio para contenido guiado por unidades, prácticas de laboratorio y evaluaciones con seguimiento de progreso.
                </p>
              </Panel>
              <Panel title="Estructura sugerida" badge="SYLLABUS" accent="reactor">
                <ul className="space-y-1 text-sm text-[#7a9ab0]">
                  <li>- Unidad 1: Fundamentos de interacción radiación-materia</li>
                  <li>- Unidad 2: Transporte y moderación de neutrones</li>
                  <li>- Unidad 3: Decaimiento radiactivo y cadenas</li>
                </ul>
              </Panel>
            </div>
          )}
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
