'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Button, Card, Skeleton } from '@sadafgold/ui';
import {
  fetchGoldPriceHistory,
  fetchLiveGoldPrice,
  refreshLiveGoldPrice,
} from '@/lib/api/pricing.api';
import { adminQueryKeys } from '@/lib/api/query-keys';
import { PageHeader } from '@/widgets/admin/page-header';
import { ApiUnavailablePanel } from '@/widgets/admin/api-unavailable-panel';
import { API_REQUIREMENTS } from '@/shared/config/api-requirements';

export function LivePricingPanel() {
  const queryClient = useQueryClient();
  const symbol = 'XAU-IRR';
  const karat = 18;

  const liveQuery = useQuery({
    queryKey: adminQueryKeys.pricingLive(symbol, karat),
    queryFn: () => fetchLiveGoldPrice({ symbol, karat }),
    refetchInterval: 30_000,
  });

  const historyQuery = useQuery({
    queryKey: adminQueryKeys.pricingHistory(symbol, karat),
    queryFn: () => fetchGoldPriceHistory({ symbol, karat, limit: 50 }),
  });

  const refreshMutation = useMutation({
    mutationFn: () => refreshLiveGoldPrice({ symbol, karat }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: adminQueryKeys.pricingLive(symbol, karat) });
      void queryClient.invalidateQueries({
        queryKey: adminQueryKeys.pricingHistory(symbol, karat),
      });
    },
  });

  const live = liveQuery.data;

  return (
    <div className="space-y-6">
      <PageHeader
        title="قیمت زنده طلا"
        description="منبع: GET /pricing/live — بازخوانی: POST /pricing/refresh"
        availability="live"
        actions={
          <Button
            variant="secondary"
            disabled={refreshMutation.isPending}
            onClick={() => refreshMutation.mutate()}
          >
            {refreshMutation.isPending ? 'در حال بازخوانی…' : 'بازخوانی قیمت'}
          </Button>
        }
      />

      {liveQuery.isLoading ? (
        <Skeleton className="h-40 w-full rounded-2xl" />
      ) : live ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { label: 'قیمت هر گرم', value: live.pricePerGram },
            { label: 'قیمت خرید', value: live.buyPrice },
            { label: 'قیمت فروش', value: live.sellPrice },
            { label: 'اسپرد', value: `${live.spreadPercent}%` },
          ].map((item) => (
            <Card key={item.label} className="border-zinc-800 bg-zinc-900/60 p-5">
              <p className="text-xs text-zinc-500">{item.label}</p>
              <p className="mt-2 text-xl font-semibold text-amber-300">
                {typeof item.value === 'string' && item.value.includes('%')
                  ? item.value
                  : `${Number(item.value).toLocaleString('fa-IR')} ریال`}
              </p>
            </Card>
          ))}
        </div>
      ) : null}

      {live ? (
        <p className="text-xs text-zinc-500">
          {live.providerName} · {live.source} · {new Date(live.recordedAt).toLocaleString('fa-IR')}
        </p>
      ) : null}

      <Card className="border-zinc-800 bg-zinc-900/60 p-6">
        <h2 className="font-semibold text-zinc-100">تاریخچه ۲۴ ساعت</h2>
        <p className="mt-1 text-xs text-zinc-500">GET /pricing/history</p>
        <div className="mt-4 max-h-80 overflow-auto">
          {historyQuery.isLoading ? (
            <Skeleton className="h-32 w-full" />
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="text-xs text-zinc-500">
                  <th className="py-2 text-right">زمان</th>
                  <th className="py-2 text-right">گرم</th>
                  <th className="py-2 text-right">خرید</th>
                  <th className="py-2 text-right">فروش</th>
                </tr>
              </thead>
              <tbody>
                {historyQuery.data?.map((row) => (
                  <tr key={row.id} className="border-t border-zinc-800">
                    <td className="py-2 text-zinc-400">
                      {new Date(row.recordedAt).toLocaleString('fa-IR')}
                    </td>
                    <td className="py-2">{Number(row.pricePerGram).toLocaleString('fa-IR')}</td>
                    <td className="py-2">{Number(row.buyPrice).toLocaleString('fa-IR')}</td>
                    <td className="py-2">{Number(row.sellPrice).toLocaleString('fa-IR')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </Card>

      <ApiUnavailablePanel {...API_REQUIREMENTS.pricingAdmin} />
    </div>
  );
}
