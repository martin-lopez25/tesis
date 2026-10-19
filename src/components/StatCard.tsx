import { type ReactNode } from 'react';

interface StatCardProps {
  label: string;
  value: string;
  sublabel?: string;
  accent?: 'cyan' | 'reactor' | 'amber' | 'critical' | 'nuclear';
  icon?: ReactNode;
}

const accentValueColor = {
  cyan: 'text-techno',
  nuclear: 'text-nuclear-deep',
  reactor: 'text-emerald-600',
  amber: 'text-amber-600',
  critical: 'text-critical',
};

const accentBg = {
  cyan: 'bg-azure-light/60 border-slate-border',
  nuclear: 'bg-slate-50 border-slate-border',
  reactor: 'bg-emerald-50/50 border-emerald-100',
  amber: 'bg-amber-50/50 border-amber-100',
  critical: 'bg-rose-50/50 border-rose-100',
};

export default function StatCard({ label, value, sublabel, accent = 'cyan', icon }: StatCardProps) {
  const chosenAccent = accent === 'cyan' ? 'cyan' : accent;

  return (
    <div className={`relative overflow-hidden rounded-xl border p-4 shadow-card ${accentBg[chosenAccent]}`}>
      <div className="flex items-start justify-between gap-2">
        <span className="font-mono-tech text-[11px] font-semibold uppercase tracking-wider text-slate-secondary">
          {label}
        </span>
        {icon && <span className={accentValueColor[chosenAccent]}>{icon}</span>}
      </div>
      <div className={`mt-1.5 font-mono-tech text-2xl font-bold tracking-tight ${accentValueColor[chosenAccent]}`}>
        {value}
      </div>
      {sublabel && (
        <div className="mt-1 font-body text-xs text-slate-secondary">
          {sublabel}
        </div>
      )}
    </div>
  );
}
