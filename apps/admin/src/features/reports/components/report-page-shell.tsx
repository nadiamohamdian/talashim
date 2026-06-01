'use client';

import type { ReactNode } from 'react';
import { notFound } from 'next/navigation';
import { ADMIN_ROUTE_BY_ID } from '@/shared/config/admin-routes';
import { RoutePermissionGuard } from '@/features/auth/components/route-permission-guard';
import { PageHeader } from '@/widgets/admin/page-header';

const DESCRIPTIONS: Record<string, string> = {
  'reports.sales': 'تحلیل سفارش‌ها و درآمد فروشگاه در بازه زمانی.',
  'reports.inventory': 'موجودی انبار کالای فروشگاه — جدا از موجودی طلای معاملاتی.',
  'reports.users': 'رشد کاربران، نقش‌ها و وضعیت احراز هویت.',
  'reports.trading': 'تحلیل خرید/فروش طلای آب‌شده (جدا از سفارش فروشگاه).',
  'reports.financial': 'تراکنش‌های کیف پول و دفتر کل.',
};

interface ReportPageShellProps {
  routeId: string;
  children: ReactNode;
  actions?: ReactNode;
}

export function ReportPageShell({ routeId, children, actions }: ReportPageShellProps) {
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
