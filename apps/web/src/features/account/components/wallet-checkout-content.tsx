'use client';

import { Card } from '@sadafgold/ui';
import { WalletBalancesCard } from '@/features/trading/components/wallet-balances-card';
import { WalletTransactionsTable } from '@/features/trading/components/wallet-transactions-table';
import { WalletActions } from './wallet-actions';

export { CheckoutContent } from '@/features/checkout/components/checkout-content';

export function WalletPageContent() {
  return (
    <div className="space-y-6">
      <WalletBalancesCard />
      <WalletActions />
      <Card className="overflow-hidden border-[var(--border-subtle)] bg-[var(--card)] p-0">
        <div className="border-b border-[var(--border-subtle)] px-6 py-4">
          <h2 className="text-sm font-semibold text-foreground">تاریخچه تراکنش‌ها</h2>
        </div>
        <WalletTransactionsTable />
      </Card>
    </div>
  );
}
