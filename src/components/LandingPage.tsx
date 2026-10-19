import {
  Zap,
  ShieldCheck,
  ChevronRight,
  FlaskConical,
  BookOpen,
  Layers,
  Download,
} from 'lucide-react';
import AtomLogo from './AtomLogo';

interface LandingPageProps {
  onEnter: (tab: string) => void;
}

export default function LandingPage({ onEnter }: LandingPageProps) {
  return (
    <div className="relative min-h-[calc(100vh-42px)] animate-fade-up">
      {/* Hero Section */}
      <section className="relative mx-auto max-w-7xl px-4 py-8 sm:py-12 lg:py-16">
        <div className="grid items-center gap-10 lg:grid-cols-[1.3fr_1fr]">
          {/* Left Column: Thesis Info & Navigation */}
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 rounded-full border border-techno/20 bg-azure-light px-3.5 py-1 text-xs font-semibold text-techno">
              <span className="flex h-2 w-2 rounded-full bg-techno animate-pulse" />
              <span>Proyecto de Tesis Universitaria · Física Nuclear</span>
            </div>

            <h1 className="font-display text-4xl font-extrabold tracking-tight text-nuclear-deep sm:text-5xl lg:text-6xl leading-[1.1]">
              Laboratorio Virtual de{' '}
              <span className="text-techno">Energía Nuclear</span> & Computación
            </h1>

            <p className="max-w-xl font-body text-base leading-relaxed text-slate-secondary sm:text-lg">
              Entorno científico interactivo para el estudio de la física de reactores, cinética neutrónica estocástica Monte Carlo, dispersión cinemática en sistemas LAB/CM y aplicaciones dosimétricas en medicina nuclear.
            </p>

            {/* Main Action CTAs */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                onClick={() => onEnter('modulos')}
                className="btn-primary flex items-center gap-2 text-sm px-6 py-3 shadow-md"
              >
                <Zap size={18} />
                <span>EXPLORAR MÓDULOS CIENTÍFICOS</span>
              </button>

              <button
                onClick={() => onEnter('simulacion-fision')}
                className="btn-ghost flex items-center gap-2 text-sm px-5 py-3"
              >
                <Layers size={17} className="text-techno" />
                <span>SIMULACIÓN 3D</span>
              </button>
            </div>

            {/* Quick Metrics Bar */}
            <div className="grid grid-cols-3 gap-3 pt-4 border-t border-slate-border">
              <div className="p-3 bg-white rounded-xl border border-slate-border shadow-sm">
                <span className="hud-label block text-[10px]">MÓDULOS</span>
                <span className="font-display text-2xl font-bold text-nuclear-deep">03</span>
                <span className="text-[11px] text-slate-secondary block">Campos temáticos</span>
              </div>
              <div className="p-3 bg-white rounded-xl border border-slate-border shadow-sm">
                <span className="hud-label block text-[10px]">SIMULACIONES</span>
                <span className="font-display text-2xl font-bold text-techno">100%</span>
                <span className="text-[11px] text-slate-secondary block">Física sin aproximación ficticia</span>
              </div>
              <div className="p-3 bg-white rounded-xl border border-slate-border shadow-sm">
                <span className="hud-label block text-[10px]">CÁLCULO</span>
                <span className="font-display text-2xl font-bold text-amber-600">NATIVO</span>
                <span className="text-[11px] text-slate-secondary block">Ecuaciones de Bateman</span>
              </div>
            </div>

            <a
              href="https://media.githubusercontent.com/media/martin-lopez25/tesis/main/NuclearLab.apk"
              download="NuclearLab.apk"
              className="group flex items-center justify-between gap-3 rounded-xl border border-slate-border bg-white p-3 shadow-sm transition hover:border-techno hover:shadow-md"
              aria-label="Obtener APK de NuclearLab para Android"
            >
              <span className="flex items-center gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-techno/20 bg-azure-light text-techno transition group-hover:bg-techno group-hover:text-white">
                  <Download size={18} />
                </span>
                <span>
                  <span className="hud-label block text-[10px]">VERSIÓN ANDROID</span>
                  <span className="font-display text-sm font-bold text-nuclear-deep">Obtener APK</span>
                  <span className="block text-[11px] text-slate-secondary">Reactor PWR con imágenes interactivas</span>
                </span>
              </span>
              <ChevronRight size={18} className="shrink-0 text-techno transition-transform group-hover:translate-x-1" />
            </a>
          </div>

          {/* Right Column: Visual Atom Presentation in Clean Scientific Viewport */}
          <div className="relative flex items-center justify-center">
            {/* Atom visual representation */}
            <div className="my-6 relative flex items-center justify-center">
              <div className="absolute inset-0 rounded-full bg-azure-light/50 blur-2xl -z-10" />
              <AtomLogo size={260} className="sm:hidden" />
              <AtomLogo size={320} className="hidden sm:flex lg:hidden" />
              <AtomLogo size={360} className="hidden lg:flex" />
            </div>
          </div>
        </div>
      </section>

      {/* Featured Thesis Modules Preview Cards */}
      <section className="mx-auto max-w-7xl px-4 py-8 border-t border-slate-border">
        <div className="mb-6">
          <span className="hud-label block text-techno">ESTRUCTURA DE INVESTIGACIÓN</span>
          <h2 className="font-display text-2xl font-bold text-nuclear-deep mt-1">
            Módulos del Laboratorio Nuclear
          </h2>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {/* Card 1: Reactor Nuclear */}
          <div
            onClick={() => onEnter('reactor-nuclear')}
            className="module-card group text-left flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="font-mono-tech text-[10px] font-bold text-techno bg-azure-light px-2 py-0.5 rounded">MOD-01</span>
                <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-azure-light text-techno border border-techno/20 group-hover:bg-techno group-hover:text-white transition-colors">
                  <Zap size={18} />
                </span>
              </div>
              <h3 className="font-display text-lg font-bold text-nuclear-deep group-hover:text-techno transition-colors">
                Reactor Nuclear & Simulación
              </h3>
              <p className="font-mono-tech text-xs text-techno mt-0.5 uppercase tracking-wider">
                Criticalidad, Cinemática & Fisión 3D
              </p>
              <p className="font-body text-xs text-slate-secondary mt-2.5 leading-relaxed">
                Simulación Monte Carlo de criticalidad neutrónica, dispersión elástica neutrón-núcleo, ciclo termohidráulico y visualización 3D WebGL con 150 núcleos de uranio.
              </p>
            </div>
            <div className="mt-4 flex items-center gap-1 font-mono-tech text-xs font-semibold text-techno group-hover:translate-x-1 transition-transform">
              <span>Acceder al Reactor</span>
              <ChevronRight size={14} />
            </div>
          </div>

          {/* Card 2: Medicina Nuclear */}
          <div
            onClick={() => onEnter('medicina-nuclear')}
            className="module-card group text-left flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="font-mono-tech text-[10px] font-bold text-techno bg-azure-light px-2 py-0.5 rounded">MOD-02</span>
                <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-azure-light text-techno border border-techno/20 group-hover:bg-techno group-hover:text-white transition-colors">
                  <FlaskConical size={18} />
                </span>
              </div>
              <h3 className="font-display text-lg font-bold text-nuclear-deep group-hover:text-techno transition-colors">
                Medicina Nuclear & Radiofarmacia
              </h3>
              <p className="font-mono-tech text-xs text-techno mt-0.5 uppercase tracking-wider">
                Dosimetría & Cinética Clínica
              </p>
              <p className="font-body text-xs text-slate-secondary mt-2.5 leading-relaxed">
                Cálculo de vida media efectiva in vivo (T_efectivo), curvas de actividad remanente en MBq y catálogo clínico de radiofármacos para SPECT, PET y terapia metabólica.
              </p>
            </div>
            <div className="mt-4 flex items-center gap-1 font-mono-tech text-xs font-semibold text-techno group-hover:translate-x-1 transition-transform">
              <span>Abrir Dosimetría</span>
              <ChevronRight size={14} />
            </div>
          </div>

          {/* Card 3: Curso & Tesis */}
          <div
            onClick={() => onEnter('curso')}
            className="module-card group text-left flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="font-mono-tech text-[10px] font-bold text-techno bg-azure-light px-2 py-0.5 rounded">MOD-03</span>
                <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-azure-light text-techno border border-techno/20 group-hover:bg-techno group-hover:text-white transition-colors">
                  <BookOpen size={18} />
                </span>
              </div>
              <h3 className="font-display text-lg font-bold text-nuclear-deep group-hover:text-techno transition-colors">
                Curso Académico & Evaluación
              </h3>
              <p className="font-mono-tech text-xs text-techno mt-0.5 uppercase tracking-wider">
                Fundamentos Teóricos de Tesis
              </p>
              <p className="font-body text-xs text-slate-secondary mt-2.5 leading-relaxed">
                Ruta estructurada en 4 unidades temáticas: interacción radiación-materia, transporte neutrónico, cinética de reactores y autoevaluación interactiva con puntaje.
              </p>
            </div>
            <div className="mt-4 flex items-center gap-1 font-mono-tech text-xs font-semibold text-techno group-hover:translate-x-1 transition-transform">
              <span>Iniciar Aprendizaje</span>
              <ChevronRight size={14} />
            </div>
          </div>
        </div>
      </section>

      {/* Safety & Academic Disclaimer Banner */}
      <section className="mx-auto max-w-7xl px-4 py-6">
        <div className="rounded-xl border border-slate-border bg-slate-50 p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <ShieldCheck size={20} className="text-techno shrink-0" />
            <div className="text-xs text-slate-secondary">
              <strong className="text-nuclear-deep">Simulación Académica Segura:</strong> Todos los modelos ejecutan cálculo numérico y leyes físicas sin emisión real de radiación ionizante. Desarrollado con fines de investigación científica y docencia universitaria.
            </div>
          </div>
          <div className="flex items-center gap-2 font-mono-tech text-[11px] text-slate-secondary shrink-0">
            <span>UNIVERIDAD · LICENCIATURA EN FÍSICA</span>
          </div>
        </div>
      </section>
    </div>
  );
}
