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
    <div className="stat-card-nude p-4 sm:p-5">
      <div className="flex items-start justify-between gap-3">
        <p className="text-overline text-[var(--muted-foreground)]">{label}</p>
        {Icon ? (
          <span className="flex size-7 shrink-0 items-center justify-center rounded-[var(--radius-md)] bg-[var(--surface)] text-[var(--primary)]">
            <Icon className="size-3.5" strokeWidth={1.75} aria-hidden />
          </span>
        ) : null}
      </div>
      <p className="mt-2.5 text-xl font-semibold tracking-tight text-foreground sm:text-2xl">
        {value}
      </p>
      {hint ? <p className="mt-1 text-caption">{hint}</p> : null}
    </div>
  );
}
