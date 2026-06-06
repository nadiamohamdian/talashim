'use client';

import { formatPersianDate } from '@/shared/lib/persian-date';

import { Badge, Skeleton, Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@sadafgold/ui';
import { formatPrice } from '@/shared/lib/format-price';
import { useOrders } from '@/lib/api';

const STATUS_LABELS: Record<string, string> = {
  pending: 'در انتظار',
  confirmed: 'تأیید شده',
  paid: 'پرداخت شده',
  cancelled: 'لغو شده',
};

export function InvoicesContent() {
  const { data, isLoading, isError } = useOrders({ status: 'PAID' });

  if (isLoading) {
    return <Skeleton className="h-64 w-full rounded-2xl" />;
  }

  if (isError) {
    return <p className="text-sm text-rose-600">بارگذاری فاکتورها ناموفق بود.</p>;
  }

  if (!data?.items.length) {
    return (
      <div className="card-luxury p-6 text-sm text-muted">
        فاکتور پرداخت‌شده‌ای یافت نشد. پس از تکمیل خرید، فاکتورها اینجا نمایش داده می‌شوند.
      </div>
    );
  }

  return (
    <div className="card-luxury overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>شماره سفارش</TableHead>
            <TableHead>وضعیت</TableHead>
            <TableHead>مبلغ</TableHead>
            <TableHead>تاریخ</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.items.map((order) => (
            <TableRow key={order.id}>
              <TableCell className="font-mono text-xs">{order.orderNumber}</TableCell>
              <TableCell>
                <Badge>{STATUS_LABELS[order.status] ?? order.status}</Badge>
              </TableCell>
              <TableCell>{formatPrice(order.totalToman)} تومان</TableCell>
              <TableCell>{formatPersianDate(order.createdAt)}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
