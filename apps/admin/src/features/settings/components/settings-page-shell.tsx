'use client';

import type { ReactNode } from 'react';
import { notFound } from 'next/navigation';
import { ADMIN_ROUTE_BY_ID } from '@/shared/config/admin-routes';
import { RoutePermissionGuard } from '@/features/auth/components/route-permission-guard';
import { PageHeader } from '@/widgets/admin/page-header';

interface SettingsPageShellProps {
  routeId: string;
  children: ReactNode;
  actions?: ReactNode;
}

const ROUTE_DESCRIPTIONS: Record<string, string> = {
  'settings.home': 'مرکز مدیریت تنظیمات فروشگاه تک‌فروشنده تلاشیم.',
  'settings.general': 'اطلاعات برند، تماس و حالت تعمیرات فروشگاه.',
  'settings.commerce': 'قوانین سفارش، پرداخت و مالیات پیش‌فرض.',
  'settings.gold': 'قیمت‌گذاری طلا، اسپرد معاملات و نمایش بازار.',
  'settings.featureFlags': 'فعال‌سازی قابلیت‌های پلتفرم بدون استقرار مجدد.',
};

export function SettingsPageShell({ routeId, children, actions }: SettingsPageShellProps) {
  const route = ADMIN_ROUTE_BY_ID[routeId];
  if (!route) {
    notFound();
  }

  return (
    <RoutePermissionGuard permission={route.permission}>
      <div className="space-y-6">
        <PageHeader
          title={route.label}
          description={ROUTE_DESCRIPTIONS[routeId] ?? route.description}
          availability="partial"
          actions={actions}
        />
        <div className="min-w-0 space-y-6">{children}</div>
      </div>
    </RoutePermissionGuard>
  );
}
