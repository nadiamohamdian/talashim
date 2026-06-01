'use client';

import type { ReactNode } from 'react';
import { notFound } from 'next/navigation';
import { ADMIN_ROUTE_BY_ID } from '@/shared/config/admin-routes';
import { RoutePermissionGuard } from '@/features/auth/components/route-permission-guard';
import { PageHeader } from '@/widgets/admin/page-header';

const DESCRIPTIONS: Record<string, string> = {
  'notifications.inbox':
    'اعلان‌های عملیاتی — قالب‌ها، قوانین و لاگ تحویل از همین صفحه در دسترس است.',
  'notifications.templates': 'قالب پیامک، ایمیل و درون‌برنامه‌ای با متغیرهای داینامیک.',
  'notifications.rules': 'اتصال رویدادهای سیستم به قالب و کانال ارسال.',
  'notifications.delivery': 'لاگ ارسال و وضعیت تحویل پیام‌ها.',
};

interface NotificationsPageShellProps {
  routeId: string;
  children: ReactNode;
  actions?: ReactNode;
}

export function NotificationsPageShell({
  routeId,
  children,
  actions,
}: NotificationsPageShellProps) {
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
