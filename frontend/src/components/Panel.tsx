import { type ReactNode } from 'react';

interface PanelProps {
  title?: string;
  badge?: string;
  children: ReactNode;
  className?: string;
  accent?: 'cyan' | 'reactor' | 'amber' | 'critical';
}

const accentMap = {
  cyan: 'text-cyan',
  reactor: 'text-reactor',
  amber: 'text-amber',
  critical: 'text-critical',
};

export default function Panel({
  title,
  badge,
  children,
  className = '',
  accent = 'cyan',
}: PanelProps) {
  return (
    <section className={`panel ${className}`}>
      {(title || badge) && (
        <header className="flex items-center justify-between border-b border-navy-border px-4 py-2.5">
          {title && (
            <h3 className={`font-display text-xs font-bold uppercase tracking-widest ${accentMap[accent]}`}>
              {title}
            </h3>
          )}
          {badge && <span className="hud-label">{badge}</span>}
        </header>
      )}
      <div className="p-4">{children}</div>
    </section>
  );
}
