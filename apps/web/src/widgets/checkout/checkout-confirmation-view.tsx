'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useMemo } from 'react';
import type { CartLineItem } from '@/features/cart/model/cart-store';
import { useCheckoutSessionStore } from '@/features/checkout/model/checkout-session-store';
import {
  CHECKOUT_DEFAULT_SWATCH_COLORS,
  CHECKOUT_PROVINCES,
} from '@/shared/config/checkout-flow';
import { formatPrice } from '@/shared/lib/format-price';
import { toPersianDigits } from '@/shared/lib/to-persian-digits';
import { useOrder } from '@/lib/api';
import { CheckoutOrderLineItem } from '@/widgets/checkout/checkout-order-line-item';
import { CheckoutOrderSummary } from '@/widgets/checkout/checkout-order-summary';
import { CheckoutStepper } from '@/widgets/checkout/checkout-stepper';

function mapOrderItems(
  items: Array<{
    productId: string;
    productSlug: string;
    productTitle: string;
    quantity: number;
    unitPriceToman: number;
    weightGram?: number;
  }>,
): CartLineItem[] {
  return items.map((item) => ({
    id: item.productId,
    slug: item.productSlug,
    title: item.productTitle,
    quantity: item.quantity,
    priceToman: item.unitPriceToman,
    imageUrl: '',
    weightGram: item.weightGram,
  }));
}

function resolveProvinceLabel(state: string): string {
  return CHECKOUT_PROVINCES.find((p) => p.value === state)?.label ?? state;
}

