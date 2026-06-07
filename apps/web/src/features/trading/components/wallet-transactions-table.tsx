'use client';

import { formatPersianDateTime } from '@/shared/lib/persian-date';

import { Badge, Skeleton } from '@sadafgold/ui';
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

const statusLabels: Record<string, string> = {
  PENDING: 'در انتظار تأیید',
  POSTED: 'تأیید شده',
  FAILED: 'ناموفق',
  REVERSED: 'برگشت‌خورده',
};

const statusVariant: Record<string, 'warning' | 'success' | 'error' | 'outline'> = {
  PENDING: 'warning',
  POSTED: 'success',
  FAILED: 'error',
  REVERSED: 'outline',
};

export function WalletTransactionsTable() {
  const { data, isLoading, isError, refetch } = useWalletTransactions();

  if (isLoading) {
    return (
      <div className="space-y-2 p-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-14 w-full rounded-xl" />
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <div className="p-6">
        <p className="text-sm text-rose-600 dark:text-rose-300">بارگذاری تراکنش‌ها ناموفق بود</p>
        <button type="button" className="link-gold mt-2 text-sm" onClick={() => refetch()}>
          تلاش مجدد
        </button>
      </div>
    );
  }

  const items = data?.items ?? [];

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-nude-50 text-2xl">
          ◈
        </div>
        <p className="text-sm font-medium text-foreground">تراکنشی ثبت نشده</p>
        <p className="mt-1 max-w-xs text-xs text-muted">
          پس از اولین واریز یا معامله، تاریخچه تراکنش‌های کیف پول اینجا نمایش داده می‌شود.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[640px] text-sm">
        <thead>
          <tr className="border-b border-border bg-nude-50/40 text-xs text-muted">
            <th className="px-6 py-3.5 text-right font-semibold">نوع</th>
            <th className="px-4 py-3.5 text-right font-semibold">شرح</th>
            <th className="px-4 py-3.5 text-right font-semibold">وضعیت</th>
            <th className="px-6 py-3.5 text-right font-semibold">زمان</th>
          </tr>
        </thead>
        <tbody>
          {items.map((tx, index) => (
            <tr
              key={tx.id}
              className={`border-b border-border/60 transition hover:bg-nude-50/30 ${
                index % 2 === 1 ? 'bg-nude-50/20' : ''
              }`}
            >
              <td className="px-6 py-4">
                <Badge variant={tx.type === 'DEPOSIT' ? 'gold' : 'default'}>
                  {typeLabels[tx.type] ?? tx.type}
                </Badge>
              </td>
              <td className="max-w-xs truncate px-4 py-4 text-foreground">
                {tx.description ?? tx.reference}
              </td>
              <td className="px-4 py-4">
                <Badge variant={statusVariant[tx.status] ?? 'outline'}>
                  {statusLabels[tx.status] ?? tx.status}
                </Badge>
              </td>
              <td className="px-6 py-4 text-xs text-muted">
                {formatPersianDateTime(tx.createdAt)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
