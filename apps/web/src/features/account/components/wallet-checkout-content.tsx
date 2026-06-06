'use client';

import { WalletBalancesCard } from '@/features/trading/components/wallet-balances-card';
import { WalletTransactionsTable } from '@/features/trading/components/wallet-transactions-table';

export { CheckoutContent } from '@/features/checkout/components/checkout-content';

export function WalletPageContent() {
  return (
    <div className="mx-auto max-w-4xl space-y-8 px-4 py-8">
      <header>
        <h1 className="text-2xl font-bold">کیف پول</h1>
        <p className="mt-2 text-sm text-muted">موجودی ریال و طلا</p>
      </header>
      <WalletBalancesCard />
      <WalletTransactionsTable />
    </div>
  );
}
