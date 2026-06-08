'use client';

import { useMemo } from 'react';
import { formatPersianDateTime } from '@/shared/lib/format-date';

import Link from 'next/link';
import { ADMIN_ROUTES } from '@/shared/config/admin-routes';
import type { AdminPermissionKey } from '@/shared/config/admin-permissions';
import { useAdminAuthStore } from '@/features/auth/model/admin-auth-store';
import { formatTomanAmount } from '@sadafgold/shared';
import { usePlatformSettingsStore } from '../model/settings-store';

const CHILD_ROUTES = ADMIN_ROUTES.filter((r) => r.parentId === 'settings.home');

const OVERVIEW_HINTS: Record<string, string> = {
  'settings.general': 'برند، تماس، تعمیرات',
  'settings.commerce': 'سفارش، پرداخت، مالیات',
  'settings.gold': 'قیمت طلا و معاملات',
  'settings.featureFlags': 'فعال/غیرفعال کردن ماژول‌ها',
};

export function SettingsOverviewPanel() {
  const permissions = useAdminAuthStore((s) => s.permissions);
  const hasPermission = useAdminAuthStore((s) => s.hasPermission);
  const { general, commerce, gold, featureFlags, updatedAt } = usePlatformSettingsStore();

  const links = useMemo(
    () =>
      CHILD_ROUTES.filter((route) =>
        hasPermission(route.permission as AdminPermissionKey),
      ),
    [hasPermission, permissions],
  );

  return (
    <div className="space-y-6">
      <div className="card-luxury p-5">
        <h2 className="text-sm font-semibold text-foreground">وضعیت فعلی</h2>
        <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
          <div className="rounded-[var(--radius-xl)] bg-[var(--surface)] px-4 py-3">
            <dt className="text-xs text-muted">فروشگاه</dt>
            <dd className="mt-1 font-medium text-foreground">{general.storeName}</dd>
          </div>
          <div className="rounded-[var(--radius-xl)] bg-[var(--surface)] px-4 py-3">
            <dt className="text-xs text-muted">حداقل سفارش</dt>
            <dd className="mt-1 font-medium text-foreground">
              {formatTomanAmount(commerce.minOrderToman)} {commerce.currencyLabel}
            </dd>
          </div>
          <div className="rounded-[var(--radius-xl)] bg-[var(--surface)] px-4 py-3">
            <dt className="text-xs text-muted">اسپرد طلا</dt>
            <dd className="mt-1 font-medium text-foreground">{gold.spreadPercent}٪</dd>
          </div>
          <div className="rounded-[var(--radius-xl)] bg-[var(--surface)] px-4 py-3">
            <dt className="text-xs text-muted">معاملات طلا</dt>
            <dd className="mt-1 font-medium text-foreground">
              {featureFlags.enableGoldTrading ? 'فعال' : 'غیرفعال'}
            </dd>
          </div>
        </dl>
        {general.maintenanceMode ? (
          <p className="mt-4 rounded-lg border border-[var(--warning-border)] bg-[var(--warning-bg)] px-3 py-2 text-sm text-[var(--warning-foreground)]">
            حالت تعمیرات فعال است.
          </p>
        ) : null}
        {updatedAt ? (
          <p className="mt-3 text-xs text-muted">
            آخرین ذخیره:{' '}
            {formatPersianDateTime(updatedAt)}
          </p>
        ) : (
          <p className="mt-3 text-xs text-muted">هنوز تغییری ذخیره نشده — مقادیر پیش‌فرض.</p>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {links.map((route) => (
          <Link
            key={route.id}
            href={route.path}
            className="card-luxury group p-5 transition hover:border-gold-light hover:shadow-md"
          >
            <p className="font-semibold text-foreground group-hover:text-gold-dark">{route.label}</p>
            <p className="mt-2 text-sm text-muted">
              {OVERVIEW_HINTS[route.id] ?? route.sectionLabel}
            </p>
            <span className="mt-4 inline-block text-xs font-medium text-gold-dark">مشاهده ←</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
