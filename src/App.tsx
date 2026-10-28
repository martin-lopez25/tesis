import { useState } from 'react';
import { Capacitor } from '@capacitor/core';
import {
  Activity,
  FlaskConical,
  Radio,
  Zap,
  ChevronRight,
  Box,
  BookOpen,
  RefreshCw,
  Home,
  Layers
} from 'lucide-react';
import Header from './components/Header';
import LandingPage from './components/LandingPage';
import MonteCarloSection from './sections/MonteCarloSection';
import ElasticScatteringSection from './sections/ElasticScatteringSection';
import ReactorSection from './sections/ReactorSection';
import DecaySection from './sections/DecaySection';
import Simulation3DSection from './sections/Simulation3DSection';
import MedicalPhysicsCourse, { MEDICAL_PHYSICS_MODULES, type MedicalCourseModuleId } from './sections/MedicalPhysicsCourseDetailed';
import Panel from './components/Panel';
import StatCard from './components/StatCard';
import NumberInput from './components/NumberInput';
import AtomLogo from './components/AtomLogo';

type ReactorTab = 'monte-carlo' | 'dispersion' | 'reactor' | 'decaimiento' | 'simulacion-fision';
type MedicalTab = MedicalCourseModuleId | 'clinical';
type MainView = 'landing' | 'modulos' | 'reactor-nuclear' | 'medicina-nuclear' | 'curso';
type ReactorScreen = 'hub' | 'module';

const MAIN_MODULES: Array<{
  id: MainView;
  title: string;
  subtitle: string;
  desc: string;
  code: string;
  color: string;
  icon: React.ComponentType<{ size?: number; style?: React.CSSProperties }>;
}> = [
  {
    id: 'reactor-nuclear',
    title: 'Reactor Nuclear & Cinemática',
    subtitle: 'Módulo Técnico Principal',
    desc: 'Simulación Monte Carlo de criticalidad, dispersión neutrónica elástica, ciclo de potencia térmica y reacción en cadena 3D.',
    code: 'MOD-01',
    color: '#1976D2',
    icon: Zap,
  },
  {
    id: 'medicina-nuclear',
    title: 'Medicina Nuclear & Radiofarmacia',
    subtitle: 'Dosimetría & Cinética Clínica',
    desc: 'Cálculo de vida media efectiva in vivo, biodistribución, actividad remanente en MBq/mCi y catálogo para SPECT/PET.',
    code: 'MOD-02',
    color: '#123B5D',
    icon: FlaskConical,
  },
  {
    id: 'curso',
    title: 'Curso de Física Nuclear & Tesis',
    subtitle: 'Ruta Formativa Universitaria',
    desc: '4 unidades académicas estructuradas, fundamentos teóricos de la tesis y autoevaluación interactiva con puntaje.',
    code: 'MOD-03',
    color: '#D97706',
    icon: Box,
  },
];

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
    title: 'Monte Carlo de Fisión',
    subtitle: 'Criticalidad Neutrónica',
    desc: 'Muestreo estocástico de poblaciones, factor k_eff y espectro de fisión de Watt.',
    code: 'SUB-01',
    color: '#1976D2',
    icon: Activity,
  },
  {
    id: 'dispersion',
    title: 'Dispersión Elástica',
    subtitle: 'Cinemática LAB/CM',
    desc: 'Parámetro alfa, transferencia energética y sección eficaz resonante.',
    code: 'SUB-02',
    color: '#123B5D',
    icon: FlaskConical,
  },
  {
    id: 'reactor',
    title: 'Simulador de Reactor',
    subtitle: 'Ciclo Termohidráulico',
    desc: 'Barras de control, flujo de refrigerante, presión de vapor y potencia eléctrica.',
    code: 'SUB-03',
    color: '#D97706',
    icon: Zap,
  },
  {
    id: 'decaimiento',
    title: 'Decaimiento & Bateman',
    subtitle: 'Cadenas Radiactivas',
    desc: 'Inventario de radioisótopos, resolución diferencial analítica y exportación de diagramas.',
    code: 'SUB-04',
    color: '#E11D48',
    icon: Radio,
  },
  {
    id: 'simulacion-fision',
    title: 'Fisión Nuclear 3D WebGL',
    subtitle: 'Cámara Neutrónica Inmersiva',
    desc: 'Escena 3D con 150 núcleos de Uranio-235, orbitales y reacción en cadena animada.',
    code: 'SUB-05',
    color: '#10B981',
    icon: Box,
  },
];

