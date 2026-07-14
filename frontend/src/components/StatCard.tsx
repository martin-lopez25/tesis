import { type ReactNode } from 'react';

interface StatCardProps {
  label: string;
  value: string;
  sublabel?: string;
  accent?: 'cyan' | 'reactor' | 'amber' | 'critical';
  icon?: ReactNode;
}

const accentText = {
  cyan: 'text-cyan',
  reactor: 'text-reactor',
  amber: 'text-amber',
  critical: 'text-critical',
};

const accentBorder = {
  cyan: 'border-cyan/30',
  reactor: 'border-reactor/30',
  amber: 'border-amber/30',
  critical: 'border-critical/30',
};

export default function StatCard({ label, value, sublabel, accent = 'cyan', icon }: StatCardProps) {
  return (
    <div className={`relative overflow-hidden border ${accentBorder[accent]} bg-navy-deep/60 p-3`}>
      <div className="flex items-start justify-between">
        <span className="hud-label">{label}</span>
        {icon && <span className={accentText[accent]}>{icon}</span>}
      </div>
      <div className={`mt-1 font-mono-tech text-xl font-bold ${accentText[accent]}`}>{value}</div>
      {sublabel && <div className="mt-0.5 font-mono-tech text-[10px] text-[#7a9ab0]">{sublabel}</div>}
    </div>
  );
}
