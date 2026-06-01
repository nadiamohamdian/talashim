'use client';

import type { ReactNode } from 'react';
import { notFound } from 'next/navigation';
import { ADMIN_ROUTE_BY_ID } from '@/shared/config/admin-routes';
import { RoutePermissionGuard } from '@/features/auth/components/route-permission-guard';
import { PageHeader } from '@/widgets/admin/page-header';

const DESCRIPTIONS: Record<string, string> = {
  'orders.list': 'سفارش‌های فروشگاه — وضعیت پرداخت و اقلام.',
  'orders.detail': 'جزئیات سفارش، پرداخت‌ها و تغییر وضعیت.',
};

interface CommercePageShellProps {
  routeId: string;
  children: ReactNode;
  actions?: ReactNode;
}

export function CommercePageShell({ routeId, children, actions }: CommercePageShellProps) {
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