const MEDICAL_ISOTOPES = [
  { name: 'Tc-99m (Tecnecio-99m)', tPhysHours: 6.01, mode: 'γ (140 keV)', clinical: 'Centellografía ósea, cardíaca y tiroidea (SPECT)', defaultTBio: 24 },
  { name: 'F-18 (Flúor-18)', tPhysHours: 1.83, mode: 'β+ (511 keV aniquilación)', clinical: 'PET/CT oncológico con [18F]FDG (metabolismo glucídico)', defaultTBio: 6 },
  { name: 'I-131 (Yodo-131)', tPhysHours: 192.6, mode: 'β- / γ', clinical: 'Terapia de hipertiroidismo y carcinoma diferenciado de tiroides', defaultTBio: 168 },
  { name: 'Lu-177 (Lutecio-177)', tPhysHours: 159.6, mode: 'β- / γ', clinical: 'Terapia con péptidos radiomarcados (PRRT) y tumores neuroendocrinos', defaultTBio: 96 },
  { name: 'Ga-68 (Galio-68)', tPhysHours: 1.13, mode: 'β+', clinical: 'PET para receptores de somatostatina (DOTATOC) y PSMA', defaultTBio: 4 },
  { name: 'Sm-153 (Samario-153)', tPhysHours: 46.3, mode: 'β- / γ', clinical: 'Paliación de metástasis óseas dolorosas', defaultTBio: 72 },
];

const COURSE_UNITS = [
  {
    id: 1,
    title: 'Unidad 1: Interacción de la Radiación con la Materia',
    badge: 'FUNDAMENTOS',
    color: '#1976D2',
    summary: 'Mecanismos de interacción de radiaciones ionizantes corpusculares (alfa, beta, neutrones) y electromagnéticas (fotones gamma y X).',
    topics: [
      'Secciones eficaces macroscópicas y microscópicas (1 barn = 10⁻²⁴ cm²).',
      'Atenuación gamma: efecto fotoeléctrico, dispersión Compton y producción de pares.',
      'Ley exponencial de haz colimado: I(x) = I₀ · exp(-μ · x).',
      'Poder de frenado de partículas pesadas cargadas y pico de Bragg.',
    ],
  },
  {
    id: 2,
    title: 'Unidad 2: Moderación y Transporte de Neutrones',
    badge: 'CINEMÁTICA',
    color: '#123B5D',
    summary: 'Cinemática de choques elásticos neutrón-núcleo en los sistemas de referencia del Laboratorio (LAB) y Centro de Masas (CM).',
    topics: [
      'Parámetro de pérdida máxima de energía: α = ((A - 1) / (A + 1))².',
      'Letargia neutrónica u = ln(E₀ / E) y decremento logarítmico medio de energía ξ.',
      'Eficacia moderadora: Hidrógeno (A=1, α=0), Deuterio (A=2) y Grafito/Carbono (A=12).',
      'Espectro de fisión de Watt y termalización de neutrones rápidos (2 MeV a 0.025 eV).',
    ],
  },
  {
    id: 3,
    title: 'Unidad 3: Criticalidad y Dinámica del Reactor',
    badge: 'REACTOR',
    color: '#D97706',
    summary: 'Balance neutrónico, factor de multiplicación efectivo y control operacional en centrales nucleares.',
    topics: [
      'Factor de multiplicación efectivo k_eff = tasa de producción / (absorción + fugas).',
      'Regímenes: Subcrítico (k < 1), Crítico estacionario (k = 1) y Supercrítico (k > 1).',
      'Papel de los neutrones retardados (fracción β) en el control seguro y estabilidad.',
      'Envenenamiento transitorio por productos de fisión: Xenón-135 y Samario-149.',
    ],
  },
  {
    id: 4,
    title: 'Unidad 4: Leyes de Desintegración y Ecuaciones de Bateman',
    badge: 'RADIACTIVIDAD',
    color: '#E11D48',
    summary: 'Cinética de desintegración nuclear monoespecífica y en cadenas sucesivas de filiación radiactiva.',
    topics: [
      'Ley diferencial dN/dt = -λ · N y período de semidesintegración T½ = ln(2) / λ.',
      'Resolución de cadenas en cascada N₁ -> N₂ -> N₃ mediante ecuaciones de Bateman.',
      'Equilibrio secular (T₁ >> T₂) vs Equilibrio transitorio (T₁ > T₂).',
      'El generador de Mo-99 / Tc-99m como caso paradigmático en medicina nuclear.',
    ],
  },
];

