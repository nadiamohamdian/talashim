import type { ReactNode } from 'react';
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

const availabilityPipClass: Record<ApiAvailability, string> = {
  live: 'page-header-status-pip page-header-status-pip-live',
  partial: 'page-header-status-pip page-header-status-pip-partial',
  pending: 'page-header-status-pip page-header-status-pip-pending',
};

export function PageHeader({
  title,
  availability,
  actions,
  icon: Icon,
}: PageHeaderProps) {
  return (
    <header className="page-header flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
      <div className="flex min-w-0 items-start gap-3.5">
        {Icon ? (
          <span className="page-header-icon shrink-0">
            <Icon size={18} strokeWidth={1.75} aria-hidden />
          </span>
        ) : null}
        <div className="min-w-0">
          <h1 className="text-display inline-flex items-center gap-2">
            {title}
            {availability ? (
              <span
                className={availabilityPipClass[availability]}
                aria-label={availabilityLabel[availability]}
                title={availabilityLabel[availability]}
              />
            ) : null}
          </h1>
        </div>
      </div>
      {actions ? (
        <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div>
      ) : null}
    </header>
  );
}
