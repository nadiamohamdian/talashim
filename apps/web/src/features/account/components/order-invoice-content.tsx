'use client';

import Link from 'next/link';
import { Skeleton } from '@sadafgold/ui';
import { useOrder } from '@/lib/api';
import { isOrderInvoiceReady } from '../lib/order-invoice';
import { OrderInvoice } from './order-invoice';

interface OrderInvoiceContentProps {
  orderId: string;
}

export function OrderInvoiceContent({ orderId }: OrderInvoiceContentProps) {
  const { data: order, isLoading, isError, refetch } = useOrder(orderId);

  if (isLoading) {
    return <Skeleton className="h-[720px] w-full rounded-2xl" />;
  }

  if (isError || !order) {
    return (
      <div className="card-luxury p-6 text-sm text-rose-600">
        بارگذاری فاکتور ناموفق بود.{' '}
        <button type="button" className="underline" onClick={() => refetch()}>
          تلاش مجدد
        </button>
      </div>
    );
  }

  if (!isOrderInvoiceReady(order)) {
    return (
      <div className="card-luxury space-y-4 p-6 text-sm">
        <p className="text-muted">
          فاکتور رسمی پس از تأیید پرداخت توسط پشتیبانی در دسترس خواهد بود.
        </p>
        <Link
          href={`/orders/${order.id}`}
          className="inline-flex h-10 items-center justify-center rounded-lg border border-nude-200 px-4 text-sm font-medium transition hover:bg-nude-50"
        >
          بازگشت به جزئیات سفارش
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Link
        href={`/orders/${order.id}`}
        className="no-print inline-block text-sm text-muted transition hover:text-gold-dark"
      >
        ← بازگشت به سفارش
      </Link>
      <OrderInvoice order={order} />
    </div>
  );
}
