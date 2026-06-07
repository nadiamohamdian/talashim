import type { ReactNode } from 'react';
import { Badge } from '@sadafgold/ui';
import type { IconComponent } from '@/shared/ui/icons';
import type { ApiAvailability } from '@/shared/config/admin-navigation';
import type { SectionTheme } from '@/shared/lib/admin-section-theme';

interface PageHeaderProps {
  title: string;
  description?: string;
  availability?: ApiAvailability;
  actions?: ReactNode;
  icon?: IconComponent;
  iconTheme?: Pick<SectionTheme, 'iconBg' | 'iconColor' | 'accent'>;
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

export function PageHeader({
  title,
  description,
  availability,
  actions,
  icon: Icon,
  iconTheme,
}: PageHeaderProps) {
  return (
    <header className="page-header flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
      <div className="flex min-w-0 items-start gap-3.5">
        {Icon ? (
          <span className="page-header-icon shrink-0">
            <Icon size={18} strokeWidth={1.75} aria-hidden />
          </span>
        ) : null}
        <div className="min-w-0 space-y-1.5">
          <div className="flex flex-wrap items-center gap-2.5">
            <h1 className="text-display">{title}</h1>
            {availability ? (
              <Badge variant={availabilityVariant[availability]}>
                {availabilityLabel[availability]}
              </Badge>
            ) : null}
          </div>
          {description ? (
            <p className="page-header-desc max-w-3xl">{description}</p>
          ) : null}
        </div>
      </div>
      {actions ? (
        <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div>
      ) : null}
    </header>
  );
}
