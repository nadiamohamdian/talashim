'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useRef, useState } from 'react';
import type { Address } from '@sadafgold/types';
import {
  CHECKOUT_PAYMENT_LABELS,
  DEFAULT_CARD_TO_CARD_INFO,
  calculateInsuranceFeeToman,
  calculateShippingFeeToman,
  SHIPPING_INSURANCE_PERCENT,
} from '@sadafgold/shared';
import { useAddresses, useCreateAddressMutation } from '@/features/account/hooks/use-addresses';
import {
  useCheckoutSessionStore,
  type CheckoutShippingForm,
} from '@/features/checkout/model/checkout-session-store';
import { useDisplayCart } from '@/features/cart/hooks/use-display-cart';
import {
  useCheckoutMutation,
  useUploadPaymentReceiptMutation,
  getApiErrorMessage,
} from '@/lib/api';
import { formatPrice } from '@/shared/lib/format-price';
import { toPersianDigits } from '@/shared/lib/to-persian-digits';
import { CHECKOUT_PROVINCES } from '@/shared/config/checkout-flow';
import { getEnabledPaymentProviders } from '@/shared/model/storefront-settings';
import { useStorefrontSettings } from '@/shared/providers/storefront-settings-provider';
import { CheckoutOrderSummary } from '@/widgets/checkout/checkout-order-summary';
import { CheckoutStepper } from '@/widgets/checkout/checkout-stepper';

function normalizePhone(value: string): string {
  return value.replace(/\D/g, '');
}

