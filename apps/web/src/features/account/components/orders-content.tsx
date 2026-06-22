'use client';

import { formatPersianDate } from '@/shared/lib/persian-date';
import Link from 'next/link';
import {
  Badge,
  Button,
  Skeleton,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@sadafgold/ui';
import { formatPrice } from '@/shared/lib/format-price';
import { useOrders } from '@/lib/api';
import { useState } from 'react';
import { isOrderInvoiceReady } from '../lib/order-invoice';
import { InvoiceAccessLink } from './invoice-access-link';
import { OrdersMobileContent } from './orders-mobile-content';
import {
  ORDER_STATUS_LABELS,
  getDisplayPaymentStatus,
  getDisplayPaymentStatusLabel,
  orderStatusBadgeClass,
  paymentStatusBadgeClass,
} from '../lib/order-labels';

const ORDERS_LIST_LIMIT = 50;

function OrdersLoadError({
  onRetry,
  isRetrying,
}: {
  onRetry: () => void;
  isRetrying: boolean;
}) {
  return (
    <div className="account-orders-state">
      <div className="card-luxury account-orders-error-card p-6 text-sm text-rose-600">
        بارگذاری سفارش‌ها ناموفق بود.{' '}
        <button
          type="button"
          className="account-orders-error-retry"
          onClick={onRetry}
          disabled={isRetrying}
        >
          {isRetrying ? 'در حال تلاش…' : 'تلاش مجدد'}
        </button>
      </div>
    </div>
  );
}

export function OrdersContent() {
  const [page, setPage] = useState(1);
  const { data, isLoading, isError, isFetching, refetch } = useOrders({
    page,
    limit: ORDERS_LIST_LIMIT,
  });

  if (isLoading) {
    return (
      <>
        <div className="account-orders-desktop">
          <Skeleton className="h-64 w-full rounded-[0.6px]" />
        </div>
        <div className="account-orders-mobile-wrap">
          <OrdersMobileContent items={[]} isLoading />
        </div>
      </>
    );
  }

  if (isError) {
    return (
      <OrdersLoadError onRetry={() => void refetch()} isRetrying={isFetching} />
    );
  }

  if (!data?.items.length) {
    return (
      <div className="account-orders-state">
        <div className="card-luxury p-6 text-sm text-muted">هنوز سفارشی ثبت نشده است.</div>
      </div>
    );
  }

  const totalPages = Math.ceil(data.total / data.limit);

  return (
    <>
      <div className="account-orders-desktop">
        <div className="space-y-4">
          <div className="card-luxury overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>شماره سفارش</TableHead>
                  <TableHead>وضعیت سفارش</TableHead>
                  <TableHead>وضعیت پرداخت</TableHead>
                  <TableHead>اقلام</TableHead>
                  <TableHead>مبلغ</TableHead>
                  <TableHead>تاریخ</TableHead>
                  <TableHead />
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.items.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell className="font-mono text-xs">{order.orderNumber}</TableCell>
                    <TableCell>
                      <Badge className={orderStatusBadgeClass(order.status)}>
                        {ORDER_STATUS_LABELS[order.status] ?? order.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {getDisplayPaymentStatus(order) ? (
                        <Badge className={paymentStatusBadgeClass(getDisplayPaymentStatus(order)!)}>
                          {getDisplayPaymentStatusLabel(order)}
                        </Badge>
                      ) : (
                        <span className="text-xs text-muted">—</span>
                      )}
                    </TableCell>
                    <TableCell>{order.itemCount}</TableCell>
                    <TableCell>{formatPrice(order.totalToman)} تومان</TableCell>
                    <TableCell>{formatPersianDate(order.createdAt)}</TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-1">
                        <Link
                          href={`/orders/${order.id}`}
                          className="text-sm font-medium text-gold-dark hover:underline"
                        >
                          جزئیات
                        </Link>
                        {isOrderInvoiceReady(order) ? (
                          <InvoiceAccessLink
                            order={order}
                            className="text-xs font-semibold text-emerald-700 hover:underline"
                          >
                            فاکتور
                          </InvoiceAccessLink>
                        ) : null}
                      </div>
                    </TableCell>
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
      </div>

      <div className="account-orders-mobile-wrap">
        <OrdersMobileContent items={data.items} />
      </div>
    </>
  );
}
