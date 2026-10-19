import { type ReactNode } from 'react';

interface PanelProps {
  title?: string;
  badge?: string;
  children: ReactNode;
  className?: string;
  accent?: 'cyan' | 'reactor' | 'amber' | 'critical' | 'nuclear';
}

const accentBar = {
  cyan: 'border-l-4 border-l-techno',
  nuclear: 'border-l-4 border-l-nuclear-deep',
  reactor: 'border-l-4 border-l-emerald-500',
  amber: 'border-l-4 border-l-accent-yellow',
  critical: 'border-l-4 border-l-critical',
};

const badgeStyles = {
  cyan: 'bg-azure-light text-techno border border-techno/20',
  nuclear: 'bg-azure-light text-nuclear-deep border border-nuclear-deep/20',
  reactor: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
  amber: 'bg-amber-50 text-amber-800 border border-amber-200',
  critical: 'bg-rose-50 text-rose-700 border border-rose-200',
};

export default function Panel({
  title,
  badge,
  children,
  className = '',
  accent = 'cyan',
}: PanelProps) {
  const chosenAccent = accent === 'cyan' ? 'cyan' : accent;

  return (
    <section className={`panel ${accentBar[chosenAccent]} ${className}`}>
      {(title || badge) && (
        <header className="flex items-center justify-between border-b border-slate-border px-5 py-3.5 bg-slate-50/60 rounded-t-xl">
          {title && (
            <h3 className="font-display text-sm font-bold uppercase tracking-wider text-nuclear-deep">
              {title}
            </h3>
          )}
          {badge && (
            <span className={`font-mono-tech text-[10px] font-semibold px-2 py-0.5 rounded-full ${badgeStyles[chosenAccent]}`}>
              {badge}
            </span>
          )}
        </header>
      )}
      <div className="p-5">{children}</div>
    </section>
  );
}
