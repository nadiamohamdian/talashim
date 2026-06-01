'use client';

import type { ReactNode } from 'react';
import { notFound } from 'next/navigation';
import { ADMIN_ROUTE_BY_ID } from '@/shared/config/admin-routes';
import { RoutePermissionGuard } from '@/features/auth/components/route-permission-guard';
import { PageHeader } from '@/widgets/admin/page-header';

const DESCRIPTIONS: Record<string, string> = {
  'pricing.live': 'نمایش قیمت لحظه‌ای طلا با امکان بازخوانی از ارائه‌دهندگان.',
  'pricing.history': 'نمودار و جدول تاریخچه قیمت در بازه زمانی دلخواه.',
  'pricing.providers': 'وضعیت BrsApi، fallback و کش Redis بازار.',
  'pricing.margins': 'اسپرد خرید/فروش، کارمزد معاملات و اجرت پیش‌فرض.',
  'pricing.overrides': 'تعیین قیمت دستی موقت برای عیار و نماد مشخص.',
};

interface PricingPageShellProps {
  routeId: string;
  children: ReactNode;
  actions?: ReactNode;
}

export function PricingPageShell({ routeId, children, actions }: PricingPageShellProps) {
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
