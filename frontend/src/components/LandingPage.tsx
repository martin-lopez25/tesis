import {
  ArrowRight,
  Zap,
  Atom,
  FlaskConical,
  Box,
  Activity,
  Radio,
  ShieldCheck,
  ChevronRight,
} from 'lucide-react';
import AtomLogo from './AtomLogo';

interface LandingPageProps {
  onEnter: (tab: string) => void;
}

const MODULES = [
  {
    id: 'monte-carlo',
    title: 'Monte Carlo',
    subtitle: 'Criticalidad neutronica',
    desc: 'Simulacion estocastica de una cadena de fision generacion por generacion.',
    icon: Activity,
    color: '#a2ff40',
    code: 'MOD-01',
  },
  {
    id: 'dispersion',
    title: 'Dispersion Elastico',
    subtitle: 'Cinematica de neutrones',
    desc: 'Analisis de colision neutron-nucleo con energia dispersada y seccion eficaz.',
    icon: FlaskConical,
    color: '#22d3ee',
    code: 'MOD-02',
  },
  {
    id: 'reactor',
    title: 'Reactor Nuclear',
    subtitle: 'Ciclo energetico completo',
    desc: 'Diagrama animado de reactor con barras de control y parametros en tiempo real.',
    icon: Zap,
    color: '#fbbf24',
    code: 'MOD-03',
  },
  {
    id: 'simulacion-3d',
    title: 'Simulacion 3D',
    subtitle: 'Visualizacion de reacciones',
    desc: 'Render tridimensional de fisiones y colisiones en perspectiva.',
    icon: Box,
    color: '#f97316',
    code: 'MOD-04',
  },
];

export default function LandingPage({ onEnter }: LandingPageProps) {
  return (
    <div className="relative min-h-screen animate-fade-up">
      <section className="relative mx-auto max-w-7xl px-4 pb-12 pt-16 lg:pt-24">
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
              <button onClick={() => onEnter('reactor')} className="btn-primary">
                <Zap size={18} /> INICIAR REACTOR
              </button>
              <button onClick={() => onEnter('monte-carlo')} className="btn-ghost">
                EXPLORAR MODULOS
                <ArrowRight size={16} />
              </button>
            </div>

            <div className="mt-10 grid grid-cols-3 gap-px bg-navy-border">
              {[
                { label: 'MODULOS', value: '04', accent: 'text-reactor' },
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

          <div className="relative hidden h-[420px] items-center justify-center lg:flex">
            <div className="absolute inset-0 dot-grid opacity-30" />
            <div className="relative">
              <AtomLogo size={360} />
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

      <section className="mx-auto max-w-7xl px-4 py-12">
        <div className="mb-6 flex items-end justify-between">
          <div>
            <span className="hud-label">SELECCIONA UN MODULO</span>
            <h2 className="mt-2 font-display text-3xl font-bold text-white">Modulos de simulacion</h2>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {MODULES.map((mod, i) => {
            const Icon = mod.icon;
            return (
              <button
                key={mod.id}
                onClick={() => onEnter(mod.id)}
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
                  ABRIR MODULO
                  <ChevronRight size={12} className="transition-transform group-hover:translate-x-1" />
                </div>
              </button>
            );
          })}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-12">
        <div className="grid gap-4 md:grid-cols-3">
          {[
            {
              title: 'Fisica real',
              desc: 'Modelos basados en cinematica neutronica y teoria de reactores.',
              icon: Atom,
              color: '#a2ff40',
            },
            {
              title: '100% interactivo',
              desc: 'Parametros ajustables con visualizacion inmediata.',
              icon: Activity,
              color: '#22d3ee',
            },
            {
              title: 'Uso academico',
              desc: 'Herramienta educativa abierta. Datos simulados.',
              icon: ShieldCheck,
              color: '#fbbf24',
            },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.title} className="relative border border-navy-border bg-navy-mid/50 p-5">
                <Icon size={20} style={{ color: item.color }} />
                <h4 className="mt-3 font-display text-sm font-bold uppercase tracking-wider text-white">{item.title}</h4>
                <p className="mt-1 font-body text-sm text-[#7a9ab0]">{item.desc}</p>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