const QUIZ_QUESTIONS = [
  {
    question: '¿Qué valor del factor de multiplicación k_eff representa un reactor en estado crítico estacionario?',
    options: ['k_eff = 0.50', 'k_eff = 1.00', 'k_eff = 1.65', 'k_eff = 2.43'],
    correct: 1,
    explanation: 'Cuando k_eff = 1.00, la población neutrónica se mantiene constante generación tras generación, produciendo una potencia térmica estable.',
  },
  {
    question: 'En una dispersión elástica con un núcleo de Hidrógeno (A=1), ¿cuál es la energía remanente mínima teórica tras un choque frontal?',
    options: ['0% de la energía incidente (α = 0)', '50% de la energía incidente', '75% de la energía incidente', '100% (sin pérdida)'],
    correct: 0,
    explanation: 'Para A=1, el parámetro α = ((1-1)/(1+1))² = 0. Un neutrón puede transferir hasta el 100% de su energía en una sola colisión frontal.',
  },
  {
    question: 'En un generador de Mo-99 / Tc-99m, ¿qué tipo de equilibrio radiactivo se establece?',
    options: ['Equilibrio Secular', 'Equilibrio Transitorio', 'Equilibrio Infinito', 'No hay equilibrio'],
    correct: 1,
    explanation: 'Se establece un Equilibrio Transitorio porque la vida media del padre (Mo-99, 66 h) es mayor que la de la hija (Tc-99m, 6 h), pero comparable en escala de tiempo.',
  },
  {
    question: '¿Cuál es el valor medio aproximado de neutrones producidos por fisión térmica en U-235 (neutrones por fisión ν)?',
    options: ['1.00', '1.50', '2.43', '5.20'],
    correct: 2,
    explanation: 'La fisión inducida por neutrones térmicos en U-235 libera un promedio de ν ≈ 2.43 neutrones rápidos con energía media de ~2 MeV.',
  },
];

