'use client';

import Link from 'next/link';
import { useMemo } from 'react';
import {
  getCompletedTrackingIndex,
  type OrderTrackingStage,
} from '@/shared/config/checkout-flow';
import { formatPersianDate } from '@/shared/lib/persian-date';
import { toPersianDigits } from '@/shared/lib/to-persian-digits';
import { useOrder, useOrders } from '@/lib/api';
import {
  getOrderTrackingStatusLabel,
  OrderTrackingStepper,
} from '@/widgets/checkout/order-tracking-stepper';

interface CheckoutTrackingViewProps {
  orderNumber: string;
}

function mapOrderStatusToTrackingStage(status: string): OrderTrackingStage {
  switch (status) {
    case 'paid':
      return 'packaging';
    case 'confirmed':
      return 'confirmed';
    case 'pending':
    default:
      return 'placed';
  }
}

export function CheckoutTrackingView({ orderNumber }: CheckoutTrackingViewProps) {
  const decodedOrderNumber = decodeURIComponent(orderNumber);
  const { data, isLoading, isError } = useOrders({ limit: 50 });

  const order = useMemo(
    () => data?.items.find((item) => item.orderNumber === decodedOrderNumber),
    [data?.items, decodedOrderNumber],
  );

  const { isLoading: detailLoading } = useOrder(order?.id ?? '');

  const activeStage = mapOrderStatusToTrackingStage(order?.status ?? 'pending');
  const completedIndex = getCompletedTrackingIndex(activeStage);
  const statusLabel = getOrderTrackingStatusLabel(activeStage);

  if (isLoading || (order && detailLoading)) {
    return (
      <div className="checkout-page store-minimal-header">
        <div className="checkout-page-inner">
          <div className="checkout-loading-state" role="status" aria-live="polite">
            <span className="checkout-loading-spinner" aria-hidden="true" />
            <p className="checkout-empty checkout-loading-text">در حال بارگذاری...</p>
          </div>
        </div>
      </div>
    );
  }

  if (isError || !order) {
    return (
      <div className="checkout-page store-minimal-header">
        <div className="checkout-page-inner">
          <p className="checkout-empty">سفارش یافت نشد.</p>
          <Link href="/orders" className="checkout-empty-link">
            بازگشت به سفارش‌ها
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="checkout-page store-minimal-header">
      <div className="checkout-page-inner checkout-page-inner--tracking">
        <h1 className="order-tracking-title">اطلاعات سفارش</h1>

        <div className="order-tracking-cards">
          <article className="order-tracking-card">
            <p className="order-tracking-card-label">وضعیت</p>
            <p className="order-tracking-card-value">{statusLabel}</p>
          </article>
          <article className="order-tracking-card">
            <p className="order-tracking-card-label">کد پیگیری سفارش</p>
            <p className="order-tracking-card-value order-tracking-card-value--mono">
              {toPersianDigits(order.orderNumber)}
            </p>
          </article>
          <article className="order-tracking-card">
            <p className="order-tracking-card-label">تاریخ</p>
            <p className="order-tracking-card-value">{formatPersianDate(order.createdAt)}</p>
          </article>
        </div>

        <OrderTrackingStepper completedIndex={completedIndex} />

        <Link href="/orders" className="checkout-empty-link checkout-tracking-back">
          مشاهده همه سفارش‌ها
        </Link>
      </div>
    </div>
  );
}
