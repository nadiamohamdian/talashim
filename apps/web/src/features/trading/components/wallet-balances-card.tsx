'use client';

import { Badge, Skeleton } from '@sadafgold/ui';
import { formatPrice } from '@/shared/lib/format-price';
import { useWalletBalances } from '../hooks/use-wallet-balances';

interface WalletBalancesCardProps {
  variant?: 'default' | 'hero';
}

export function WalletBalancesCard({ variant = 'default' }: WalletBalancesCardProps) {
  const { data, isLoading, isError, refetch, isFetching } = useWalletBalances();

  if (isLoading) {
    return (
      <div className="card-luxury overflow-hidden">
        <div className="h-1 bg-gradient-to-l from-gold via-gold-light to-gold-dark" />
        <div className="p-6 md:p-8">
          <Skeleton className="mb-6 h-5 w-36" />
          <div className="grid gap-4 sm:grid-cols-2">
            <Skeleton className="h-28 w-full rounded-2xl" />
            <Skeleton className="h-28 w-full rounded-2xl" />
          </div>
        </div>
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="card-luxury p-6 md:p-8">
        <p className="text-sm text-rose-600 dark:text-rose-300">بارگذاری کیف پول ناموفق بود</p>
        <button
          type="button"
          className="link-gold mt-3 text-sm"
          onClick={() => refetch()}
        >
          تلاش مجدد
        </button>
      </div>
    );
  }

  const rial = Number(data.rialBalance);
  const gold = Number(data.goldBalanceGram);
  const isHero = variant === 'hero';

  return (
    <div className="card-luxury overflow-hidden">
      <div className="h-1 bg-gradient-to-l from-gold via-gold-light to-gold-dark" />

      <div className={isHero ? 'p-6 md:p-8' : 'p-6'}>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <Badge variant="gold" className="mb-2">
              کیف پول
            </Badge>
            <p className="text-sm text-muted">
              {isHero
                ? 'موجودی لحظه‌ای ریال و طلای شما'
                : 'موجودی ریالی و طلای حساب'}
            </p>
          </div>
          {isFetching ? (
            <span className="badge-gold animate-pulse">به‌روزرسانی…</span>
          ) : null}
        </div>

        <div className={`mt-6 grid gap-4 ${isHero ? 'sm:grid-cols-2' : 'space-y-4 sm:grid sm:grid-cols-2 sm:space-y-0'}`}>
          <div className="group relative overflow-hidden rounded-2xl border border-nude-200 bg-gradient-to-br from-card to-nude-50/80 p-5 transition hover:border-gold-light/60">
            <div className="absolute -left-6 -top-6 h-24 w-24 rounded-full bg-gold/5 transition group-hover:bg-gold/10" />
            <p className="relative text-xs font-medium uppercase tracking-wide text-muted">
              موجودی ریالی
            </p>
            <p
              className={`relative mt-2 font-bold tracking-tight text-foreground ${
                isHero ? 'text-3xl md:text-4xl' : 'text-2xl'
              }`}
            >
              {formatPrice(rial)}
            </p>
            <p className="relative mt-1 text-sm text-muted">تومان</p>
          </div>

          <div className="group relative overflow-hidden rounded-2xl border border-gold-light/50 bg-gradient-to-br from-gold/5 via-card to-nude-50/50 p-5 transition hover:border-gold/40">
            <div className="absolute -right-4 -top-4 h-20 w-20 rounded-full bg-gold/10 transition group-hover:bg-gold/15" />
            <p className="relative text-xs font-medium uppercase tracking-wide text-muted">
              موجودی طلا
            </p>
            <p
              className={`relative mt-2 font-bold tracking-tight text-gold-dark ${
                isHero ? 'text-3xl md:text-4xl' : 'text-2xl'
              }`}
            >
              {gold.toLocaleString('fa-IR', { maximumFractionDigits: 6 })}
            </p>
            <p className="relative mt-1 text-sm text-muted">گرم طلای ۱۸ عیار</p>
          </div>
        </div>
      </div>
    </div>
  );
}
