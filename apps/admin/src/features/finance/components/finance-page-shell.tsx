'use client';

import type { ReactNode } from 'react';
import { notFound } from 'next/navigation';
import { ADMIN_ROUTE_BY_ID } from '@/shared/config/admin-routes';
import { RoutePermissionGuard } from '@/features/auth/components/route-permission-guard';
import { PageHeader } from '@/widgets/admin/page-header';

const DESCRIPTIONS: Record<string, string> = {
  'finance.wallets': 'موجودی ریالی و طلای کاربران بر اساس دفتر کل دوطرفه.',
  'finance.transactions': 'تراکنش‌های کیف پول و سفارش‌های معاملات طلا.',
  'finance.ledger': 'سطرهای دفتر کل (بدهکار/بستانکار) با پیوند به تراکنش.',
  'finance.accounting': 'تراز آزمایشی و مانده حساب‌ها به تفکیک نوع.',
  'finance.reports': 'گزارش مالی پلتفرم، موجودی سیستم و حجم معاملات.',
};

interface FinancePageShellProps {
  routeId: string;
  children: ReactNode;
  actions?: ReactNode;
}

export function FinancePageShell({ routeId, children, actions }: FinancePageShellProps) {
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
