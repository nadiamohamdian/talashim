import type { IconComponent } from '@/shared/ui/icons';
import type { ReactNode } from 'react';

interface StatCardProps {
  label: string;
  value: ReactNode;
  hint?: string;
  icon?: IconComponent;
  trend?: 'up' | 'down' | 'neutral';
}

export function StatCard({ label, value, hint, icon: Icon }: StatCardProps) {
  return (
    <div className="stat-card-nude p-5">
      <div className="flex items-start justify-between gap-3">
        <p className="text-caption font-medium uppercase tracking-wide">{label}</p>
        {Icon ? (
          <span className="flex size-8 items-center justify-center rounded-[var(--radius-md)] bg-[var(--surface)] text-[var(--primary)]">
            <Icon className="size-4" strokeWidth={1.75} aria-hidden />
          </span>
        ) : null}
      </div>
      <p className="mt-3 text-2xl font-bold tracking-tight text-foreground">{value}</p>
      {hint ? <p className="mt-1.5 text-caption">{hint}</p> : null}
    </div>
  );
}
