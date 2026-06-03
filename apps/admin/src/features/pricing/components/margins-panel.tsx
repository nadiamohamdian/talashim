'use client';

import { useEffect, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Button, Card, Input, Label, Skeleton } from '@talashim/ui';
import { fetchPricingMargins, updatePricingMargins } from '../api/pricing-admin-api';
import { adminQueryKeys } from '@/lib/api/query-keys';
import { PricingPageShell } from './pricing-page-shell';

export function MarginsPanel() {
  const queryClient = useQueryClient();
  const { data, isLoading, isError } = useQuery({
    queryKey: adminQueryKeys.pricing.margins,
    queryFn: fetchPricingMargins,
  });

  const [spreadPercent, setSpreadPercent] = useState(1.5);
  const [tradeCommissionPercent, setTradeCommissionPercent] = useState(0.5);
  const [defaultMakingFeePercent, setDefaultMakingFeePercent] = useState(10);
  const [refreshIntervalMs, setRefreshIntervalMs] = useState(30_000);
  const [brsEnabled, setBrsEnabled] = useState(true);

  useEffect(() => {
    if (data) {
      setSpreadPercent(data.spreadPercent);
      setTradeCommissionPercent(data.tradeCommissionPercent);
      setDefaultMakingFeePercent(data.defaultMakingFeePercent);
      setRefreshIntervalMs(data.refreshIntervalMs);
      setBrsEnabled(data.brsEnabled);
    }
  }, [data]);

  const save = useMutation({
    mutationFn: () =>
      updatePricingMargins({
        spreadPercent,
        tradeCommissionPercent,
        defaultMakingFeePercent,
        refreshIntervalMs,
        brsEnabled,
      }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: adminQueryKeys.pricing.margins });
    },
  });

  return (
    <PricingPageShell routeId="pricing.margins">
      {isLoading ? (
        <Skeleton className="h-64 w-full" />
      ) : isError ? (
        <p className="text-rose-600">بارگذاری تنظیمات ناموفق بود.</p>
      ) : (
        <Card className="max-w-2xl space-y-4 border-border bg-white p-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label>اسپرد خرید/فروش (%)</Label>
              <Input
                className="mt-1"
                type="number"
                step="0.1"
                value={spreadPercent}
                onChange={(e) => setSpreadPercent(Number(e.target.value))}
              />
            </div>
            <div>
              <Label>کارمزد معاملات (%)</Label>
              <Input
                className="mt-1"
                type="number"
                step="0.1"
                value={tradeCommissionPercent}
                onChange={(e) => setTradeCommissionPercent(Number(e.target.value))}
              />
            </div>
            <div>
              <Label>اجرت ساخت پیش‌فرض (%)</Label>
              <Input
                className="mt-1"
                type="number"
                value={defaultMakingFeePercent}
                onChange={(e) => setDefaultMakingFeePercent(Number(e.target.value))}
              />
            </div>
            <div>
              <Label>بازه بازخوانی (میلی‌ثانیه)</Label>
              <Input
                className="mt-1"
                type="number"
                value={refreshIntervalMs}
                onChange={(e) => setRefreshIntervalMs(Number(e.target.value))}
              />
              <p className="mt-1 text-xs text-stone-500">
                معادل {(refreshIntervalMs / 1000).toLocaleString('fa-IR')} ثانیه
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <input
              id="brs-enabled"
              type="checkbox"
              checked={brsEnabled}
              onChange={(e) => setBrsEnabled(e.target.checked)}
            />
            <Label htmlFor="brs-enabled">استفاده از BrsApi به‌عنوان منبع اصلی</Label>
          </div>

          {data ? (
            <p className="text-xs text-stone-500">
              ارائه‌دهنده اصلی: {data.primaryProviderName} · پشتیبان:{' '}
              {data.fallbackProviderName}
            </p>
          ) : null}

          <Button disabled={save.isPending} onClick={() => save.mutate()}>
            {save.isPending ? 'در حال ذخیره…' : 'ذخیره تنظیمات'}
          </Button>
        </Card>
      )}
    </PricingPageShell>
  );
}
