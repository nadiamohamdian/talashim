'use client';

import { Badge, Button, Skeleton, Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@sadafgold/ui';
import { formatPrice } from '@/shared/lib/format-price';
import { useOrders } from '@/lib/api';
import { useState } from 'react';

const STATUS_LABELS: Record<string, string> = {
  pending: 'در انتظار',
  confirmed: 'تأیید شده',
  paid: 'پرداخت شده',
  cancelled: 'لغو شده',
};

export function OrdersContent() {
  const [page, setPage] = useState(1);
  const { data, isLoading, isError, refetch } = useOrders({ page });

  if (isLoading) {
    return <Skeleton className="h-64 w-full rounded-2xl" />;
  }

  if (isError) {
    return (
      <div className="card-luxury p-6 text-sm text-rose-600">
        بارگذاری سفارش‌ها ناموفق بود.{' '}
        <button type="button" className="underline" onClick={() => refetch()}>
          تلاش مجدد
        </button>
      </div>
    );
  }

  if (!data?.items.length) {
    return (
      <div className="card-luxury p-6 text-sm text-muted">هنوز سفارشی ثبت نشده است.</div>
    );
  }

  const totalPages = Math.ceil(data.total / data.limit);

  return (
    <div className="space-y-4">
      <div className="card-luxury overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>شماره سفارش</TableHead>
              <TableHead>وضعیت</TableHead>
              <TableHead>اقلام</TableHead>
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
                <TableCell>{order.itemCount}</TableCell>
                <TableCell>{formatPrice(order.totalToman)} تومان</TableCell>
                <TableCell>{new Date(order.createdAt).toLocaleDateString('fa-IR')}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      {totalPages > 1 ? (
        <div className="flex items-center justify-center gap-2">
          <Button variant="outline" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
            قبلی
          </Button>
          <span className="text-sm text-muted">
            {page} / {totalPages}
          </span>
          <Button
            variant="outline"
            disabled={page >= totalPages}
            onClick={() => setPage((p) => p + 1)}
          >
            بعدی
          </Button>
        </div>
      ) : null}
    </div>
  );
}
