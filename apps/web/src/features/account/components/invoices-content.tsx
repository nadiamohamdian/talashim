'use client';

import Link from 'next/link';
import { Badge, Skeleton, Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@sadafgold/ui';
import { formatPrice } from '@/shared/lib/format-price';
import { formatPersianDate } from '@/shared/lib/persian-date';
import { useOrders } from '@/lib/api';
import { isOrderInvoiceReady } from '../lib/order-invoice';
import { InvoiceAccessLink } from './invoice-access-link';
import { ORDER_STATUS_LABELS } from '../lib/order-labels';

export function InvoicesContent() {
  const { data, isLoading, isError } = useOrders({ limit: 50 });
  const invoiceableOrders = data?.items.filter(isOrderInvoiceReady) ?? [];

  if (isLoading) {
    return <Skeleton className="h-64 w-full rounded-2xl" />;
  }

  if (isError) {
    return <p className="text-sm text-rose-600">بارگذاری فاکتورها ناموفق بود.</p>;
  }

  if (!invoiceableOrders.length) {
    return (
      <div className="card-luxury p-6 text-sm text-muted">
        فاکتور تأییدشده‌ای یافت نشد. پس از تأیید پرداخت توسط پشتیبانی، فاکتور رسمی اینجا نمایش داده
        می‌شود.
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
            <TableHead className="text-left">عملیات</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {invoiceableOrders.map((order) => (
            <TableRow key={order.id}>
              <TableCell className="font-mono text-xs">{order.orderNumber}</TableCell>
              <TableCell>
                <Badge className="bg-emerald-50 text-emerald-700">
                  {ORDER_STATUS_LABELS[order.status] ?? order.status}
                </Badge>
              </TableCell>
              <TableCell>{formatPrice(order.totalToman)} تومان</TableCell>
              <TableCell>{formatPersianDate(order.createdAt)}</TableCell>
              <TableCell>
                <InvoiceAccessLink
                  order={order}
                  className="text-sm font-semibold text-gold-dark transition hover:underline"
                >
                  مشاهده و چاپ
                </InvoiceAccessLink>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
