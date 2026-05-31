import type { ReactNode } from 'react';
import type { ApiAvailability } from '@/shared/config/admin-navigation';

interface PageHeaderProps {
  title: string;
  description?: string;
  availability?: ApiAvailability;
  actions?: ReactNode;
}

const availabilityLabel: Record<ApiAvailability, string> = {
  live: 'API فعال',
  partial: 'API جزئی',
  pending: 'در انتظار API',
};

const availabilityClass: Record<ApiAvailability, string> = {
  live: 'bg-emerald-50 text-emerald-800 border border-emerald-200',
  partial: 'badge-gold',
  pending: 'bg-stone-100 text-stone-600 border border-stone-200',
};

export function PageHeader({ title, description, availability, actions }: PageHeaderProps) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
      <div>
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="section-heading text-2xl font-bold tracking-tight text-stone-950">
            {title}
          </h1>
          {availability ? (
            <span
              className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${availabilityClass[availability]}`}
            >
              {availabilityLabel[availability]}
            </span>
          ) : null}
        </div>
        {description ? (
          <p className="mt-3 max-w-2xl text-sm leading-7 text-stone-600">{description}</p>
        ) : null}
      </div>
      {actions ? <div className="flex shrink-0 flex-wrap gap-2">{actions}</div> : null}
    </div>
  );
}