function validateShippingForm(form: CheckoutShippingForm): string | null {
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

function resolveProvinceLabel(state: string): string {
  return CHECKOUT_PROVINCES.find((p) => p.value === state)?.label ?? state;
}

function findMatchingAddress(
  form: CheckoutShippingForm,
  addresses: Address[] | undefined,
): Address | undefined {
  const phone = normalizePhone(form.phone);
  const postalCode = form.postalCode.replace(/\D/g, '');

  return addresses?.find(
    (address) =>
      address.recipient.trim() === form.recipient.trim() &&
      normalizePhone(address.phone) === phone &&
      address.line1.trim() === form.line1.trim() &&
      address.state === form.state &&
      address.city === form.city &&
      address.postalCode.replace(/\D/g, '') === postalCode,
  );
}

export function CheckoutPaymentView() {
  const router = useRouter();
  const { commerce } = useStorefrontSettings();
  const paymentProviders = getEnabledPaymentProviders(commerce);

  const {
    items,
    total,
    isLoading,
    serverCartId,
    isServerCartUnavailable,
    isRefetching,
    refetchServerCart,
  } = useDisplayCart();
  const { data: addresses } = useAddresses();
  const checkoutMutation = useCheckoutMutation();
  const createAddressMutation = useCreateAddressMutation();
  const uploadReceiptMutation = useUploadPaymentReceiptMutation();
  const receiptInputRef = useRef<HTMLInputElement>(null);

  const {
    form,
    deliverySlotId,
    deliverySlotLabel,
    deliveryFeeToman,
    isInsured,
    discountToman,
    paymentProvider,
    setPaymentProvider,
    setOrder,
  } = useCheckoutSessionStore();

  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [receiptPreview, setReceiptPreview] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const shippingValidationError = useMemo(() => validateShippingForm(form), [form]);

  useEffect(() => {
    if (isLoading) {
      return;
    }
    if (!items.length) {
      router.replace('/cart');
      return;
    }
    if (shippingValidationError || !deliverySlotId) {
      router.replace('/checkout');
    }
  }, [
    deliverySlotId,
    isLoading,
    items.length,
    router,
    shippingValidationError,
  ]);

  useEffect(() => {
    if (!paymentProviders.includes(paymentProvider)) {
      setPaymentProvider(paymentProviders[0] ?? 'card_to_card');
    }
  }, [paymentProvider, paymentProviders, setPaymentProvider]);

  const baseShippingToman = useMemo(
    () => calculateShippingFeeToman(total, commerce.freeShippingMinToman),
    [total, commerce.freeShippingMinToman],
  );

  const shippingToman = baseShippingToman + deliveryFeeToman;
  const taxToman = Math.round(total * (commerce.defaultTaxPercent / 100));
  const insuranceFeeToman = calculateInsuranceFeeToman(
    total,
    isInsured,
    SHIPPING_INSURANCE_PERCENT,
  );
  const grandTotal =
    total - discountToman + taxToman + shippingToman + insuranceFeeToman;

  const needsReceipt = paymentProvider === 'card_to_card';
  const hasReceipt = Boolean(receiptFile);
  const belowMinOrder = total < commerce.minOrderToman;

  const submitBlockers = (() => {
    const blockers: string[] = [];
    if (!serverCartId && isServerCartUnavailable) {
      blockers.push('سبد خرید سرور در دسترس نیست. لطفاً دوباره تلاش کنید.');
    }
    if (needsReceipt && !hasReceipt) {
      blockers.push('برای پرداخت کارت‌به‌کارت، تصویر فیش را بارگذاری کنید.');
    }
    if (belowMinOrder) {
      blockers.push(
        `حداقل مبلغ سفارش ${formatPrice(commerce.minOrderToman)} ${commerce.currencyLabel} است.`,
      );
    }
    return blockers;
  })();

  const canSubmit =
    Boolean(serverCartId) &&
    (!needsReceipt || hasReceipt) &&
    !checkoutMutation.isPending &&
    !createAddressMutation.isPending &&
    !uploadReceiptMutation.isPending &&
    !belowMinOrder;

  const handleRetryServerCart = async () => {
    await refetchServerCart();
  };

  const handleReceiptSelect = (file: File | undefined) => {
    if (!file) {
      return;
    }
    setReceiptFile(file);
    setReceiptPreview(URL.createObjectURL(file));
  };

  const resolveShippingAddressId = async (): Promise<string> => {
    const existing = findMatchingAddress(form, addresses);
    if (existing) {
      return existing.id;
    }

    const created = await createAddressMutation.mutateAsync({
      title: 'آدرس تحویل',
      recipient: form.recipient.trim(),
      phone: normalizePhone(form.phone),
      line1: form.line1.trim(),
      state: form.state,
      city: form.city,
      postalCode: form.postalCode.replace(/\D/g, ''),
    });

    return created.id;
  };

  const handleSubmit = async () => {
    setSubmitError(null);

    if (!serverCartId || !canSubmit) {
      return;
    }

    try {
      const shippingAddressId = await resolveShippingAddressId();

      const order = await checkoutMutation.mutateAsync({
        cartId: serverCartId,
        paymentProvider,
        shippingAddressId,
        isInsured,
      });

      setOrder({ orderId: order.id, orderNumber: order.orderNumber });

      const pendingPayment = order.payments.find(
        (payment) =>
          payment.status === 'awaiting_receipt' || payment.status === 'pending',
      );

      if (paymentProvider === 'card_to_card' && receiptFile && pendingPayment) {
        await uploadReceiptMutation.mutateAsync({
          orderId: order.id,
          paymentId: pendingPayment.id,
          file: receiptFile,
        });
      }

      router.push(`/checkout/confirmation?orderId=${encodeURIComponent(order.id)}`);
    } catch (error) {
      setSubmitError(getApiErrorMessage(error, 'ثبت سفارش ناموفق بود.'));
    }
  };

  if (
    (isLoading && items.length === 0) ||
    shippingValidationError ||
    !deliverySlotId
  ) {
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

  if (!items.length) {
    return null;
  }

  const mutationError =
    checkoutMutation.error || createAddressMutation.error || uploadReceiptMutation.error
      ? getApiErrorMessage(
          checkoutMutation.error ??
            createAddressMutation.error ??
            uploadReceiptMutation.error,
          'ثبت سفارش ناموفق بود.',
        )
      : null;

  return (
    <div className="checkout-page store-minimal-header checkout-page--has-cta">
      <div className="checkout-page-inner">
        <CheckoutStepper activeStep={2} />

        <section className="checkout-section">
          <h2 className="checkout-section-title">روش پرداخت</h2>
          <div className="checkout-payment-methods" role="radiogroup" aria-label="روش پرداخت">
            {paymentProviders.map((provider) => {
              const meta = CHECKOUT_PAYMENT_LABELS[provider];
              const selected = paymentProvider === provider;

              return (
                <label
                  key={provider}
                  className={`checkout-payment-option${
                    selected ? ' checkout-payment-option--selected' : ''
                  }`}
                >
                  <input
                    type="radio"
                    name="paymentProvider"
                    className="checkout-payment-option-input"
                    checked={selected}
                    onChange={() => setPaymentProvider(provider)}
                  />
                  <span className="checkout-payment-option-body">
                    <span className="checkout-payment-option-title">{meta.title}</span>
                    <span className="checkout-payment-option-desc">{meta.description}</span>
                  </span>
                </label>
              );
            })}
          </div>

          {paymentProvider === 'card_to_card' ? (
            <>
              <div className="checkout-card-info">
                <p>
                  <span>بانک:</span> {DEFAULT_CARD_TO_CARD_INFO.bankName}
                </p>
                <p>
                  <span>به نام:</span> {DEFAULT_CARD_TO_CARD_INFO.accountHolder}
                </p>
                <p>
                  <span>کارت:</span> {DEFAULT_CARD_TO_CARD_INFO.cardNumber}
                </p>
                <p>
                  <span>شبا:</span> {DEFAULT_CARD_TO_CARD_INFO.iban}
                </p>
              </div>

              <div className="checkout-receipt-upload">
                <p className="checkout-receipt-title">بارگذاری فیش کارت‌به‌کارت</p>
                <p className="checkout-receipt-desc">
                  پس از واریز، تصویر فیش را بارگذاری کنید تا همراه ثبت سفارش برای بررسی ارسال شود.
                </p>
                <input
                  ref={receiptInputRef}
                  type="file"
                  accept="image/*"
                  className="checkout-receipt-input"
                  onChange={(event) => {
                    handleReceiptSelect(event.target.files?.[0]);
                    event.target.value = '';
                  }}
                />
                <button
                  type="button"
                  className="checkout-receipt-btn"
                  disabled={
                    checkoutMutation.isPending ||
                    uploadReceiptMutation.isPending ||
                    createAddressMutation.isPending
                  }
                  onClick={() => receiptInputRef.current?.click()}
                >
                  {receiptFile ? 'تغییر تصویر فیش' : 'انتخاب تصویر فیش'}
                </button>
                {receiptFile ? (
                  <p className="checkout-receipt-filename">{receiptFile.name}</p>
                ) : null}
                {receiptPreview ? (
                  <img
                    src={receiptPreview}
                    alt="پیش‌نمایش فیش"
                    className="checkout-receipt-preview"
                  />
                ) : null}
              </div>
            </>
          ) : null}
        </section>

        <section className="checkout-shipping-card checkout-shipping-card--compact">
          <h2 className="checkout-section-title">اطلاعات ارسال</h2>
          <dl className="checkout-shipping-details">
            <div className="checkout-shipping-row">
              <dt>نام گیرنده:</dt>
              <dd>{form.recipient}</dd>
            </div>
            <div className="checkout-shipping-row">
              <dt>تلفن همراه:</dt>
              <dd>{toPersianDigits(form.phone)}</dd>
            </div>
            <div className="checkout-shipping-row">
              <dt>آدرس گیرنده:</dt>
              <dd>{form.line1}</dd>
            </div>
            <div className="checkout-shipping-row">
              <dt>استان - شهر:</dt>
              <dd>
                {resolveProvinceLabel(form.state)} - {form.city}
              </dd>
            </div>
            <div className="checkout-shipping-row">
              <dt>زمان ارسال:</dt>
              <dd>{deliverySlotLabel}</dd>
            </div>
            <div className="checkout-shipping-row">
              <dt>بیمه مرسوله:</dt>
              <dd>{isInsured ? 'دارد' : 'ندارد'}</dd>
            </div>
          </dl>
          <Link href="/checkout" className="checkout-payment-edit">
            ویرایش اطلاعات ارسال
          </Link>
        </section>

        <CheckoutOrderSummary
          subtotalToman={total}
          discountToman={discountToman}
          taxToman={taxToman}
          shippingToman={shippingToman + insuranceFeeToman}
        />

        <p className="checkout-total-note">
          مبلغ قابل پرداخت: {formatPrice(grandTotal)} تومان
        </p>

        {!canSubmit && submitBlockers.length > 0 ? (
          <>
            <ul className="checkout-blockers">
              {submitBlockers.map((blocker) => (
                <li key={blocker}>{blocker}</li>
              ))}
            </ul>
            {isServerCartUnavailable ? (
              <button
                type="button"
                className="checkout-blockers-action"
                onClick={() => void handleRetryServerCart()}
                disabled={isRefetching}
              >
                {isRefetching ? 'در حال تلاش مجدد...' : 'تلاش مجدد'}
              </button>
            ) : null}
          </>
        ) : null}

        {submitError || mutationError ? (
          <p className="checkout-error">{submitError ?? mutationError}</p>
        ) : null}
      </div>

      <div className="checkout-page-actions">
        <button
          type="button"
          className="checkout-page-action checkout-page-action-primary"
          disabled={!canSubmit}
          onClick={() => void handleSubmit()}
        >
          {checkoutMutation.isPending ||
          uploadReceiptMutation.isPending ||
          createAddressMutation.isPending
            ? 'در حال ثبت...'
            : 'ثبت سفارش'}
        </button>
      </div>
    </div>
  );
}
