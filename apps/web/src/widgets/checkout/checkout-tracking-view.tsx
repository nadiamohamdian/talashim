'use client';

import Link from 'next/link';
import {
  ORDER_TRACKING_STEPS,
  type OrderTrackingStage,
} from '@/shared/config/checkout-flow';
import { formatPersianDate } from '@/shared/lib/persian-date';
import { toPersianDigits } from '@/shared/lib/to-persian-digits';
import { useOrderByNumber } from '@/lib/api';
import {
  getOrderTrackingStatusLabel,
  OrderTrackingStepper,
} from '@/widgets/checkout/order-tracking-stepper';

interface CheckoutTrackingViewProps {
  orderNumber: string;
}

function resolveTrackingProgress(status: string): {
  stage: OrderTrackingStage;
  completedIndex: number;
} {
  switch (status) {
    case 'paid':
      return { stage: 'in_transit', completedIndex: 1 };
    case 'confirmed':
      return { stage: 'confirmed', completedIndex: 1 };
    case 'pending':
    default:
      return { stage: 'placed', completedIndex: 0 };
  }
}

export function CheckoutTrackingView({ orderNumber }: CheckoutTrackingViewProps) {
  const decodedOrderNumber = decodeURIComponent(orderNumber);
  const { data: order, isLoading, isError } = useOrderByNumber(decodedOrderNumber);

  const { stage: activeStage, completedIndex } = resolveTrackingProgress(order?.status ?? 'pending');
  const activeIndex = ORDER_TRACKING_STEPS.findIndex((step) => step.id === activeStage);
  const statusLabel = getOrderTrackingStatusLabel(activeStage);

  if (isLoading) {
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

        <div className="order-tracking-cards" dir="rtl">
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

        <OrderTrackingStepper completedIndex={completedIndex} activeIndex={activeIndex} />

        <Link href="/orders" className="checkout-empty-link checkout-tracking-back">
          مشاهده همه سفارش‌ها
        </Link>
      </div>
    </div>
  );
}
