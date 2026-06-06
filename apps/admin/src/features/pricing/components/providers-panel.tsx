'use client';

import { formatPersianDateTime } from '@/shared/lib/format-date';

import { useQuery } from '@tanstack/react-query';
import { Card, Skeleton } from '@sadafgold/ui';
import { fetchPricingProviders } from '../api/pricing-admin-api';
import { useAdminAuthStore } from '@/features/auth/model/admin-auth-store';
import { adminQueryKeys } from '@/lib/api/query-keys';
import { AdminApiError } from '@/shared/ui/admin-api-error';
import { PricingPageShell } from './pricing-page-shell';
import { PROVIDER_STATUS_CLASS } from '../lib/labels';

const STATUS_FA: Record<string, string> = {
  healthy: 'سالم',
  degraded: 'تضعیف‌شده',
  down: 'قطع',
  unknown: 'نامشخص',
};

export function ProvidersPanel() {
  const accessToken = useAdminAuthStore((s) => s.accessToken);

  const { data, isLoading, isError, error, refetch, isFetching } = useQuery({
    queryKey: adminQueryKeys.pricing.providers,
    queryFn: fetchPricingProviders,
    enabled: Boolean(accessToken),
    refetchInterval: 60_000,
  });

  return (
    <PricingPageShell
      routeId="pricing.providers"
      actions={
        <button
          type="button"
          className="btn-gold px-4 py-2 text-sm"
          onClick={() => void refetch()}
          disabled={isFetching}
        >
          {isFetching ? 'در حال بررسی…' : 'بررسی مجدد'}
        </button>
      }
    >
      {isLoading ? (
        <Skeleton className="h-48 w-full rounded-2xl" />
      ) : isError ? (
        <Card className="overflow-hidden border-border bg-white p-0">
          <AdminApiError
            title="بارگذاری وضعیت ارائه‌دهندگان ناموفق بود."
            error={error}
            onRetry={() => void refetch()}
          />
        </Card>
      ) : data ? (
        <div className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-3">
            <Card className="border-amber-200 bg-amber-50/80 p-4">
              <p className="text-xs font-semibold text-amber-900">BrsApi</p>
              <p className="mt-1 font-bold text-stone-900">
                {data.env.brsApiConfigured ? 'پیکربندی شده' : 'بدون کلید API'}
              </p>
            </Card>
            <Card className="border-amber-200 bg-amber-50/80 p-4">
              <p className="text-xs font-semibold text-amber-900">URL اختصاصی</p>
              <p className="mt-1 font-bold text-stone-900">
                {data.env.primaryUrlConfigured ? 'فعال' : 'غیرفعال'}
              </p>
            </Card>
            <Card className="border-amber-200 bg-amber-50/80 p-4">
              <p className="text-xs font-semibold text-amber-900">بازه بازخوانی</p>
              <p className="mt-1 font-bold text-stone-900">
                {(data.env.refreshIntervalMs / 1000).toLocaleString('fa-IR')} ثانیه
              </p>
            </Card>
          </div>

          {data.marketCache ? (
            <Card className="border-border bg-white p-4">
              <p className="text-sm font-bold text-stone-900">کش بازار (Redis)</p>
              <p className="mt-2 text-sm text-stone-600">
                وضعیت: {data.marketCache.status} · Redis: {data.marketCache.redis}
              </p>
              <p className="text-xs text-stone-500">
                آخرین همگام‌سازی:{' '}
                {data.marketCache.lastSyncAt
                  ? formatPersianDateTime(data.marketCache.lastSyncAt)
                  : '—'}
              </p>
            </Card>
          ) : null}

          <div className="grid gap-4 md:grid-cols-2">
            {data.providers.map((provider) => (
              <Card key={provider.key} className="border-border bg-white p-4 shadow-sm">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-bold text-stone-900">{provider.name}</p>
                    <p className="text-xs text-stone-500">
                      نقش:{' '}
                      {provider.role === 'primary'
                        ? 'اصلی'
                        : provider.role === 'fallback'
                          ? 'پشتیبان'
                          : 'بازار'}
                    </p>
                  </div>
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${PROVIDER_STATUS_CLASS[provider.status] ?? PROVIDER_STATUS_CLASS.unknown}`}
                  >
                    {STATUS_FA[provider.status] ?? provider.status}
                  </span>
                </div>
                {provider.message ? (
                  <p className="mt-2 text-xs text-stone-600">{provider.message}</p>
                ) : null}
                <p className="mt-2 text-[10px] text-stone-400">
                  آخرین بررسی: {formatPersianDateTime(provider.lastCheckedAt)}
                </p>
              </Card>
            ))}
          </div>
        </div>
      ) : null}
    </PricingPageShell>
  );
}
