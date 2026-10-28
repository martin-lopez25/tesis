import {
  Zap,
  ShieldCheck,
  ChevronRight,
  Download,
} from 'lucide-react';
import AtomLogo from './AtomLogo';

interface LandingPageProps {
  onEnter: (tab: string) => void;
  isNativeApk: boolean;
}

export default function LandingPage({ onEnter, isNativeApk }: LandingPageProps) {
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

            </div>

            {!isNativeApk && (
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
            )}
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
