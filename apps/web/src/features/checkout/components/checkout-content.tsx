'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useMemo, useRef, useState } from 'react';
import { Button, Skeleton } from '@sadafgold/ui';
import {
  CHECKOUT_PAYMENT_LABELS,
  DEFAULT_CARD_TO_CARD_INFO,
  calculateInsuranceFeeToman,
  calculateShippingFeeToman,
  SHIPPING_INSURANCE_PERCENT,
  type CheckoutPaymentProvider,
} from '@sadafgold/shared';
import { getEnabledPaymentProviders } from '@/shared/model/storefront-settings';
import { useStorefrontSettings } from '@/shared/providers/storefront-settings-provider';
import { formatPrice } from '@/shared/lib/format-price';
import { getApiErrorMessage } from '@/lib/api';
import { useAddresses } from '@/features/account/hooks/use-addresses';
import { useCheckoutMutation, useCart, useUploadPaymentReceiptMutation } from '@/lib/api';
import { CheckoutSuccessDialog } from '@/features/checkout/components/checkout-success-dialog';

export function CheckoutContent() {
  const { commerce } = useStorefrontSettings();
  const paymentProviders = getEnabledPaymentProviders(commerce);
  const router = useRouter();
  const { data: cart, isLoading: cartLoading, isError: cartError, refetch } = useCart();
  const { data: addresses, isLoading: addressesLoading } = useAddresses();
  const checkoutMutation = useCheckoutMutation();
  const uploadReceiptMutation = useUploadPaymentReceiptMutation();
  const receiptInputRef = useRef<HTMLInputElement>(null);

  const [addressId, setAddressId] = useState('');
  const [isInsured, setIsInsured] = useState(false);
  const [paymentProvider, setPaymentProvider] = useState<CheckoutPaymentProvider>(
    paymentProviders[0] ?? 'card_to_card',
  );
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [receiptPreview, setReceiptPreview] = useState<string | null>(null);
  const [successOrder, setSuccessOrder] = useState<{ orderNumber: string; message: string } | null>(
    null,
  );

  const selectedAddressId = useMemo(() => {
    if (addressId) {
      return addressId;
    }
    return addresses?.[0]?.id ?? '';
  }, [addressId, addresses]);

  if (cartLoading || addressesLoading) {
    return <Skeleton className="h-64 w-full rounded-2xl" />;
  }

  if (cartError) {
    return (
      <div className="card-luxury p-6 text-sm text-rose-600">
        بارگذاری سبد خرید ناموفق بود.{' '}
        <button type="button" className="underline" onClick={() => refetch()}>
          تلاش مجدد
        </button>
      </div>
    );
  }

  if (!cart?.id || !cart.items.length) {
    return (
      <div className="card-luxury p-6 text-sm text-muted">
        سبد خرید خالی است.{' '}
        <Link href="/products" className="text-amber-700 underline">
          بازگشت به فروشگاه
        </Link>
      </div>
    );
  }

  const taxToman = Math.round(cart.subtotalToman * (commerce.defaultTaxPercent / 100));
  const shippingToman = calculateShippingFeeToman(
    cart.subtotalToman,
    commerce.freeShippingMinToman,
  );
  const insuranceFeeToman = calculateInsuranceFeeToman(
    cart.subtotalToman,
    isInsured,
    SHIPPING_INSURANCE_PERCENT,
  );
  const totalToman = cart.subtotalToman + taxToman + shippingToman + insuranceFeeToman;

  const belowMinOrder = cart.subtotalToman < commerce.minOrderToman;
  const needsReceipt = paymentProvider === 'card_to_card';
  const hasReceipt = Boolean(receiptFile);
  const hasAddress = Boolean(selectedAddressId);
  const error =
    checkoutMutation.error &&
    getApiErrorMessage(checkoutMutation.error, 'ثبت سفارش ناموفق بود');

  const submitBlockers = (() => {
    const blockers: string[] = [];
    if (!hasAddress) {
      blockers.push('ابتدا یک آدرس تحویل اضافه یا انتخاب کنید.');
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
    hasAddress &&
    (!needsReceipt || hasReceipt) &&
    !checkoutMutation.isPending &&
    !uploadReceiptMutation.isPending &&
    !belowMinOrder;

  const handleReceiptSelect = (file: File | undefined) => {
    if (!file) {
      return;
    }
    setReceiptFile(file);
    setReceiptPreview(URL.createObjectURL(file));
  };

  const submitOrder = () => {
    checkoutMutation.mutate(
      {
        cartId: cart.id!,
        paymentProvider,
        shippingAddressId: selectedAddressId,
        isInsured,
      },
      {
        onSuccess: (order) => {
          const pendingPayment = order.payments.find(
            (payment) =>
              payment.status === 'awaiting_receipt' || payment.status === 'pending',
          );

          if (paymentProvider === 'card_to_card' && receiptFile && pendingPayment) {
            uploadReceiptMutation.mutate(
              { orderId: order.id, paymentId: pendingPayment.id, file: receiptFile },
              {
                onSuccess: () => {
                  setSuccessOrder({
                    orderNumber: order.orderNumber,
                    message: 'سفارش ثبت شد و فیش واریز برای بررسی ارسال شد.',
                  });
                },
                onError: () => {
                  setSuccessOrder({
                    orderNumber: order.orderNumber,
                    message:
                      'سفارش ثبت شد اما بارگذاری فیش ناموفق بود. لطفاً از جزئیات سفارش دوباره تلاش کنید.',
                  });
                },
              },
            );
            return;
          }

          setSuccessOrder({
            orderNumber: order.orderNumber,
            message:
              paymentProvider === 'card_to_card'
                ? 'سفارش ثبت شد. لطفاً فیش واریز را در جزئیات سفارش بارگذاری کنید.'
                : 'سفارش شما ثبت شد.',
          });
        },
      },
    );
  };

  return (
    <>
      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <div className="space-y-6">
          <section
            className={`card-luxury space-y-4 p-6 ${
              !hasAddress ? 'ring-2 ring-amber-200' : ''
            }`}
          >
            <div className="flex items-center justify-between gap-3">
              <h2 className="font-semibold text-foreground">آدرس تحویل</h2>
              <Link href="/addresses?returnTo=/checkout" className="text-xs font-semibold text-amber-700 hover:underline">
                مدیریت آدرس‌ها
              </Link>
            </div>
            {!addresses?.length ? (
              <div className="rounded-2xl border border-dashed border-nude-300 bg-nude-50/60 p-4 text-sm text-muted">
                برای ثبت سفارش ابتدا یک آدرس اضافه کنید.{' '}
                <Link href="/addresses?returnTo=/checkout" className="font-semibold text-amber-700 underline">
                  افزودن آدرس
                </Link>
              </div>
            ) : (
              <div className="space-y-2">
                {addresses.map((address) => (
                  <label
                    key={address.id}
                    className={`flex cursor-pointer gap-3 rounded-2xl border p-4 transition ${
                      selectedAddressId === address.id
                        ? 'border-amber-400 bg-amber-50/60 ring-2 ring-amber-200'
                        : 'border-nude-200 hover:border-amber-200'
                    }`}
                  >
                    <input
                      type="radio"
                      name="shippingAddress"
                      className="mt-1"
                      checked={selectedAddressId === address.id}
                      onChange={() => setAddressId(address.id)}
                    />
                    <div className="text-sm">
                      <p className="font-semibold text-foreground">{address.title}</p>
                      <p className="mt-1 text-muted">
                        {address.recipient} — {address.phone}
                      </p>
                      <p className="mt-1">{address.line1}</p>
                      <p className="text-muted">
                        {address.city}، {address.state} — {address.postalCode}
                      </p>
                    </div>
                  </label>
                ))}
              </div>
            )}
          </section>

          <section className="card-luxury space-y-3 p-6">
            <h2 className="font-semibold text-foreground">بیمه و ارسال</h2>
            <label className="flex cursor-pointer items-start gap-3 rounded-2xl border border-nude-200 p-4 transition hover:border-amber-200">
              <input
                type="checkbox"
                className="mt-1"
                checked={isInsured}
                onChange={(event) => setIsInsured(event.target.checked)}
              />
              <div className="text-sm">
                <p className="font-semibold text-foreground">بیمه مرسوله</p>
                <p className="mt-1 text-xs leading-6 text-muted">
                  پوشش بیمه‌ای مرسوله با نرخ {formatPlainPercent(SHIPPING_INSURANCE_PERCENT)}٪ از
                  مبلغ سفارش
                </p>
              </div>
            </label>
          </section>

          <section className="card-luxury space-y-3 p-6">
            <h2 className="font-semibold text-foreground">روش پرداخت</h2>
            {paymentProviders.map((provider) => {
              const meta = CHECKOUT_PAYMENT_LABELS[provider];
              return (
                <label
                  key={provider}
                  className={`flex cursor-pointer gap-3 rounded-2xl border p-4 transition ${
                    paymentProvider === provider
                      ? 'border-amber-400 bg-amber-50/60 ring-2 ring-amber-200'
                      : 'border-nude-200 hover:border-amber-200'
                  }`}
                >
                  <input
                    type="radio"
                    name="paymentProvider"
                    className="mt-1"
                    checked={paymentProvider === provider}
                    onChange={() => setPaymentProvider(provider)}
                  />
                  <div>
                    <p className="text-sm font-semibold text-foreground">{meta.title}</p>
                    <p className="mt-1 text-xs leading-6 text-muted">{meta.description}</p>
                  </div>
                </label>
              );
            })}
            {paymentProvider === 'card_to_card' ? (
              <>
                <div className="rounded-2xl border border-nude-200 bg-nude-50/70 p-4 text-xs leading-7 text-stone-700">
                  <p>
                    <span className="font-semibold">بانک:</span> {DEFAULT_CARD_TO_CARD_INFO.bankName}
                  </p>
                  <p>
                    <span className="font-semibold">به نام:</span>{' '}
                    {DEFAULT_CARD_TO_CARD_INFO.accountHolder}
                  </p>
                  <p className="font-mono">
                    <span className="font-sans font-semibold">کارت:</span>{' '}
                    {DEFAULT_CARD_TO_CARD_INFO.cardNumber}
                  </p>
                  <p className="font-mono">
                    <span className="font-sans font-semibold">شبا:</span>{' '}
                    {DEFAULT_CARD_TO_CARD_INFO.iban}
                  </p>
                </div>
                <div
                  className={`rounded-2xl border bg-white p-4 ${
                    needsReceipt && !hasReceipt
                      ? 'border-amber-300 ring-2 ring-amber-100'
                      : 'border-nude-200'
                  }`}
                >
                  <h3 className="text-sm font-semibold text-foreground">بارگذاری فیش کارت‌به‌کارت</h3>
                  <p className="mt-1 text-xs leading-6 text-muted">
                    پس از واریز، تصویر فیش را همین‌جا بارگذاری کنید تا همراه ثبت سفارش برای بررسی ارسال شود.
                  </p>
                  <input
                    ref={receiptInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(event) => {
                      handleReceiptSelect(event.target.files?.[0]);
                      event.target.value = '';
                    }}
                  />
                  <div className="mt-3 flex flex-wrap items-center gap-3">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      disabled={checkoutMutation.isPending || uploadReceiptMutation.isPending}
                      onClick={() => receiptInputRef.current?.click()}
                    >
                      {receiptFile ? 'تغییر تصویر فیش' : 'انتخاب تصویر فیش'}
                    </Button>
                    {receiptFile ? (
                      <span className="text-xs text-muted">{receiptFile.name}</span>
                    ) : null}
                  </div>
                  {receiptPreview ? (
                    <img
                      src={receiptPreview}
                      alt="پیش‌نمایش فیش"
                      className="mt-3 max-h-48 rounded-xl border border-nude-200 object-contain"
                    />
                  ) : null}
                  {needsReceipt && !hasReceipt ? (
                    <p className="mt-3 text-xs text-amber-800">
                      بارگذاری فیش برای فعال شدن دکمه «ثبت سفارش» الزامی است.
                    </p>
                  ) : null}
                </div>
              </>
            ) : null}
          </section>
        </div>

        <aside className="card-luxury h-fit space-y-4 p-6">
          <h2 className="font-semibold text-foreground">خلاصه سفارش</h2>
          <div className="space-y-2 text-sm">
            {cart.items.map((item) => (
              <div key={item.id} className="flex justify-between gap-3">
                <span className="text-muted">
                  {item.title} × {item.quantity}
                </span>
                <span className="font-medium">
                  {formatPrice(item.unitPriceToman * item.quantity)} تومان
                </span>
              </div>
            ))}
          </div>
          <div className="space-y-2 border-t border-nude-200 pt-4 text-sm">
            <div className="flex justify-between">
              <span className="text-muted">جمع محصولات</span>
              <span>{formatPrice(cart.subtotalToman)} تومان</span>
            </div>
            <div className="flex justify-between text-muted">
              <span>ارسال</span>
              <span>
                {shippingToman === 0 ? 'رایگان' : `${formatPrice(shippingToman)} تومان`}
              </span>
            </div>
            <div className="flex justify-between text-muted">
              <span>بیمه مرسوله</span>
              <span>
                {insuranceFeeToman > 0
                  ? `${formatPrice(insuranceFeeToman)} تومان`
                  : '—'}
              </span>
            </div>
            <div className="flex justify-between text-muted">
              <span>مالیات ({commerce.defaultTaxPercent}٪)</span>
              <span>{formatPrice(taxToman)} تومان</span>
            </div>
            {belowMinOrder ? (
              <p className="text-xs text-rose-600">
                حداقل مبلغ سفارش {formatPrice(commerce.minOrderToman)} {commerce.currencyLabel} است.
              </p>
            ) : null}
            <div className="flex justify-between border-t border-nude-200 pt-3 text-base font-bold text-gold-dark">
              <span>مبلغ نهایی</span>
              <span>{formatPrice(totalToman)} تومان</span>
            </div>
          </div>
          <Button
            className="w-full"
            disabled={!canSubmit}
            onClick={submitOrder}
          >
            {checkoutMutation.isPending || uploadReceiptMutation.isPending
              ? 'در حال ثبت...'
              : 'ثبت سفارش'}
          </Button>
          {!canSubmit && submitBlockers.length > 0 ? (
            <ul className="space-y-1 text-xs leading-6 text-amber-800">
              {submitBlockers.map((blocker) => (
                <li key={blocker}>• {blocker}</li>
              ))}
            </ul>
          ) : null}
          {error ? <p className="text-sm text-rose-600">{error}</p> : null}
        </aside>
      </div>

      {successOrder ? (
        <CheckoutSuccessDialog
          orderNumber={successOrder.orderNumber}
          message={successOrder.message}
          onClose={() => router.push('/orders')}
        />
      ) : null}
    </>
  );
}

function formatPlainPercent(value: number): string {
  return value.toLocaleString('fa-IR', { maximumFractionDigits: 2 });
}