export default function App() {
  const [view, setView] = useState<MainView>('landing');
  const [tab, setTab] = useState<ReactorTab>('monte-carlo');
  const [medicalTab, setMedicalTab] = useState<MedicalTab>('module-1');
  const [reactorScreen, setReactorScreen] = useState<ReactorScreen>('hub');
  const isNativeApk = Capacitor.isNativePlatform();

  // Clinical dosimetry state
  const [selectedIsotopeIdx, setSelectedIsotopeIdx] = useState(0);
  const [initialActivityMBq, setInitialActivityMBq] = useState(370);
  const [biologicalHalfLifeHours, setBiologicalHalfLifeHours] = useState(24);
  const [elapsedHours, setElapsedHours] = useState(6);

  // Quiz state
  const [quizAnswers, setQuizAnswers] = useState<Record<number, number>>({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);

  const curIso = MEDICAL_ISOTOPES[selectedIsotopeIdx];
  const tPhys = curIso.tPhysHours;
  const tBio = biologicalHalfLifeHours > 0 ? biologicalHalfLifeHours : 24;
  const tEff = (tPhys * tBio) / (tPhys + tBio);
  const lambdaEff = Math.LN2 / tEff;
  const currentActivityMBq = initialActivityMBq * Math.exp(-lambdaEff * elapsedHours);
  const cumulativeFraction = 1 - Math.exp(-lambdaEff * elapsedHours);

  const enterMainModule = (target: string) => {
    if (target === 'modulos') {
      setView('modulos');
      return;
    }
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

    if (
      target === 'monte-carlo' ||
      target === 'dispersion' ||
      target === 'reactor' ||
      target === 'decaimiento' ||
      target === 'simulacion-fision'
    ) {
      setTab(target as ReactorTab);
      setView('reactor-nuclear');
      setReactorScreen('module');
    }
  };

  const goHome = () => setView('landing');

  const content = (
    <div className="relative min-h-screen bg-canvas text-graphite pb-16 sm:pb-6">
      {/* Top Academic Telemetry Banner */}
      <div className="border-b border-nuclear-dark bg-nuclear-deep text-white px-4 py-2 shadow-sm">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 text-xs font-mono-tech">
          <div className="flex items-center gap-3">
            <AtomLogo size={24} />
            <div className="flex items-center gap-2">
              <span className="font-display font-bold tracking-wider text-sm sm:text-base">
                NUCLEAR<span className="text-accent-yellow">LAB</span>
              </span>
              <span className="hidden sm:inline text-slate-300">|</span>
              <span className="hidden sm:inline text-slate-300 font-sans text-xs">
                Laboratorio Virtual de Física & Energía Nuclear
              </span>
            </div>
          </div>

        </div>
      </div>

      <div className="relative z-10">
        {view === 'landing' && <LandingPage onEnter={enterMainModule} isNativeApk={isNativeApk} />}

        {/* Modules Directory View */}
        {view === 'modulos' && (
          <div className="animate-fade-up">
            <header className="sticky top-0 z-30 border-b border-slate-border bg-white/95 backdrop-blur-md shadow-sm">
              <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3.5">
                <div>
                  <span className="hud-label block text-techno">SISTEMA CIENTÍFICO</span>
                  <h1 className="font-display text-xl font-bold text-nuclear-deep sm:text-2xl mt-0.5">
                    Módulos Principales del Laboratorio
                  </h1>
                </div>
                <button onClick={goHome} className="btn-ghost text-xs">
                  <Home size={14} />
                  <span>INICIO</span>
                </button>
              </div>
            </header>

            <main className="mx-auto max-w-7xl px-4 py-8">
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {MAIN_MODULES.map((mod, i) => {
                  const Icon = mod.icon;
                  return (
                    <button
                      key={mod.id}
                      onClick={() => enterMainModule(mod.id)}
                      className="module-card group text-left flex flex-col justify-between"
                      style={{ animationDelay: `${i * 0.08}s` }}
                    >
                      <div>
                        <div className="mb-4 flex items-center justify-between">
                          <span className="font-mono-tech text-xs font-bold text-techno bg-azure-light px-2.5 py-1 rounded">
                            {mod.code}
                          </span>
                          <span
                            className="flex h-10 w-10 items-center justify-center rounded-xl border transition-all group-hover:scale-105"
                            style={{ borderColor: `${mod.color}30`, backgroundColor: `${mod.color}10` }}
                          >
                            <Icon size={18} style={{ color: mod.color }} />
                          </span>
                        </div>
                        <h3 className="font-display text-lg font-bold text-nuclear-deep transition-colors group-hover:text-techno">
                          {mod.title}
                        </h3>
                        <p className="mt-1 font-mono-tech text-xs uppercase tracking-wider text-slate-secondary">
                          {mod.subtitle}
                        </p>
                        <p className="mt-3 font-body text-xs leading-relaxed text-slate-secondary">
                          {mod.desc}
                        </p>
                      </div>
                      <div className="mt-5 flex items-center gap-1.5 font-mono-tech text-xs font-bold text-techno transition-all group-hover:translate-x-1">
                        <span>ABRIR MÓDULO</span>
                        <ChevronRight size={14} />
                      </div>
                    </button>
                  );
                })}
              </div>
            </main>
          </div>
        )}

        {/* Reactor Nuclear Technical Module */}
        {view === 'reactor-nuclear' && (
          <div>
            {reactorScreen === 'hub' ? (
              <header className="sticky top-0 z-30 border-b border-slate-border bg-white/95 backdrop-blur-md shadow-sm">
                <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3.5">
                  <div>
                    <span className="hud-label block text-techno">MÓDULO TÉCNICO</span>
                    <h1 className="font-display text-xl font-bold text-nuclear-deep sm:text-2xl mt-0.5">
                      Reactor Nuclear & Cinemática
                    </h1>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <button onClick={() => setView('medicina-nuclear')} className="btn-ghost text-xs">
                      MEDICINA NUCLEAR
                    </button>
                    <button onClick={() => setView('curso')} className="btn-ghost text-xs">
                      CURSO & TESIS
                    </button>
                    <button onClick={goHome} className="btn-primary text-xs">
                      <Home size={13} />
                      <span>INICIO</span>
                    </button>
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
                onBackToHub={() => setReactorScreen('hub')}
              />
            )}

            <main className="mx-auto max-w-7xl px-4 py-6">
              {reactorScreen === 'hub' ? (
                <div className="space-y-6 animate-fade-up">
                  <div className="border-b border-slate-border pb-3">
                    <span className="hud-label block text-techno">EXPLORACIÓN DE SUBMÓDULOS</span>
                    <h2 className="font-display text-2xl font-bold text-nuclear-deep sm:text-3xl mt-0.5">
                      Submódulos de Simulación y Análisis
                    </h2>
                    <p className="font-body text-xs text-slate-secondary mt-1">
                      Selecciona un área para ejecutar cálculos estocásticos, gráficos interactivos o la escena 3D WebGL.
                    </p>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {REACTOR_SUBMODULES.map((mod, i) => {
                      const Icon = mod.icon;
                      return (
                        <button
                          key={mod.id}
                          onClick={() => {
                            setTab(mod.id);
                            setReactorScreen('module');
                          }}
                          className="module-card group text-left flex flex-col justify-between"
                          style={{ animationDelay: `${i * 0.06}s` }}
                        >
                          <div>
                            <div className="mb-3.5 flex items-center justify-between">
                              <span className="font-mono-tech text-xs font-bold text-techno bg-azure-light px-2.5 py-1 rounded">
                                {mod.code}
                              </span>
                              <span
                                className="flex h-9 w-9 items-center justify-center rounded-xl border transition-all group-hover:scale-105"
                                style={{ borderColor: `${mod.color}30`, backgroundColor: `${mod.color}10` }}
                              >
                                <Icon size={16} style={{ color: mod.color }} />
                              </span>
                            </div>

                            <h3 className="font-display text-lg font-bold text-nuclear-deep transition-colors group-hover:text-techno">
                              {mod.title}
                            </h3>
                            <p className="mt-0.5 font-mono-tech text-xs uppercase tracking-wider text-slate-secondary">
                              {mod.subtitle}
                            </p>
                            <p className="mt-2.5 font-body text-xs leading-relaxed text-slate-secondary">
                              {mod.desc}
                            </p>
                          </div>

                          <div className="mt-4 flex items-center gap-1.5 font-mono-tech text-xs font-bold text-techno transition-all group-hover:translate-x-1">
                            <span>EJECUTAR SUBMÓDULO</span>
                            <ChevronRight size={14} />
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex justify-between items-center bg-white p-3 rounded-xl border border-slate-border shadow-sm">
                    <span className="font-mono-tech text-xs text-slate-secondary">
                      Submódulo activo: <strong className="text-nuclear-deep uppercase">{tab.replace('-', ' ')}</strong>
                    </span>
                    <button className="btn-ghost text-xs py-1.5" onClick={() => setReactorScreen('hub')}>
                      VER TODOS LOS SUBMÓDULOS
                    </button>
                  </div>

                  {tab === 'monte-carlo' && <MonteCarloSection />}
                  {tab === 'dispersion' && <ElasticScatteringSection />}
                  {tab === 'reactor' && <ReactorSection isNativeApk={isNativeApk} />}
                  {tab === 'decaimiento' && <DecaySection />}
                  {tab === 'simulacion-fision' && <Simulation3DSection />}
                </div>
              )}
            </main>
          </div>
        )}

        {/* Medicina Nuclear Module */}
        {view === 'medicina-nuclear' && (
          <div className="animate-fade-up">
            <header className="sticky top-0 z-30 border-b border-slate-border bg-white/95 backdrop-blur-md shadow-sm">
              <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3.5">
                <div>
                  <span className="hud-label block text-techno">APLICACIÓN CLÍNICA</span>
                  <h1 className="font-display text-xl font-bold text-nuclear-deep sm:text-2xl mt-0.5">
                    Medicina Nuclear & Radiofarmacia
                  </h1>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <button onClick={() => setView('reactor-nuclear')} className="btn-ghost text-xs">
                    REACTOR NUCLEAR
                  </button>
                  <button onClick={() => setView('curso')} className="btn-ghost text-xs">
                    CURSO & TESIS
                  </button>
                  <button onClick={goHome} className="btn-primary text-xs">
                    <Home size={13} />
                    <span>INICIO</span>
                  </button>
                </div>
              </div>
            </header>

            <main className="mx-auto max-w-7xl px-4 py-6 space-y-6">
              <div role="tablist" aria-label="Módulos de Física Médica" className="flex gap-2 overflow-x-auto border-b border-slate-border pb-3">
                {MEDICAL_PHYSICS_MODULES.map((module) => (
                  <button
                    key={module.id}
                    id={`tab-${module.id}`}
                    type="button"
                    role="tab"
                    aria-selected={medicalTab === module.id}
                    aria-controls="medical-module-panel"
                    onClick={() => setMedicalTab(module.id)}
                    className={`tab-btn ${medicalTab === module.id ? 'tab-btn-active' : 'tab-btn-inactive'}`}
                  >
                    <span className="font-mono-tech text-[10px]">{module.roman}</span>
                    <span>{module.shortTitle}</span>
                  </button>
                ))}
                <button
                  id="tab-clinical"
                  type="button"
                  role="tab"
                  aria-selected={medicalTab === 'clinical'}
                  aria-controls="medical-module-panel"
                  onClick={() => setMedicalTab('clinical')}
                  className={`tab-btn ${medicalTab === 'clinical' ? 'tab-btn-active' : 'tab-btn-inactive'}`}
                >
                  <span className="font-mono-tech text-[10px]">07</span>
                  <span>Cinética clínica</span>
                </button>
              </div>

              {medicalTab !== 'clinical' ? (
                <div id="medical-module-panel" role="tabpanel" aria-labelledby={`tab-${medicalTab}`}>
                  <MedicalPhysicsCourse moduleId={medicalTab} />
                </div>
              ) : (
                <div id="medical-module-panel" role="tabpanel" aria-labelledby="tab-clinical" className="space-y-6">
              <Panel title="Dosimetría & Cinética de Radiofármacos" badge="CLÍNICA" accent="nuclear">
                <p className="text-sm leading-relaxed text-graphite">
                  En medicina nuclear in vivo, los radioisótopos no encapsulados son depurados simultáneamente por desintegración física nuclear (<strong className="text-nuclear-deep">T_físico</strong>) y excreción biológica fisiológica renal o hepática (<strong className="text-nuclear-deep">T_biológico</strong>). La combinación de ambos determina la vida media efectiva y la dosis absorbida en órganos diana.
                </p>
              </Panel>

              {/* Calculator and Results */}
              <div className="grid gap-6 lg:grid-cols-[360px_1fr]">
                <Panel title="Calculadora de Vida Media Efectiva" badge="INPUT" accent="cyan">
                  <div className="space-y-4">
                    <div>
                      <label className="font-mono-tech text-xs font-semibold text-nuclear-deep block mb-1.5">
                        Radioisótopo Clínico
                      </label>
                      <select
                        value={selectedIsotopeIdx}
                        onChange={(e) => {
                          const idx = Number(e.target.value);
                          setSelectedIsotopeIdx(idx);
                          setBiologicalHalfLifeHours(MEDICAL_ISOTOPES[idx].defaultTBio);
                        }}
                        className="input-tech"
                      >
                        {MEDICAL_ISOTOPES.map((iso, i) => (
                          <option key={iso.name} value={i}>
                            {iso.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="p-3 bg-slate-50 rounded-lg border border-slate-border font-mono-tech text-xs space-y-1">
                      <div className="flex justify-between">
                        <span className="text-slate-secondary">Tipo de Emisión:</span>
                        <strong className="text-amber-700">{curIso.mode}</strong>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-secondary">Vida Media Física:</span>
                        <strong className="text-nuclear-deep">{curIso.tPhysHours.toFixed(2)} horas</strong>
                      </div>
                      <div className="text-[11px] text-slate-secondary pt-1 border-t border-slate-border">
                        {curIso.clinical}
                      </div>
                    </div>

                    <NumberInput
                      label="Actividad Inicial Administrada (A₀)"
                      value={initialActivityMBq}
                      min={1}
                      max={10000}
                      step={10}
                      unit="MBq"
                      onChange={setInitialActivityMBq}
                    />

                    <NumberInput
                      label="Vida Media Biológica Estimada (T_bio)"
                      value={biologicalHalfLifeHours}
                      min={0.1}
                      max={1000}
                      step={0.5}
                      unit="horas"
                      onChange={setBiologicalHalfLifeHours}
                    />

                    <NumberInput
                      label="Tiempo Transcurrido (t)"
                      value={elapsedHours}
                      min={0}
                      max={720}
                      step={1}
                      unit="horas"
                      onChange={setElapsedHours}
                    />
                  </div>
                </Panel>

                <div className="space-y-6">
                  <Panel title="Valores Dosimétricos Calculados" badge="RESULTADOS" accent="amber">
                    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                      <StatCard
                        label="Vida Media Efectiva"
                        value={`${tEff.toFixed(2)} h`}
                        sublabel="1/Teff = 1/Tf + 1/Tb"
                        accent="nuclear"
                      />
                      <StatCard
                        label="Actividad Remanente"
                        value={`${currentActivityMBq.toFixed(1)} MBq`}
                        sublabel={`${((currentActivityMBq / initialActivityMBq) * 100).toFixed(1)}% de A₀`}
                        accent="cyan"
                      />
                      <StatCard
                        label="Actividad en mCi"
                        value={`${(currentActivityMBq / 37).toFixed(2)} mCi`}
                        sublabel="1 mCi = 37 MBq"
                        accent="amber"
                      />
                      <StatCard
                        label="Dosis Decaída"
                        value={`${(cumulativeFraction * 100).toFixed(1)}%`}
                        sublabel="Porción absorbida in vivo"
                        accent="reactor"
                      />
                    </div>

                    <div className="mt-4 p-3 bg-azure-light rounded-lg border border-techno/20 font-mono-tech text-xs text-nuclear-deep space-y-1">
                      <div className="font-bold text-techno">Ley de Decaimiento Efectivo:</div>
                      <div>1 / T_eff = 1 / T_físico + 1 / T_biológico</div>
                      <div>A(t) = A₀ · exp(-ln(2) · t / T_eff)</div>
                    </div>
                  </Panel>

                  {/* Catalog Cards */}
                  <Panel title="Radioisótopos Clínicos de Referencia" badge="CATÁLOGO" accent="nuclear">
                    <div className="grid gap-3 sm:grid-cols-2">
                      {MEDICAL_ISOTOPES.map((iso) => (
                        <div key={iso.name} className="p-3.5 bg-white rounded-xl border border-slate-border shadow-sm">
                          <div className="flex items-center justify-between">
                            <span className="font-display text-sm font-bold text-nuclear-deep">{iso.name.split(' ')[0]}</span>
                            <span className="font-mono-tech text-xs font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                              {iso.mode}
                            </span>
                          </div>
                          <p className="font-mono-tech text-xs text-techno mt-1">T½ física: {iso.tPhysHours} h</p>
                          <p className="font-body text-xs text-slate-secondary mt-1.5 leading-snug">{iso.clinical}</p>
                        </div>
                      ))}
                    </div>
                  </Panel>
                </div>
              </div>
                </div>
              )}
            </main>
          </div>
        )}

        {/* Academic Course & Self-Assessment Module */}
        {view === 'curso' && (
          <div className="animate-fade-up">
            <header className="sticky top-0 z-30 border-b border-slate-border bg-white/95 backdrop-blur-md shadow-sm">
              <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3.5">
                <div>
                  <span className="hud-label block text-techno">DOCENCIA UNIVERSITARIA</span>
                  <h1 className="font-display text-xl font-bold text-nuclear-deep sm:text-2xl mt-0.5">
                    Curso de Física Nuclear & Evaluación
                  </h1>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <button onClick={() => setView('reactor-nuclear')} className="btn-ghost text-xs">
                    REACTOR NUCLEAR
                  </button>
                  <button onClick={() => setView('medicina-nuclear')} className="btn-ghost text-xs">
                    MEDICINA NUCLEAR
                  </button>
                  <button onClick={goHome} className="btn-primary text-xs">
                    <Home size={13} />
                    <span>INICIO</span>
                  </button>
                </div>
              </div>
            </header>

            <main className="mx-auto max-w-7xl px-4 py-6 space-y-6">
              <Panel title="Ruta Curricular y Fundamentos de Tesis" badge="SYLLABUS" accent="nuclear">
                <p className="text-sm leading-relaxed text-graphite">
                  Compendio formativo de física nuclear dividido en 4 unidades temáticas. Cada módulo incluye los principios teóricos, formulaciones analíticas y modelos cinemáticos comprobados experimentalmente en este laboratorio.
                </p>
              </Panel>

              {/* 4 Academic Units */}
              <div className="grid gap-4 sm:grid-cols-2">
                {COURSE_UNITS.map((unit) => (
                  <div key={unit.id} className="module-card flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <span className="font-mono-tech text-[10px] font-bold uppercase px-2.5 py-1 rounded bg-azure-light text-techno border border-techno/20">
                          {unit.badge}
                        </span>
                        <BookOpen size={16} className="text-techno" />
                      </div>
                      <h3 className="font-display text-base font-bold text-nuclear-deep mb-2">
                        {unit.title}
                      </h3>
                      <p className="font-body text-xs text-slate-secondary mb-3 leading-relaxed">
                        {unit.summary}
                      </p>
                      <ul className="space-y-1.5 border-t border-slate-border pt-3">
                        {unit.topics.map((t, idx) => (
                          <li key={idx} className="flex items-start gap-2 font-mono-tech text-[11px] text-graphite">
                            <span className="text-techno font-bold">▸</span>
                            <span>{t}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ))}
              </div>

              {/* Self Assessment Quiz */}
              <Panel title="Autoevaluación Interactiva de Conocimientos" badge="EXAMEN" accent="amber">
                <div className="space-y-6">
                  <p className="text-xs text-slate-secondary">
                    Comprueba tu asimilación de los conceptos nucleares clave. Responde a cada pregunta y haz clic en evaluar para verificar tus aciertos y explicaciones.
                  </p>

                  <div className="space-y-4">
                    {QUIZ_QUESTIONS.map((q, qIdx) => {
                      const userChoice = quizAnswers[qIdx];
                      const isCorrect = userChoice === q.correct;
                      return (
                        <div key={qIdx} className="p-4 bg-white rounded-xl border border-slate-border shadow-sm space-y-3">
                          <h4 className="font-display text-sm font-semibold text-nuclear-deep">
                            {qIdx + 1}. {q.question}
                          </h4>
                          <div className="grid gap-2 sm:grid-cols-2">
                            {q.options.map((opt, optIdx) => {
                              const isSelected = userChoice === optIdx;
                              let btnStyle = 'border-slate-border bg-slate-50 text-graphite hover:border-techno/50 hover:bg-slate-100';
                              if (isSelected) {
                                btnStyle = 'border-techno bg-azure-light text-techno font-bold';
                              }
                              if (quizSubmitted) {
                                if (optIdx === q.correct) {
                                  btnStyle = 'border-emerald-500 bg-emerald-50 text-emerald-800 font-bold';
                                } else if (isSelected && !isCorrect) {
                                  btnStyle = 'border-rose-400 bg-rose-50 text-rose-700';
                                }
                              }

                              return (
                                <button
                                  key={optIdx}
                                  onClick={() => {
                                    if (!quizSubmitted) {
                                      setQuizAnswers({ ...quizAnswers, [qIdx]: optIdx });
                                    }
                                  }}
                                  className={`p-3 text-left border rounded-lg font-mono-tech text-xs transition-all ${btnStyle}`}
                                >
                                  {opt}
                                </button>
                              );
                            })}
                          </div>

                          {quizSubmitted && (
                            <div className={`p-3 font-mono-tech text-xs rounded-lg border ${isCorrect ? 'border-emerald-300 bg-emerald-50 text-emerald-800' : 'border-rose-300 bg-rose-50 text-rose-800'}`}>
                              <span className="font-bold">{isCorrect ? '✓ ¡Correcto! ' : '✗ Incorrecto. '}</span>
                              {q.explanation}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-border">
                    <button
                      onClick={() => setQuizSubmitted(true)}
                      className="btn-primary"
                      disabled={Object.keys(quizAnswers).length < QUIZ_QUESTIONS.length}
                    >
                      EVALUAR RESPUESTAS
                    </button>
                    {quizSubmitted && (
                      <div className="flex items-center gap-4">
                        <span className="font-mono-tech text-sm text-nuclear-deep font-bold">
                          Aciertos: {Object.entries(quizAnswers).filter(([idx, ans]) => ans === QUIZ_QUESTIONS[Number(idx)].correct).length} / {QUIZ_QUESTIONS.length}
                        </span>
                        <button
                          onClick={() => {
                            setQuizAnswers({});
                            setQuizSubmitted(false);
                          }}
                          className="btn-ghost text-xs"
                        >
                          <RefreshCw size={13} /> REINICIAR TEST
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </Panel>
            </main>
          </div>
        )}
      </div>

      {/* Mobile Bottom Navigation Bar (Optimized for Handheld Thumb Touch) */}
      {view !== 'landing' && (
      <nav className="fixed bottom-0 left-0 right-0 z-50 flex sm:hidden items-center justify-around border-t border-slate-border bg-white/95 py-2 px-1 backdrop-blur-md shadow-lg">
        <button
          onClick={goHome}
          className="flex flex-col items-center gap-0.5 px-3 py-1 text-[10px] font-mono-tech text-slate-secondary"
        >
          <Home size={18} />
          <span>Inicio</span>
        </button>
        <button
          onClick={() => enterMainModule('modulos')}
          className={`flex flex-col items-center gap-0.5 px-3 py-1 text-[10px] font-mono-tech ${
            view === 'modulos' ? 'text-techno font-bold' : 'text-slate-secondary'
          }`}
        >
          <Layers size={18} />
          <span>Módulos</span>
        </button>
        <button
          onClick={() => enterMainModule('reactor-nuclear')}
          className={`flex flex-col items-center gap-0.5 px-3 py-1 text-[10px] font-mono-tech ${
            view === 'reactor-nuclear' ? 'text-techno font-bold' : 'text-slate-secondary'
          }`}
        >
          <Zap size={18} />
          <span>Reactor</span>
        </button>
        <button
          onClick={() => enterMainModule('medicina-nuclear')}
          className={`flex flex-col items-center gap-0.5 px-3 py-1 text-[10px] font-mono-tech ${
            view === 'medicina-nuclear' ? 'text-techno font-bold' : 'text-slate-secondary'
          }`}
        >
          <FlaskConical size={18} />
          <span>Medicina</span>
        </button>
        <button
          onClick={() => enterMainModule('curso')}
          className={`flex flex-col items-center gap-0.5 px-3 py-1 text-[10px] font-mono-tech ${
            view === 'curso' ? 'text-techno font-bold' : 'text-slate-secondary'
          }`}
        >
          <BookOpen size={18} />
          <span>Curso</span>
        </button>
      </nav>
      )}

      {/* Institutional Academic Footer */}
      <footer className="mt-12 border-t border-slate-border bg-white">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 px-4 py-6 text-center sm:flex-row sm:text-left">
          <div>
            <span className="font-display text-xs font-bold uppercase tracking-wider text-nuclear-deep">
              NuclearLab · Laboratorio Virtual de Física & Tesis Universitaria
            </span>
            <p className="font-mono-tech text-[10px] text-slate-secondary mt-0.5">
              Simulación estocástica Monte Carlo, cinemática neutrónica y modelación termohidráulica.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="rounded border border-slate-border bg-slate-50 px-2.5 py-1 font-mono-tech text-[10px] font-semibold text-nuclear-deep">
              WEBGL 3D · PWA INSTALABLE · OFFLINE READY
            </span>
          </div>
        </div>
      </footer>
    </div>
  );

  return content;
}