export function CheckoutConfirmationView() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const orderIdFromQuery = searchParams.get('orderId') ?? '';
  const sessionOrderId = useCheckoutSessionStore((s) => s.orderId);
  const orderId = orderIdFromQuery || sessionOrderId || '';

  const {
    form,
    deliverySlotLabel,
    isInsured,
    discountToman,
    deliveryFeeToman,
    orderNumber: sessionOrderNumber,
    setOrder,
  } = useCheckoutSessionStore();

  const { data: order, isLoading, isError } = useOrder(orderId);

  useEffect(() => {
    if (order && order.id !== sessionOrderId) {
      setOrder({ orderId: order.id, orderNumber: order.orderNumber });
    }
  }, [order, sessionOrderId, setOrder]);

  const lineItems = useMemo(
    () => (order ? mapOrderItems(order.items) : []),
    [order],
  );

  const subtotalToman = order?.subtotalToman ?? 0;
  const taxToman = order?.taxToman ?? 0;
  const shippingToman = deliveryFeeToman + (order?.insuranceFeeToman ?? 0);
  const displayOrderNumber = order?.orderNumber ?? sessionOrderNumber ?? '—';

  const trackHref = order
    ? `/checkout/track/${encodeURIComponent(order.orderNumber)}`
    : sessionOrderNumber
      ? `/checkout/track/${encodeURIComponent(sessionOrderNumber)}`
      : '/orders';

  if (!orderId) {
    return (
      <div className="checkout-page store-minimal-header">
        <div className="checkout-page-inner">
          <p className="checkout-empty">سفارشی یافت نشد.</p>
          <Link href="/products" className="checkout-empty-link">
            بازگشت به فروشگاه
          </Link>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="checkout-page store-minimal-header">
        <div className="checkout-page-inner">
          <div className="checkout-loading-state" role="status" aria-live="polite">
            <span className="checkout-loading-spinner" aria-hidden="true" />
            <p className="checkout-empty checkout-loading-text">در حال بارگذاری سفارش...</p>
          </div>
        </div>
      </div>
    );
  }

  if (isError || !order) {
    return (
      <div className="checkout-page store-minimal-header">
        <div className="checkout-page-inner">
          <p className="checkout-empty">بارگذاری سفارش ناموفق بود.</p>
          <Link href="/orders" className="checkout-empty-link">
            مشاهده سفارش‌ها
          </Link>
        </div>
      </div>
    );
  }

  const shippingAddress = order.shippingAddress;
  const recipientName = shippingAddress?.recipient ?? form.recipient;
  const recipientPhone = shippingAddress?.phone ?? form.phone;
  const recipientLine = shippingAddress?.line1 ?? form.line1;
  const recipientState = shippingAddress?.state ?? form.state;
  const recipientCity = shippingAddress?.city ?? form.city;
  const recipientPostal = shippingAddress?.postalCode ?? form.postalCode;

  return (
    <div className="checkout-page store-minimal-header">
      <div className="checkout-page-inner checkout-page-inner--confirmation">
        <CheckoutStepper activeStep={3} allStepsComplete />

        <div className="checkout-success">
          <span className="checkout-success-icon" aria-hidden>
            <svg viewBox="0 0 72 75" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M20 24h32l-4 36H24L20 24Z"
                stroke="currentColor"
                strokeWidth="1"
                strokeLinejoin="round"
              />
              <path
                d="M28 24V20a8 8 0 0 1 16 0v4"
                stroke="currentColor"
                strokeWidth="1"
                strokeLinecap="round"
              />
              <circle cx="52" cy="54" r="14" fill="#ffffff" />
              <circle cx="52" cy="54" r="13" fill="#CBA670" />
              <path
                d="M45 54l5 5 10-10"
                stroke="#ffffff"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </span>
          <p className="checkout-success-title">سفارش شما با موفقیت ثبت شد</p>
          <p className="checkout-success-order">
            شماره سفارش: #{toPersianDigits(displayOrderNumber)}
          </p>
          <button
            type="button"
            className="checkout-success-track-btn"
            onClick={() => router.push(trackHref)}
          >
            پیگیری سفارش
          </button>
        </div>

        <div className="checkout-confirmation-body">
          <section className="checkout-shipping-card checkout-shipping-card--confirmation">
            <h2 className="checkout-section-title">اطلاعات ارسال</h2>
            <dl className="checkout-shipping-details">
              <div className="checkout-shipping-row">
                <dt>نام گیرنده:</dt>
                <dd>{recipientName}</dd>
              </div>
              <div className="checkout-shipping-row">
                <dt>تلفن همراه:</dt>
                <dd>{toPersianDigits(recipientPhone)}</dd>
              </div>
              <div className="checkout-shipping-row">
                <dt>آدرس گیرنده:</dt>
                <dd>{recipientLine}</dd>
              </div>
              <div className="checkout-shipping-row">
                <dt>استان - شهر:</dt>
                <dd>
                  {resolveProvinceLabel(recipientState)} - {recipientCity}
                </dd>
              </div>
              <div className="checkout-shipping-row">
                <dt>کدپستی:</dt>
                <dd>{toPersianDigits(recipientPostal)}</dd>
              </div>
              <div className="checkout-shipping-row">
                <dt>بیمه مرسوله:</dt>
                <dd>{isInsured || order.isInsured ? 'دارد' : 'ندارد'}</dd>
              </div>
              <div className="checkout-shipping-row">
                <dt>زمان ارسال:</dt>
                <dd>{deliverySlotLabel || '—'}</dd>
              </div>
            </dl>
          </section>

          <div className="checkout-confirmation-order">
            <div className="checkout-order-items-panel">
              <div className="checkout-order-items">
                {lineItems.map((item, index) => (
                  <CheckoutOrderLineItem
                    key={item.id}
                    item={item}
                    readOnly
                    swatchColor={
                      CHECKOUT_DEFAULT_SWATCH_COLORS[index % CHECKOUT_DEFAULT_SWATCH_COLORS.length]
                    }
                  />
                ))}
              </div>
            </div>

            <CheckoutOrderSummary
              subtotalToman={subtotalToman}
              discountToman={discountToman}
              taxToman={taxToman}
              shippingToman={shippingToman}
              className="checkout-summary--compact checkout-summary--confirmation"
              showTitle={false}
            />
          </div>
        </div>

      </div>
    </div>
  );
}
