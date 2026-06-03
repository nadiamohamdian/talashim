'use client';

import type { ReactNode } from 'react';
import { notFound } from 'next/navigation';
import { ADMIN_ROUTE_BY_ID } from '@/shared/config/admin-routes';
import { RoutePermissionGuard } from '@/features/auth/components/route-permission-guard';
import { PageHeader } from '@/widgets/admin/page-header';

const DESCRIPTIONS: Record<string, string> = {
  'trading.buy': 'سفارش‌های خرید طلای آب‌شده ثبت‌شده در پلتفرم.',
  'trading.sell': 'سفارش‌های فروش طلای آب‌شده ثبت‌شده در پلتفرم.',
  'trading.history': 'تاریخچه کامل معاملات با فیلتر وضعیت و بازه زمانی.',
  'trading.settlement': 'صف تسویه دستی سفارش‌های معلق و ناموفق.',
  'trading.reports': 'تحلیل حجم معاملات، کارمزد و روند روزانه.',
};

interface TradingPageShellProps {
  routeId: string;
  children: ReactNode;
  actions?: ReactNode;
}

export function TradingPageShell({ routeId, children, actions }: TradingPageShellProps) {
  const route = ADMIN_ROUTE_BY_ID[routeId];
  if (!route) {
    notFound();
  }

  return (
    <RoutePermissionGuard permission={route.permission}>
      <div className="space-y-6">
        <PageHeader
          title={route.label}
          description={DESCRIPTIONS[routeId]}
          availability={route.availability}
          actions={actions}
        />
        {children}
      </div>
    </RoutePermissionGuard>
  );
}
