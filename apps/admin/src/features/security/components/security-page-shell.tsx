'use client';

import type { ReactNode } from 'react';
import { notFound } from 'next/navigation';
import { ADMIN_ROUTE_BY_ID } from '@/shared/config/admin-routes';
import { RoutePermissionGuard } from '@/features/auth/components/route-permission-guard';
import { PageHeader } from '@/widgets/admin/page-header';

interface SecurityPageShellProps {
  routeId: string;
  children: ReactNode;
  actions?: ReactNode;
}

const DESCRIPTIONS: Record<string, string> = {
  'security.audit': 'رویدادهای پلتفرم، کیف پول و معاملات طلا.',
  'security.sessions': 'نشست‌های فعال بر اساس refresh token.',
  'security.loginHistory': 'ورود، خروج و رویدادهای احراز هویت.',
  'security.roles': 'تعریف نقش‌های پرسنلی و تخصیص به کاربران.',
  'security.permissions': 'ماتریس مجوزها برای هر نقش.',
  'users.roles': 'تخصیص نقش پرسنلی به کاربران (همان مدیریت نقش).',
};

export function SecurityPageShell({ routeId, children, actions }: SecurityPageShellProps) {
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
