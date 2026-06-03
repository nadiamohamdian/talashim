'use client';

import type { ReactNode } from 'react';
import { notFound } from 'next/navigation';
import { ADMIN_ROUTE_BY_ID } from '@/shared/config/admin-routes';
import { RoutePermissionGuard } from '@/features/auth/components/route-permission-guard';
import { PageHeader } from '@/widgets/admin/page-header';

const DESCRIPTIONS: Record<string, string> = {
  'users.list': 'فهرست مشتریان و کاربران ثبت‌نام‌شده با جستجو و فیلتر نقش.',
  'users.detail': 'پروفایل، احراز هویت، کیف پول و فعالیت اخیر کاربر.',
  'users.kyc': 'بررسی و تأیید یا رد درخواست‌های احراز هویت.',
  'users.roles': 'افزودن پرسنل و مدیریت نقش، ایمیل و رمز عبور.',
  'users.permissions': 'ماتریس مجوزهای هر نقش پرسنلی.',
};

interface UsersPageShellProps {
  routeId: string;
  children: ReactNode;
  actions?: ReactNode;
}

export function UsersPageShell({ routeId, children, actions }: UsersPageShellProps) {
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
