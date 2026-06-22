'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { formatPersianDate } from '@/shared/lib/persian-date';
import { formatPrice } from '@/shared/lib/format-price';
import type { OrderStatus, OrderSummary } from '@sadafgold/types';
import { isOrderInvoiceReady } from '@/features/account/lib/order-invoice';
import { InvoiceAccessLink } from '@/features/account/components/invoice-access-link';

type OrdersTab = 'in_progress' | 'completed' | 'cancelled';

const TAB_LABELS: Record<OrdersTab, string> = {
  in_progress: 'در جریان',
  completed: 'تکمیل شده',
  cancelled: 'لغو شده',
};

interface OrdersMobileContentProps {
  items: OrderSummary[];
  isLoading?: boolean;
}

function resolveTab(status: OrderStatus): OrdersTab {
  if (status === 'cancelled') {
    return 'cancelled';
  }
  if (status === 'paid') {
    return 'completed';
  }
  return 'in_progress';
}

function resolveMobileStatusLabel(status: OrderStatus): string {
  switch (status) {
    case 'pending':
      return 'درحال آماده سازی';
    case 'confirmed':
      return 'تحویل پیک';
    case 'paid':
      return 'تحویل شده';
    case 'cancelled':
      return 'لغو شده';
    default:
      return status;
  }
}

function resolveStatusClass(status: OrderStatus): string {
  if (status === 'paid') {
    return 'account-orders-card-status--completed';
  }
  if (status === 'cancelled') {
    return 'account-orders-card-status--cancelled';
  }
  return 'account-orders-card-status--progress';
}

function OrdersMobileCard({ order }: { order: OrderSummary }) {
  const productLabel =
    order.itemCount > 1 ? `${order.itemCount} کالا در سفارش` : 'محصول سفارش';

  return (
    <article className="account-orders-card">
      <p className={`account-orders-card-status ${resolveStatusClass(order.status)}`}>
        {resolveMobileStatusLabel(order.status)}
      </p>

      <div className="account-orders-card-body">
        <div className="account-orders-card-media" aria-hidden="true" />

        <div className="account-orders-card-copy">
          <p className="account-orders-card-title">{productLabel}</p>
          <p className="account-orders-card-code">کد سفارش: {order.orderNumber}</p>
          <p className="account-orders-card-date">{formatPersianDate(order.createdAt)}</p>

          {isOrderInvoiceReady(order) ? (
            <InvoiceAccessLink order={order} className="account-orders-card-invoice">
              مشاهده فاکتور
            </InvoiceAccessLink>
          ) : null}
        </div>
      </div>
    </article>
  );
}

function OrdersMobileDetail({ order }: { order: OrderSummary }) {
  return (
    <section className="account-orders-detail" aria-label="جزئیات سفارش">
      <h2 className="account-orders-detail-title">جزئیات سفارش</h2>

      <div className="account-orders-detail-panel">
        <dl className="account-orders-detail-rows">
          <div className="account-orders-detail-row">
            <dt>جمع کل:</dt>
            <dd>{formatPrice(order.subtotalToman)} تومان</dd>
          </div>
          <div className="account-orders-detail-row">
            <dt>تخفیف:</dt>
            <dd>{formatPrice(order.discountToman)} تومان</dd>
          </div>
          <div className="account-orders-detail-row">
            <dt>مالیات:</dt>
            <dd>{formatPrice(order.taxToman)} تومان</dd>
          </div>
          <div className="account-orders-detail-row">
            <dt>هزینه ارسال:</dt>
            <dd>{formatPrice(order.insuranceFeeToman)} تومان</dd>
          </div>
        </dl>
      </div>

      <Link href={`/orders/${order.id}`} className="account-orders-track-button">
        پیگیری سفارش
      </Link>
    </section>
  );
}

export function OrdersMobileContent({ items, isLoading = false }: OrdersMobileContentProps) {
  const [activeTab, setActiveTab] = useState<OrdersTab>('in_progress');

  const grouped = useMemo(() => {
    const buckets: Record<OrdersTab, OrderSummary[]> = {
      in_progress: [],
      completed: [],
      cancelled: [],
    };

    for (const order of items) {
      buckets[resolveTab(order.status)].push(order);
    }

    return buckets;
  }, [items]);

  const activeOrders = grouped[activeTab];
  const featuredOrder = activeTab === 'in_progress' ? activeOrders[0] : undefined;

  if (isLoading) {
    return (
      <div className="account-orders-mobile" aria-busy="true">
        <div className="profile-skeleton profile-skeleton--hero" />
        <div className="profile-skeleton profile-skeleton--form" />
      </div>
    );
  }

  return (
    <div className="account-orders-mobile">
      <div className="account-orders-tabs" role="tablist" aria-label="فیلتر وضعیت سفارش">
        {(Object.keys(TAB_LABELS) as OrdersTab[]).map((tab) => {
          const count = grouped[tab].length;
          const isActive = activeTab === tab;

          return (
            <button
              key={tab}
              type="button"
              role="tab"
              aria-selected={isActive}
              className={`account-orders-tab${isActive ? ' is-active' : ''}`}
              onClick={() => setActiveTab(tab)}
            >
              <span className="account-orders-tab-count">{count}</span>
              <span className="account-orders-tab-label">{TAB_LABELS[tab]}</span>
            </button>
          );
        })}
      </div>

      {activeOrders.length === 0 ? (
        <p className="account-orders-empty">سفارشی در این بخش وجود ندارد.</p>
      ) : (
        <div className="account-orders-list">
          {activeOrders.map((order) => (
            <OrdersMobileCard key={order.id} order={order} />
          ))}
        </div>
      )}

      {featuredOrder ? <OrdersMobileDetail order={featuredOrder} /> : null}
    </div>
  );
}
