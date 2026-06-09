'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { useAuth } from '@/features/auth/hooks/use-auth';
import { buildLoginHref } from '@/shared/routing/safe-redirect';
import {
  calculateInsuranceFeeToman,
  calculateShippingFeeToman,
  SHIPPING_INSURANCE_PERCENT,
} from '@sadafgold/shared';
import { useAddresses } from '@/features/account/hooks/use-addresses';
import { useCheckoutSessionStore } from '@/features/checkout/model/checkout-session-store';
import { useDisplayCart } from '@/features/cart/hooks/use-display-cart';
import { useStorefrontSettings } from '@/shared/providers/storefront-settings-provider';
import { formatPrice } from '@/shared/lib/format-price';
import {
  CHECKOUT_CITIES,
  CHECKOUT_DELIVERY_SLOTS,
  CHECKOUT_PROVINCES,
  type DeliverySlot,
} from '@/shared/config/checkout-flow';
import { CheckoutDeliverySlots } from '@/widgets/checkout/checkout-delivery-slots';
import { CheckoutOrderSummary } from '@/widgets/checkout/checkout-order-summary';
import { CheckoutStepper } from '@/widgets/checkout/checkout-stepper';

function normalizePhone(value: string): string {
  return value.replace(/\D/g, '');
}

function validateShippingForm(form: {
  recipient: string;
  phone: string;
  line1: string;
  state: string;
  city: string;
  postalCode: string;
}): string | null {
  if (!form.recipient.trim()) {
    return 'نام و نام خانوادگی گیرنده را وارد کنید.';
  }
  const phone = normalizePhone(form.phone);
  if (!/^09\d{9}$/.test(phone)) {
    return 'شماره همراه معتبر وارد کنید.';
  }
  if (!form.line1.trim()) {
    return 'آدرس پستی را وارد کنید.';
  }
  if (!form.state) {
    return 'استان را انتخاب کنید.';
  }
  if (!form.city) {
    return 'شهر را انتخاب کنید.';
  }
  if (!/^\d{10}$/.test(form.postalCode.replace(/\D/g, ''))) {
    return 'کدپستی ۱۰ رقمی معتبر وارد کنید.';
  }
  return null;
}

