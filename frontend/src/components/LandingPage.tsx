import {
  Zap,
  Activity,
  Radio,
  ShieldCheck,
} from 'lucide-react';
import AtomLogo from './AtomLogo';

interface LandingPageProps {
  onEnter: (tab: string) => void;
}

export default function LandingPage({ onEnter }: LandingPageProps) {
  return (
    <div className="relative min-h-screen animate-fade-up">
      <section className="relative mx-auto flex min-h-[calc(100vh-64px)] max-w-7xl items-center px-4 pb-8 pt-14 sm:pb-10 sm:pt-16 lg:pb-12 lg:pt-20">
        <div className="grid items-center gap-8 lg:grid-cols-[1.4fr_1fr]">
          <div className="relative">
            <div className="mb-4 flex items-center gap-3">
              <span className="h-px w-10 bg-reactor" />
              <span className="hud-label">Sistema educativo interactivo · v2.4</span>
            </div>

            <h1 className="font-display text-5xl font-black leading-[0.95] tracking-tight text-white sm:text-6xl lg:text-7xl xl:text-8xl">
              <span className="glow-text-reactor text-reactor">NUCLEAR</span>
              <br />
              <span className="text-[#c8e8f0]">LAB</span>
              <span className="animate-blink text-reactor">_</span>
            </h1>

            <p className="mt-6 max-w-xl font-body text-lg leading-relaxed text-[#7a9ab0]">
              Laboratorio academico de fisica nuclear. Explora criticalidad, dispersion elastica,
              ciclo de reactor y visualizaciones 3D en el navegador.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-4">
              <button onClick={() => onEnter('modulos')} className="btn-primary">
                <Zap size={18} /> MODULOS PRINCIPALES
              </button>
            </div>

            <div className="mt-10 grid grid-cols-3 gap-px bg-navy-border">
              {[
                { label: 'MODULOS', value: '03', accent: 'text-reactor' },
                { label: 'SIMULACIONES', value: '12+', accent: 'text-[#22d3ee]' },
                { label: 'COMPUTO', value: 'REAL-TIME', accent: 'text-[#fbbf24]' },
              ].map((s) => (
                <div key={s.label} className="bg-navy-mid px-4 py-3">
                  <div className="hud-label">{s.label}</div>
                  <div className={`mt-1 font-display text-2xl font-bold ${s.accent}`}>{s.value}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="relative flex h-[250px] items-center justify-center sm:h-[320px] lg:h-[460px]">
            <div className="absolute inset-0 dot-grid opacity-30" />
            <div className="relative">
              <AtomLogo size={220} className="sm:hidden" />
              <AtomLogo size={290} className="hidden sm:flex lg:hidden" />
              <AtomLogo size={390} className="hidden lg:flex" />
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4">
        <div className="relative border-y border-navy-border bg-navy-mid/50">
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 px-4 py-2.5 font-mono-tech text-[10px] uppercase tracking-widest text-[#7a9ab0]">
            <span className="flex items-center gap-1.5 text-reactor">
              <span className="h-1.5 w-1.5 bg-reactor animate-pulse-reactor" /> SYS · ONLINE
            </span>
            <span className="flex items-center gap-1.5 text-[#fbbf24]">
              <Radio size={11} /> 0.18 uSv/h
            </span>
            <span className="flex items-center gap-1.5 text-[#22d3ee]">
              <Activity size={11} /> NEUTRON FLUX: NOMINAL
            </span>
            <span className="flex items-center gap-1.5">
              <ShieldCheck size={11} className="text-reactor" /> NO RADIATION · SIMULATED DATA
            </span>
          </div>
        </div>
      </section>
    </div>
  );
}
