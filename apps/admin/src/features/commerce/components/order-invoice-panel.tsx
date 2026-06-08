'use client';

import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { Skeleton } from '@talashim/ui';
import { fetchAdminOrderInvoice } from '../api/commerce-api';
import { isOrderInvoiceReady } from '../lib/order-invoice';
import { AdminOrderInvoice } from './admin-order-invoice';
import { CommercePageShell } from './commerce-page-shell';

interface OrderInvoicePanelProps {
  orderId: string;
}

export function OrderInvoicePanel({ orderId }: OrderInvoicePanelProps) {
  const { data: order, isLoading, isError } = useQuery({
    queryKey: ['admin', 'commerce', 'order', orderId, 'invoice'],
    queryFn: () => fetchAdminOrderInvoice(orderId),
  });

  return (
    <CommercePageShell
      routeId="orders.detail"
      actions={
        <Link
          href={`/orders/${orderId}`}
          className="text-sm text-[var(--muted-foreground)] hover:text-foreground"
        >
          ← بازگشت به جزئیات سفارش
        </Link>
      }
    >
      {isLoading ? (
        <Skeleton className="h-[720px] w-full rounded-[var(--radius-xl)]" />
      ) : isError || !order ? (
        <p className="text-[var(--error)]">بارگذاری فاکتور ناموفق بود.</p>
      ) : !isOrderInvoiceReady(order) ? (
        <div className="card-luxury p-6 text-sm text-[var(--muted-foreground)]">
          فاکتور رسمی پس از تأیید پرداخت سفارش در دسترس خواهد بود.
        </div>
      ) : (
        <div className="mx-auto w-full max-w-6xl space-y-4">
          {!order.invoiceFirstName?.trim() || !order.invoiceLastName?.trim() ? (
            <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950">
              مشتری هنوز نام صادرکننده فاکتور را ثبت نکرده است. نمایش زیر بر اساس اطلاعات پروفایل
              مشتری است.
            </div>
          ) : null}
          <AdminOrderInvoice order={order} />
        </div>
      )}
    </CommercePageShell>
  );
}