export function CheckoutShippingView() {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const { commerce } = useStorefrontSettings();

  const { items, total, isLoading } = useDisplayCart();
  const { data: addresses } = useAddresses();

  const {
    form,
    deliverySlotId,
    isInsured,
    couponCode,
    discountToman,
    setForm,
    setDeliverySlot,
    setIsInsured,
    setCouponCode,
    setDiscountToman,
  } = useCheckoutSessionStore();

  const [couponInput, setCouponInput] = useState(couponCode);
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    if (!deliverySlotId && CHECKOUT_DELIVERY_SLOTS[0]) {
      const slot = CHECKOUT_DELIVERY_SLOTS[0];
      setDeliverySlot({
        id: slot.id,
        label: `${slot.dayNumber} ${slot.monthLabel} (${slot.timeRange})`,
        feeToman: slot.feeToman,
      });
    }
  }, [deliverySlotId, setDeliverySlot]);

  useEffect(() => {
    const saved = addresses?.[0];
    if (!saved || form.recipient) {
      return;
    }
    setForm({
      recipient: saved.recipient,
      phone: saved.phone,
      line1: saved.line1,
      state: saved.state,
      city: saved.city,
      postalCode: saved.postalCode,
    });
  }, [addresses, form.recipient, setForm]);

  const baseShippingToman = useMemo(
    () => calculateShippingFeeToman(total, commerce.freeShippingMinToman),
    [total, commerce.freeShippingMinToman],
  );

  const deliveryFeeToman = useCheckoutSessionStore((s) => s.deliveryFeeToman);
  const shippingToman = baseShippingToman + deliveryFeeToman;
  const taxToman = Math.round(total * (commerce.defaultTaxPercent / 100));
  const insuranceFeeToman = calculateInsuranceFeeToman(
    total,
    isInsured,
    SHIPPING_INSURANCE_PERCENT,
  );
  const grandTotal =
    total - discountToman + taxToman + shippingToman + insuranceFeeToman;

  const cityOptions = form.state ? (CHECKOUT_CITIES[form.state] ?? []) : [];

  const handleSlotSelect = (slot: DeliverySlot) => {
    setDeliverySlot({
      id: slot.id,
      label: `${slot.dayNumber} ${slot.monthLabel} (${slot.timeRange})`,
      feeToman: slot.feeToman,
    });
  };

  const handleApplyCoupon = () => {
    const code = couponInput.trim();
    setCouponCode(code);
    if (code.toUpperCase() === 'SADAF') {
      setDiscountToman(Math.min(1_500_000, total));
      return;
    }
    setDiscountToman(0);
  };

  const handleContinue = () => {
    setFormError(null);

    const validationError = validateShippingForm(form);
    if (validationError) {
      setFormError(validationError);
      return;
    }

    if (!deliverySlotId) {
      setFormError('زمان ارسال را انتخاب کنید.');
      return;
    }

    if (total < commerce.minOrderToman) {
      setFormError(
        `حداقل مبلغ سفارش ${formatPrice(commerce.minOrderToman)} ${commerce.currencyLabel} است.`,
      );
      return;
    }

    if (!isAuthenticated) {
      router.push(buildLoginHref('/checkout/payment'));
      return;
    }

    router.push('/checkout/payment');
  };

  if (isLoading) {
    return (
      <div className="checkout-page store-minimal-header">
        <div className="checkout-page-inner">
          <p className="checkout-empty">در حال بارگذاری...</p>
        </div>
      </div>
    );
  }

  if (!items.length) {
    return (
      <div className="checkout-page store-minimal-header">
        <div className="checkout-page-inner">
          <p className="checkout-empty">سبد خرید خالی است.</p>
          <Link href="/cart" className="checkout-empty-link">
            بازگشت به سبد خرید
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="checkout-page store-minimal-header checkout-page--has-cta">
      <div className="checkout-page-inner">
        <CheckoutStepper activeStep={1} />

        <section className="checkout-section">
          <h2 className="checkout-section-title">اطلاعات گیرنده</h2>
          <div className="checkout-form">
            <label className="checkout-field">
              <span className="checkout-field-label">نام و نام خانوادگی</span>
              <input
                type="text"
                className="checkout-input"
                placeholder="نام و نام خانوادگی گیرنده"
                value={form.recipient}
                onChange={(event) => setForm({ recipient: event.target.value })}
                autoComplete="name"
              />
            </label>

            <label className="checkout-field">
              <span className="checkout-field-label">شماره همراه</span>
              <input
                type="tel"
                className="checkout-input"
                placeholder="تلفن همراه گیرنده"
                value={form.phone}
                onChange={(event) => setForm({ phone: event.target.value })}
                autoComplete="tel"
                inputMode="numeric"
              />
            </label>

            <label className="checkout-field">
              <span className="checkout-field-label">آدرس</span>
              <input
                type="text"
                className="checkout-input"
                placeholder="آدرس پستی"
                value={form.line1}
                onChange={(event) => setForm({ line1: event.target.value })}
                autoComplete="street-address"
              />
            </label>

            <div className="checkout-field-row">
              <label className="checkout-field checkout-field--select">
                <span className="checkout-field-label">استان</span>
                <select
                  className="checkout-input checkout-select"
                  value={form.state}
                  onChange={(event) =>
                    setForm({ state: event.target.value, city: '' })
                  }
                >
                  <option value="">استان</option>
                  {CHECKOUT_PROVINCES.map((province) => (
                    <option key={province.value} value={province.value}>
                      {province.label}
                    </option>
                  ))}
                </select>
              </label>

              <label className="checkout-field checkout-field--select">
                <span className="checkout-field-label">شهر</span>
                <select
                  className="checkout-input checkout-select"
                  value={form.city}
                  disabled={!form.state}
                  onChange={(event) => setForm({ city: event.target.value })}
                >
                  <option value="">شهر</option>
                  {cityOptions.map((city) => (
                    <option key={city.value} value={city.value}>
                      {city.label}
                    </option>
                  ))}
                </select>
              </label>

              <label className="checkout-field checkout-field--postal">
                <span className="checkout-field-label">کدپستی</span>
                <input
                  type="text"
                  className="checkout-input"
                  placeholder="کدپستی"
                  value={form.postalCode}
                  onChange={(event) => setForm({ postalCode: event.target.value })}
                  inputMode="numeric"
                  maxLength={10}
                />
              </label>
            </div>
          </div>
        </section>

        <section className="checkout-section">
          <h2 className="checkout-section-title">انتخاب زمان ارسال</h2>
          <CheckoutDeliverySlots
            selectedId={deliverySlotId}
            onSelect={handleSlotSelect}
          />
        </section>

        <label className="checkout-insurance">
          <input
            type="checkbox"
            className="checkout-insurance-input"
            checked={isInsured}
            onChange={(event) => setIsInsured(event.target.checked)}
          />
          <span className="checkout-insurance-label">
            بیمه مرسوله (+ ۱٪ ارزش سفارش)
          </span>
        </label>

        <div className="checkout-coupon">
          <button
            type="button"
            className="checkout-coupon-apply"
            onClick={handleApplyCoupon}
          >
            اعمال
          </button>
          <input
            type="text"
            className="checkout-coupon-input"
            placeholder="کد تخفیف خود را وارد نمایید"
            value={couponInput}
            onChange={(event) => setCouponInput(event.target.value)}
          />
        </div>

        <CheckoutOrderSummary
          subtotalToman={total}
          discountToman={discountToman}
          taxToman={taxToman}
          shippingToman={shippingToman + insuranceFeeToman}
        />

        {formError ? <p className="checkout-error">{formError}</p> : null}

        <p className="checkout-total-note">
          مبلغ قابل پرداخت: {formatPrice(grandTotal)} تومان
        </p>
      </div>

      <div className="checkout-page-actions">
        <button
          type="button"
          className="checkout-page-action checkout-page-action-primary"
          onClick={handleContinue}
        >
          پرداخت
        </button>
      </div>
    </div>
  );
}
