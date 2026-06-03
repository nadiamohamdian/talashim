'use client';

import Link from 'next/link';
import { ADMIN_ROUTES } from '@/shared/config/admin-routes';
import type { AdminPermissionKey } from '@/shared/config/admin-permissions';
import { useAdminAuthStore } from '@/features/auth/model/admin-auth-store';
import { usePlatformSettingsStore } from '../model/settings-store';

const CHILD_ROUTES = ADMIN_ROUTES.filter((r) => r.parentId === 'settings.home');

const OVERVIEW_HINTS: Record<string, string> = {
  'settings.general': 'برند، تماس، تعمیرات',
  'settings.commerce': 'سفارش، پرداخت، مالیات',
  'settings.gold': 'قیمت طلا و معاملات',
  'settings.featureFlags': 'فعال/غیرفعال کردن ماژول‌ها',
};

export function SettingsOverviewPanel() {
  const hasPermission = useAdminAuthStore((s) => s.hasPermission);
  const { general, commerce, gold, featureFlags, updatedAt } = usePlatformSettingsStore();

  const links = CHILD_ROUTES.filter((route) =>
    hasPermission(route.permission as AdminPermissionKey),
  );

  return (
    <div className="space-y-6">
      <div className="card-luxury p-5">
        <h2 className="text-sm font-semibold text-stone-900">وضعیت فعلی</h2>
        <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
          <div className="rounded-xl bg-nude-50 px-4 py-3">
            <dt className="text-xs text-stone-500">فروشگاه</dt>
            <dd className="mt-1 font-medium text-stone-900">{general.storeName}</dd>
          </div>
          <div className="rounded-xl bg-nude-50 px-4 py-3">
            <dt className="text-xs text-stone-500">حداقل سفارش</dt>
            <dd className="mt-1 font-medium text-stone-900">
              {commerce.minOrderToman.toLocaleString('fa-IR')} {commerce.currencyLabel}
            </dd>
          </div>
          <div className="rounded-xl bg-nude-50 px-4 py-3">
            <dt className="text-xs text-stone-500">اسپرد طلا</dt>
            <dd className="mt-1 font-medium text-stone-900">{gold.spreadPercent}٪</dd>
          </div>
          <div className="rounded-xl bg-nude-50 px-4 py-3">
            <dt className="text-xs text-stone-500">معاملات طلا</dt>
            <dd className="mt-1 font-medium text-stone-900">
              {featureFlags.enableGoldTrading ? 'فعال' : 'غیرفعال'}
            </dd>
          </div>
        </dl>
        {general.maintenanceMode ? (
          <p className="mt-4 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900">
            حالت تعمیرات فعال است.
          </p>
        ) : null}
        {updatedAt ? (
          <p className="mt-3 text-xs text-stone-500">
            آخرین ذخیره:{' '}
            {new Date(updatedAt).toLocaleString('fa-IR', {
              dateStyle: 'medium',
              timeStyle: 'short',
            })}
          </p>
        ) : (
          <p className="mt-3 text-xs text-stone-500">هنوز تغییری ذخیره نشده — مقادیر پیش‌فرض.</p>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {links.map((route) => (
          <Link
            key={route.id}
            href={route.path}
            className="card-luxury group p-5 transition hover:border-gold-light hover:shadow-md"
          >
            <p className="font-semibold text-stone-900 group-hover:text-gold-dark">{route.label}</p>
            <p className="mt-2 text-sm text-stone-500">
              {OVERVIEW_HINTS[route.id] ?? route.sectionLabel}
            </p>
            <span className="mt-4 inline-block text-xs font-medium text-gold-dark">مشاهده ←</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
