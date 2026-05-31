'use client';

import { Badge, Card, Skeleton } from '@sadafgold/ui';
import { formatPrice } from '@/shared/lib/format-price';
import { useWalletBalances } from '../hooks/use-wallet-balances';

export function WalletBalancesCard() {
  const { data, isLoading, isError, refetch, isFetching } = useWalletBalances();

  if (isLoading) {
    return (
      <Card className="p-6">
        <Skeleton className="mb-4 h-5 w-32" />
        <Skeleton className="mb-3 h-14 w-full" />
        <Skeleton className="h-14 w-full" />
      </Card>
    );
  }

  if (isError || !data) {
    return (
      <Card className="p-6">
        <p className="text-sm text-rose-600 dark:text-rose-300">بارگذاری کیف پول ناموفق بود</p>
        <button
          type="button"
          className="mt-3 text-sm text-amber-600 underline dark:text-amber-400"
          onClick={() => refetch()}
        >
          تلاش مجدد
        </button>
      </Card>
    );
  }

  const rial = Number(data.rialBalance);
  const gold = Number(data.goldBalanceGram);

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between gap-2">
        <Badge>کیف پول</Badge>
        {isFetching ? <span className="text-xs text-stone-500">...</span> : null}
      </div>
      <div className="mt-5 space-y-4">
        <div className="rounded-2xl border border-stone-100 bg-stone-50 px-4 py-4 dark:border-zinc-800 dark:bg-zinc-900/50">
          <p className="text-xs text-stone-500 dark:text-zinc-400">موجودی ریالی</p>
          <p className="mt-1 text-xl font-bold text-stone-950 dark:text-zinc-50">
            {formatPrice(rial)} <span className="text-sm font-normal">تومان</span>
          </p>
        </div>
        <div className="rounded-2xl border border-amber-200/60 bg-amber-50/50 px-4 py-4 dark:border-amber-500/20 dark:bg-amber-500/5">
          <p className="text-xs text-stone-500 dark:text-zinc-400">موجودی طلا</p>
          <p className="mt-1 text-xl font-bold text-amber-800 dark:text-amber-300">
            {gold.toLocaleString('fa-IR', { maximumFractionDigits: 6 })} گرم
          </p>
        </div>
      </div>
    </Card>
  );
}
