import type { ReactNode } from 'react';
import { Badge } from '@sadafgold/ui';
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

const availabilityVariant: Record<ApiAvailability, 'success' | 'gold' | 'outline'> = {
  live: 'success',
  partial: 'gold',
  pending: 'outline',
};

export function PageHeader({ title, description, availability, actions }: PageHeaderProps) {
  return (
    <div className="flex flex-col gap-4 pb-2 sm:flex-row sm:items-start sm:justify-between">
      <div className="space-y-2">
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-h1">{title}</h1>
          {availability ? (
            <Badge variant={availabilityVariant[availability]}>{availabilityLabel[availability]}</Badge>
          ) : null}
        </div>
        {description ? (
          <p className="max-w-2xl text-body-lg text-muted leading-relaxed">{description}</p>
        ) : null}
      </div>
      {actions ? (
        <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div>
      ) : null}
    </div>
  );
}
