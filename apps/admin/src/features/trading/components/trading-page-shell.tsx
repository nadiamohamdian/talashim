'use client';

import type { ReactNode } from 'react';
import { notFound } from 'next/navigation';
import { ADMIN_ROUTE_BY_ID } from '@/shared/config/admin-routes';
import { RoutePermissionGuard } from '@/features/auth/components/route-permission-guard';
import { PageHeader } from '@/widgets/admin/page-header';

const DESCRIPTIONS: Record<string, string> = {
  'trading.buy': 'فیلتر خرید — از منوی «معاملات» در دسترس است.',
  'trading.sell': 'فیلتر فروش — از منوی «معاملات» در دسترس است.',
  'trading.history': 'خرید و فروش طلای آب‌شده (عمده و خرد) — جدا از سفارش‌های فروشگاه جواهر.',
  'trading.settlement': 'صف تسویه دستی سفارش‌های معلق و ناموفق.',
  'trading.reports': 'گزارش تحلیلی در بخش گزارش‌ها → طلای آب‌شده.',
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
