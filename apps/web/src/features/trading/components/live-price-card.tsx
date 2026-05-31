'use client';

import { Badge, Card, Skeleton } from '@sadafgold/ui';
import { formatPrice } from '@/shared/lib/format-price';
import { useLiveGoldPrice } from '../hooks/use-live-gold-price';

export function LivePriceCard() {
  const { data, isLoading, isError, isFetching } = useLiveGoldPrice();

  if (isLoading) {
    return (
      <Card className="relative overflow-hidden p-6">
        <Skeleton className="mb-3 h-5 w-28" />
        <Skeleton className="mb-2 h-10 w-48" />
        <Skeleton className="h-4 w-64" />
      </Card>
    );
  }

  if (isError || !data) {
    return (
      <Card className="border-rose-200 p-6 dark:border-rose-900/50">
        <p className="text-sm text-rose-600 dark:text-rose-300">دریافت قیمت لحظه‌ای ناموفق بود</p>
      </Card>
    );
  }

  const spot = Number(data.pricePerGram);
  const buy = Number(data.buyPrice);
  const sell = Number(data.sellPrice);

  return (
    <Card className="relative overflow-hidden border-amber-500/20 bg-gradient-to-br from-zinc-950 via-zinc-900 to-stone-900 p-6 text-zinc-50 dark:from-zinc-950 dark:via-zinc-900 dark:to-black">
      <div className="absolute -left-8 -top-8 h-32 w-32 rounded-full bg-amber-500/10 blur-2xl" />
      <div className="relative flex flex-wrap items-start justify-between gap-3">
        <div>
          <Badge className="bg-amber-500/20 text-amber-200">قیمت لحظه‌ای طلا</Badge>
          <p className="mt-3 text-xs text-zinc-400">
            {data.symbol} · عیار {data.karat} · {isFetching ? 'به‌روزرسانی...' : 'زنده'}
          </p>
          <p className="mt-2 font-mono text-3xl font-bold tracking-tight text-amber-300 sm:text-4xl">
            {formatPrice(spot)}
            <span className="mr-2 text-sm font-normal text-zinc-400">تومان / گرم</span>
          </p>
        </div>
        <div className="text-left text-xs text-zinc-400">
          <p>منبع: {data.providerName}</p>
          <p className="mt-1">{new Date(data.recordedAt).toLocaleString('fa-IR')}</p>
        </div>
      </div>
      <div className="relative mt-6 grid grid-cols-2 gap-3 sm:max-w-md">
        <div className="rounded-2xl border border-zinc-800 bg-zinc-950/60 px-4 py-3">
          <p className="text-xs text-zinc-500">خرید از شما</p>
          <p className="mt-1 font-semibold text-emerald-400">{formatPrice(buy)}</p>
        </div>
        <div className="rounded-2xl border border-zinc-800 bg-zinc-950/60 px-4 py-3">
          <p className="text-xs text-zinc-500">فروش به شما</p>
          <p className="mt-1 font-semibold text-rose-400">{formatPrice(sell)}</p>
        </div>
      </div>
    </Card>
  );
}
