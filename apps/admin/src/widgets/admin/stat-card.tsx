import type { ReactNode } from 'react';

interface StatCardProps {
  label: string;
  value: ReactNode;
  hint?: string;
}

export function StatCard({ label, value, hint }: StatCardProps) {
  return (
    <div className="stat-card-nude p-5 transition hover:shadow-[var(--shadow-hover)]">
      <p className="text-xs font-medium text-muted">{label}</p>
      <p className="mt-2 text-2xl font-bold text-stone-900">{value}</p>
      {hint ? <p className="mt-1 text-xs text-muted">{hint}</p> : null}
    </div>
  );
}
