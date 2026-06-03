'use client';

import { useQuery } from '@tanstack/react-query';
import { Card, Skeleton } from '@talashim/ui';
import { fetchPricingProviders } from '../api/pricing-admin-api';
import { adminQueryKeys } from '@/lib/api/query-keys';
import { PricingPageShell } from './pricing-page-shell';
import { PROVIDER_STATUS_CLASS } from '../lib/labels';

const STATUS_FA: Record<string, string> = {
  healthy: 'سالم',
  degraded: 'تضعیف‌شده',
  down: 'قطع',
  unknown: 'نامشخص',
};

export function ProvidersPanel() {
  const { data, isLoading, isError, refetch, isFetching } = useQuery({
    queryKey: adminQueryKeys.pricing.providers,
    queryFn: fetchPricingProviders,
    refetchInterval: 60_000,
  });

  return (
    <PricingPageShell
      routeId="pricing.providers"
      actions={
        <button
          type="button"
          className="rounded-2xl border border-border bg-white px-4 py-2 text-sm font-medium"
          onClick={() => void refetch()}
          disabled={isFetching}
        >
          {isFetching ? 'در حال بررسی…' : 'بررسی مجدد'}
        </button>
      }
    >
      {isLoading ? (
        <Skeleton className="h-48 w-full" />
      ) : isError ? (
        <p className="text-rose-600">بارگذاری وضعیت ارائه‌دهندگان ناموفق بود.</p>
      ) : data ? (
        <div className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-3">
            <Card className="border-border bg-white p-4">
              <p className="text-xs text-stone-500">BrsApi</p>
              <p className="mt-1 font-medium">
                {data.env.brsApiConfigured ? 'پیکربندی شده' : 'بدون کلید API'}
              </p>
            </Card>
            <Card className="border-border bg-white p-4">
              <p className="text-xs text-stone-500">URL اختصاصی</p>
              <p className="mt-1 font-medium">
                {data.env.primaryUrlConfigured ? 'فعال' : 'غیرفعال'}
              </p>
            </Card>
            <Card className="border-border bg-white p-4">
              <p className="text-xs text-stone-500">بازه بازخوانی</p>
              <p className="mt-1 font-medium">
                {(data.env.refreshIntervalMs / 1000).toLocaleString('fa-IR')} ثانیه
              </p>
            </Card>
          </div>

          {data.marketCache ? (
            <Card className="border-border bg-white p-4">
              <p className="text-sm font-medium">کش بازار (Redis)</p>
              <p className="mt-2 text-sm text-stone-600">
                وضعیت: {data.marketCache.status} · Redis: {data.marketCache.redis}
              </p>
              <p className="text-xs text-stone-500">
                آخرین همگام‌سازی:{' '}
                {data.marketCache.lastSyncAt
                  ? new Date(data.marketCache.lastSyncAt).toLocaleString('fa-IR')
                  : '—'}
              </p>
            </Card>
          ) : null}

          <div className="grid gap-4 md:grid-cols-2">
            {data.providers.map((provider) => (
              <Card key={provider.key} className="border-border bg-white p-4">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-medium text-stone-900">{provider.name}</p>
                    <p className="text-xs text-stone-500">
                      نقش: {provider.role === 'primary' ? 'اصلی' : provider.role === 'fallback' ? 'پشتیبان' : 'بازار'}
                    </p>
                  </div>
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${PROVIDER_STATUS_CLASS[provider.status] ?? PROVIDER_STATUS_CLASS.unknown}`}
                  >
                    {STATUS_FA[provider.status] ?? provider.status}
                  </span>
                </div>
                {provider.message ? (
                  <p className="mt-2 text-xs text-stone-600">{provider.message}</p>
                ) : null}
                <p className="mt-2 text-[10px] text-stone-400">
                  آخرین بررسی: {new Date(provider.lastCheckedAt).toLocaleString('fa-IR')}
                </p>
              </Card>
            ))}
          </div>
        </div>
      ) : null}
    </PricingPageShell>
  );
}
