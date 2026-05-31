'use client';

import { LivePriceCard } from '@/features/trading/components/live-price-card';
import { PriceChart } from '@/features/trading/components/price-chart';
import { ThemeToggle } from '@/features/trading/components/theme-toggle';
import { TradeForm } from '@/features/trading/components/trade-form';
import { TransactionHistorySection } from '@/features/trading/components/transaction-history-section';
import { TradingErrorBoundary } from '@/features/trading/components/trading-error-boundary';
import { WalletBalancesCard } from '@/features/trading/components/wallet-balances-card';

export function TradingDashboard() {
  return (
    <TradingErrorBoundary>
      <div className="space-y-8">
        <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.25em] text-amber-600 dark:text-amber-400">
              Sadaf Gold Trading
            </p>
            <h1 className="mt-2 text-2xl font-bold text-stone-950 dark:text-zinc-50 sm:text-3xl">
              داشبورد معاملات طلا
            </h1>
            <p className="mt-2 max-w-xl text-sm text-stone-600 dark:text-zinc-400">
              قیمت لحظه‌ای، کیف پول، خرید و فروش بازار و تاریخچه تراکنش‌ها
            </p>
          </div>
          <ThemeToggle />
        </header>

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-2">
            <LivePriceCard />
            <PriceChart />
          </div>
          <div className="space-y-6">
            <WalletBalancesCard />
            <TradeForm />
          </div>
        </div>

        <TransactionHistorySection />
      </div>
    </TradingErrorBoundary>
  );
}
