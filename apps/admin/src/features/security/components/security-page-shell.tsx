'use client';

import type { ReactNode } from 'react';
import { notFound } from 'next/navigation';
import { ADMIN_ROUTE_BY_ID } from '@/shared/config/admin-routes';
import { RoutePermissionGuard } from '@/features/auth/components/route-permission-guard';
import { getSectionIcon } from '@/shared/lib/admin-nav-icons';
import { getSectionTheme } from '@/shared/lib/admin-section-theme';
import { PageHeader } from '@/widgets/admin/page-header';

interface SecurityPageShellProps {
  routeId: string;
  children: ReactNode;
  actions?: ReactNode;
}

const DESCRIPTIONS: Record<string, string> = {
  'security.audit': 'رویدادهای پلتفرم، کیف پول، معاملات طلا و تاریخچه ورود.',
  'security.sessions': 'نشست‌های فعال بر اساس refresh token.',
  'security.loginHistory': 'ادغام‌شده در لاگ ممیزی (تب تاریخچه ورود).',
  'security.roles': 'افزودن پرسنل، تخصیص نقش، تغییر ایمیل و رمز عبور.',
  'security.permissions': 'ادغام‌شده در نقش‌ها و دسترسی (تب ماتریس).',
  'users.roles': 'تخصیص نقش پرسنلی به کاربران (همان نقش‌ها و دسترسی).',
};

export function SecurityPageShell({ routeId, children, actions }: SecurityPageShellProps) {
  const route = ADMIN_ROUTE_BY_ID[routeId];
  if (!route) {
    notFound();
  }

  const SectionIcon = getSectionIcon(route.sectionId);
  const theme = getSectionTheme(route.sectionId);

  return (
    <RoutePermissionGuard permission={route.permission}>
      <div className="admin-page-stack">
        <PageHeader
          title={route.label}
          description={DESCRIPTIONS[routeId]}
          availability={route.availability}
          actions={actions}
          icon={SectionIcon}
          iconTheme={theme}
        />
        {children}
      </div>
    </RoutePermissionGuard>
  );
}
