'use client';

import { Card, Tabs, TabsContent, TabsList, TabsTrigger } from '@sadafgold/ui';
import { TradeHistoryTable } from './trade-history-table';
import { WalletTransactionsTable } from './wallet-transactions-table';

export function TransactionHistorySection() {
  return (
    <Card className="overflow-hidden p-0">
      <Tabs defaultValue="trades" className="space-y-0">
        <div className="border-b border-stone-100 px-6 py-4 dark:border-zinc-800">
          <h2 className="font-bold text-stone-950 dark:text-zinc-50">تاریخچه</h2>
          <TabsList className="mt-4">
            <TabsTrigger value="trades">سفارش‌های معاملاتی</TabsTrigger>
            <TabsTrigger value="wallet">تراکنش‌های کیف پول</TabsTrigger>
          </TabsList>
        </div>
        <TabsContent value="trades" className="mt-0">
          <TradeHistoryTable embedded />
        </TabsContent>
        <TabsContent value="wallet" className="mt-0">
          <WalletTransactionsTable />
        </TabsContent>
      </Tabs>
    </Card>
  );
}
