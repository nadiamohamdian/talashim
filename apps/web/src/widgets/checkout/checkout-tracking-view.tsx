'use client';

import Link from 'next/link';
import { useMemo } from 'react';
import {
  ORDER_TRACKING_STEPS,
  getCompletedTrackingIndex,
  type OrderTrackingStage,
} from '@/shared/config/checkout-flow';
import { formatPrice } from '@/shared/lib/format-price';
import { toPersianDigits } from '@/shared/lib/to-persian-digits';
import { useOrder, useOrders } from '@/lib/api';

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

function formatOrderDate(iso: string): string {
  try {
    const date = new Date(iso);
    return new Intl.DateTimeFormat('fa-IR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  } catch {
    return iso;
  }
}

export function CheckoutTrackingView({ orderNumber }: CheckoutTrackingViewProps) {
  const decodedOrderNumber = decodeURIComponent(orderNumber);
  const { data, isLoading, isError } = useOrders({ limit: 50 });

  const order = useMemo(
    () => data?.items.find((item) => item.orderNumber === decodedOrderNumber),
    [data?.items, decodedOrderNumber],
  );

  const { data: orderDetail, isLoading: detailLoading } = useOrder(order?.id ?? '');

  const activeStage = mapOrderStatusToTrackingStage(order?.status ?? 'pending');
  const completedIndex = getCompletedTrackingIndex(activeStage);

  const timelineSteps = ORDER_TRACKING_STEPS.map((step, index) => ({
    ...step,
    completed: index <= completedIndex,
    completedAt:
      index <= 1 && step.completedAt
        ? step.completedAt
        : index === 0 && order?.createdAt
          ? formatOrderDate(order.createdAt)
          : undefined,
  }));

  if (isLoading || (order && detailLoading)) {
    return (
      <div className="checkout-page store-minimal-header">
        <div className="checkout-page-inner">
          <p className="checkout-empty">در حال بارگذاری...</p>
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

  const totalToman = orderDetail?.totalToman ?? order.totalToman;

  return (
    <div className="checkout-page store-minimal-header">
      <div className="checkout-page-inner checkout-page-inner--tracking">
        <h1 className="checkout-section-title checkout-tracking-title">اطلاعات سفارش</h1>

        <div className="checkout-tracking-summary">
          <div className="checkout-tracking-summary-row">
            <span className="checkout-tracking-summary-label">شماره سفارش:</span>
            <span className="checkout-tracking-summary-value">
              #{toPersianDigits(order.orderNumber)}
            </span>
          </div>
          <div className="checkout-tracking-summary-row">
            <span className="checkout-tracking-summary-label">تاریخ ثبت سفارش:</span>
            <span className="checkout-tracking-summary-value">
              {formatOrderDate(order.createdAt)}
            </span>
          </div>
          <div className="checkout-tracking-summary-row">
            <span className="checkout-tracking-summary-label">مبلغ کل:</span>
            <span className="checkout-tracking-summary-value">
              {formatPrice(totalToman)} تومان
            </span>
          </div>
        </div>

        <div className="checkout-timeline" aria-label="وضعیت سفارش">
          <div className="checkout-timeline-rail" aria-hidden />
          {timelineSteps.map((step, index) => (
            <div
              key={step.id}
              className={`checkout-timeline-step checkout-timeline-step--${step.side}${
                step.completed ? ' checkout-timeline-step--completed' : ''
              }`}
            >
              <span
                className={`checkout-timeline-dot${
                  step.completed ? ' checkout-timeline-dot--completed' : ''
                }`}
                aria-hidden
              >
                {step.completed ? (
                  <svg viewBox="0 0 12 12" fill="none" aria-hidden>
                    <path
                      d="M2.5 6l2.5 2.5 5-5"
                      stroke="#ffffff"
                      strokeWidth="1.2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                ) : null}
              </span>
              {index < timelineSteps.length - 1 ? (
                <span
                  className={`checkout-timeline-connector${
                    index < completedIndex ? ' checkout-timeline-connector--completed' : ''
                  }`}
                  aria-hidden
                />
              ) : null}
              <div className="checkout-timeline-content">
                <p className="checkout-timeline-label">{step.label}</p>
                {step.completedAt ? (
                  <p className="checkout-timeline-date">
                    <svg
                      className="checkout-timeline-clock"
                      viewBox="0 0 14 14"
                      fill="none"
                      aria-hidden
                    >
                      <circle cx="7" cy="7" r="6" stroke="currentColor" strokeWidth="0.8" />
                      <path
                        d="M7 4v3.5l2.5 1.5"
                        stroke="currentColor"
                        strokeWidth="0.8"
                        strokeLinecap="round"
                      />
                    </svg>
                    {step.completedAt}
                  </p>
                ) : null}
              </div>
            </div>
          ))}
        </div>

        <Link href="/orders" className="checkout-empty-link checkout-tracking-back">
          مشاهده همه سفارش‌ها
        </Link>
      </div>
    </div>
  );
}
