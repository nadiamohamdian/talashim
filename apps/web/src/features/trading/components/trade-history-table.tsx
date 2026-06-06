'use client';

import { formatPersianDateTime } from '@/shared/lib/persian-date';

import { Badge, Card, Skeleton } from '@sadafgold/ui';
import { formatPrice } from '@/shared/lib/format-price';
import { useTradeOrders } from '../hooks/use-trade-orders';
import type { GoldTradeOrder } from '../model/types';

function sideLabel(side: GoldTradeOrder['side']) {
  return side === 'BUY' ? 'خرید' : 'فروش';
}

function statusBadge(order: GoldTradeOrder) {
  if (order.status === 'FILLED') {
    return <Badge className="bg-emerald-500/15 text-emerald-700 dark:text-emerald-300">انجام‌شده</Badge>;
  }
  if (order.status === 'FAILED') {
    return <Badge className="bg-rose-500/15 text-rose-700 dark:text-rose-300">ناموفق</Badge>;
  }
  return <Badge>در انتظار</Badge>;
}

interface TradeHistoryTableProps {
  embedded?: boolean;
}

export function TradeHistoryTable({ embedded = false }: TradeHistoryTableProps) {
  const { data, isLoading, isError, refetch } = useTradeOrders();

  if (isLoading) {
    const skeleton = (
      <>
        {!embedded ? <Skeleton className="mb-4 h-6 w-40" /> : null}
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="mb-2 h-14 w-full" />
        ))}
      </>
    );
    return embedded ? <div className="p-6">{skeleton}</div> : <Card className="p-6">{skeleton}</Card>;
  }

  if (isError) {
    const error = (
      <>
        <p className="text-sm text-rose-600 dark:text-rose-300">بارگذاری تاریخچه ناموفق بود</p>
        <button
          type="button"
          className="mt-2 text-sm text-amber-600 underline dark:text-amber-400"
          onClick={() => refetch()}
        >
          تلاش مجدد
        </button>
      </>
    );
    return embedded ? <div className="p-6">{error}</div> : <Card className="p-6">{error}</Card>;
  }

  const items = data?.items ?? [];

  const table = (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[640px] text-sm">
        <thead className="bg-stone-50 text-xs text-stone-500 dark:bg-zinc-900/80 dark:text-zinc-400">
          <tr>
            <th className="px-4 py-3 text-right font-medium">شماره</th>
            <th className="px-4 py-3 text-right font-medium">نوع</th>
            <th className="px-4 py-3 text-right font-medium">مقدار</th>
            <th className="px-4 py-3 text-right font-medium">مبلغ</th>
            <th className="px-4 py-3 text-right font-medium">وضعیت</th>
            <th className="px-4 py-3 text-right font-medium">زمان</th>
          </tr>
        </thead>
        <tbody>
          {items.length === 0 ? (
            <tr>
              <td colSpan={6} className="px-4 py-10 text-center text-stone-500">
                هنوز معامله‌ای ثبت نشده است
              </td>
            </tr>
          ) : (
            items.map((order) => (
              <tr
                key={order.id}
                className="border-t border-stone-100 dark:border-zinc-800"
              >
                <td className="px-4 py-3 font-mono text-xs">{order.orderNumber}</td>
                <td className="px-4 py-3">
                  <span
                    className={
                      order.side === 'BUY'
                        ? 'text-emerald-600 dark:text-emerald-400'
                        : 'text-rose-600 dark:text-rose-400'
                    }
                  >
                    {sideLabel(order.side)}
                  </span>
                </td>
                <td className="px-4 py-3">{order.quantityGram} گرم</td>
                <td className="px-4 py-3">{formatPrice(Number(order.netRial))} تومان</td>
                <td className="px-4 py-3">{statusBadge(order)}</td>
                <td className="px-4 py-3 text-xs text-stone-500">
                  {formatPersianDateTime(order.createdAt)}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );

  if (embedded) {
    return (
      <div>
        <p className="border-b border-stone-100 px-6 py-2 text-xs text-stone-500 dark:border-zinc-800 dark:text-zinc-400">
          {data?.total ?? 0} سفارش
        </p>
        {table}
      </div>
    );
  }

  return (
    <Card className="overflow-hidden p-0">
      <div className="border-b border-stone-100 px-6 py-4 dark:border-zinc-800">
        <h2 className="font-bold text-stone-950 dark:text-zinc-50">تاریخچه معاملات</h2>
        <p className="mt-1 text-xs text-stone-500 dark:text-zinc-400">
          {data?.total ?? 0} سفارش ثبت‌شده
        </p>
      </div>
      {table}
    </Card>
  );
}
