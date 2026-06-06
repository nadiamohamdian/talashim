'use client';

import { formatPersianDateTime } from '@/shared/lib/format-date';

import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Button, Card, Skeleton } from '@talashim/ui';
import { fetchAdminLivePrice, refreshAdminLivePrice } from '../api/pricing-admin-api';
import { adminQueryKeys } from '@/lib/api/query-keys';
import { PricingPageShell } from './pricing-page-shell';
import { formatRial, PRICE_SOURCE_FA, selectFieldClass } from '../lib/labels';

export function LivePricingPanel() {
  const queryClient = useQueryClient();
  const [symbol, setSymbol] = useState('XAU-IRR');
  const [karat, setKarat] = useState(18);

  const liveQuery = useQuery({
    queryKey: adminQueryKeys.pricing.live(symbol, karat),
    queryFn: () => fetchAdminLivePrice({ symbol, karat }),
    refetchInterval: 30_000,
  });

  const refreshMutation = useMutation({
    mutationFn: () => refreshAdminLivePrice({ symbol, karat }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['admin', 'pricing', 'live'] });
      void queryClient.invalidateQueries({ queryKey: ['admin', 'pricing', 'history'] });
    },
  });

  const live = liveQuery.data;

  return (
    <PricingPageShell
      routeId="pricing.live"
      actions={
        <Button
          variant="secondary"
          disabled={refreshMutation.isPending}
          onClick={() => refreshMutation.mutate()}
        >
          {refreshMutation.isPending ? 'در حال بازخوانی…' : 'بازخوانی قیمت'}
        </Button>
      }
    >
      <div className="flex flex-wrap gap-4">
        <div>
          <label className="text-xs text-stone-500">نماد</label>
          <select
            className={selectFieldClass}
            value={symbol}
            onChange={(e) => setSymbol(e.target.value)}
          >
            <option value="XAU-IRR">XAU-IRR</option>
          </select>
        </div>
        <div>
          <label className="text-xs text-stone-500">عیار</label>
          <select
            className={selectFieldClass}
            value={karat}
            onChange={(e) => setKarat(Number(e.target.value))}
          >
            <option value={18}>۱۸ عیار</option>
            <option value={24}>۲۴ عیار</option>
          </select>
        </div>
      </div>

      {liveQuery.isLoading ? (
        <Skeleton className="h-40 w-full rounded-2xl" />
      ) : live ? (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { label: 'قیمت هر گرم', value: formatRial(live.pricePerGram) },
              { label: 'قیمت خرید', value: formatRial(live.buyPrice) },
              { label: 'قیمت فروش', value: formatRial(live.sellPrice) },
              { label: 'اسپرد', value: `${live.spreadPercent}%` },
            ].map((item) => (
              <Card key={item.label} className="border-border bg-white p-5">
                <p className="text-xs text-stone-500">{item.label}</p>
                <p className="mt-2 text-xl font-semibold text-gold-dark">{item.value}</p>
              </Card>
            ))}
          </div>
          <p className="text-xs text-stone-500">
            {live.providerName} · {PRICE_SOURCE_FA[live.source] ?? live.source} ·{' '}
            {formatPersianDateTime(live.recordedAt)}
          </p>
        </>
      ) : liveQuery.isError ? (
        <p className="text-rose-600">بارگذاری قیمت زنده ناموفق بود.</p>
      ) : null}
    </PricingPageShell>
  );
}
