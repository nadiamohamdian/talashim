'use client';

import { formatPersianDateTime } from '@/shared/lib/persian-date';

import { Badge, Card, Skeleton } from '@sadafgold/ui';
import { useWalletTransactions } from '../hooks/use-wallet-transactions';

const typeLabels: Record<string, string> = {
  DEPOSIT: 'واریز',
  WITHDRAWAL: 'برداشت',
  TRANSFER: 'انتقال',
  TRADE_BUY: 'خرید طلا',
  TRADE_SELL: 'فروش طلا',
  CONVERSION: 'تبدیل',
  FEE: 'کارمزد',
  ADJUSTMENT: 'تعدیل',
};

export function WalletTransactionsTable() {
  const { data, isLoading, isError, refetch } = useWalletTransactions();

  if (isLoading) {
    return (
      <div className="space-y-2 p-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-14 w-full" />
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <div className="p-6">
        <p className="text-sm text-rose-600 dark:text-rose-300">بارگذاری تراکنش‌ها ناموفق بود</p>
        <button
          type="button"
          className="mt-2 text-sm text-amber-600 underline dark:text-amber-400"
          onClick={() => refetch()}
        >
          تلاش مجدد
        </button>
      </div>
    );
  }

  const items = data?.items ?? [];

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[640px] text-sm">
        <thead className="bg-stone-50 text-xs text-stone-500 dark:bg-zinc-900/80 dark:text-zinc-400">
          <tr>
            <th className="px-4 py-3 text-right font-medium">نوع</th>
            <th className="px-4 py-3 text-right font-medium">شرح</th>
            <th className="px-4 py-3 text-right font-medium">وضعیت</th>
            <th className="px-4 py-3 text-right font-medium">زمان</th>
          </tr>
        </thead>
        <tbody>
          {items.length === 0 ? (
            <tr>
              <td colSpan={4} className="px-4 py-10 text-center text-stone-500">
                تراکنش کیف پولی ثبت نشده است
              </td>
            </tr>
          ) : (
            items.map((tx) => (
              <tr key={tx.id} className="border-t border-stone-100 dark:border-zinc-800">
                <td className="px-4 py-3">
                  <Badge>{typeLabels[tx.type] ?? tx.type}</Badge>
                </td>
                <td className="max-w-xs truncate px-4 py-3 text-stone-700 dark:text-zinc-300">
                  {tx.description ?? tx.reference}
                </td>
                <td className="px-4 py-3 text-xs">{tx.status}</td>
                <td className="px-4 py-3 text-xs text-stone-500">
                  {formatPersianDateTime(tx.createdAt)}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
