'use client';

import { Button, Skeleton } from '@sadafgold/ui';
import { useRouter } from 'next/navigation';
import { formatPrice } from '@/shared/lib/format-price';
import { getApiErrorMessage } from '@/lib/api';
import { WalletBalancesCard } from '@/features/trading/components/wallet-balances-card';
import { WalletTransactionsTable } from '@/features/trading/components/wallet-transactions-table';
import { useOrders, useCheckoutMutation, useCart } from '@/lib/api';

export function CheckoutContent() {
  const router = useRouter();
  const { data: cart, isLoading, isError, refetch } = useCart();
  const checkoutMutation = useCheckoutMutation();

  if (isLoading) {
    return <Skeleton className="h-64 w-full rounded-2xl" />;
  }

  if (isError) {
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
        <a href="/products" className="text-amber-700 underline">
          بازگشت به فروشگاه
        </a>
      </div>
    );
  }

  const taxToman = Math.round(cart.subtotalToman * 0.09);
  const totalToman = cart.subtotalToman + taxToman;
  const error =
    checkoutMutation.error &&
    getApiErrorMessage(checkoutMutation.error, 'ثبت سفارش ناموفق بود');

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <div className="card-luxury space-y-4 p-6">
        <h2 className="font-semibold">خلاصه سفارش</h2>
        {cart.items.map((item) => (
          <div key={item.id} className="flex justify-between text-sm">
            <span>
              {item.title} × {item.quantity}
            </span>
            <span>{formatPrice(item.unitPriceToman * item.quantity)} تومان</span>
          </div>
        ))}
        <div className="border-t pt-4 text-sm">
          <div className="flex justify-between">
            <span>جمع</span>
            <span>{formatPrice(cart.subtotalToman)} تومان</span>
          </div>
          <div className="mt-2 flex justify-between text-muted">
            <span>مالیات (۹٪)</span>
            <span>{formatPrice(taxToman)} تومان</span>
          </div>
          <div className="mt-2 flex justify-between font-bold">
            <span>مبلغ نهایی</span>
            <span>{formatPrice(totalToman)} تومان</span>
          </div>
        </div>
        <Button
          className="w-full"
          disabled={checkoutMutation.isPending}
          onClick={() =>
            checkoutMutation.mutate(
              { cartId: cart.id!, paymentProvider: 'manual' },
              { onSuccess: () => router.push('/orders') },
            )
          }
        >
          {checkoutMutation.isPending ? 'در حال ثبت...' : 'ثبت سفارش'}
        </Button>
        {error ? <p className="text-sm text-red-600">{error}</p> : null}
      </div>
    </div>
  );
}

export function WalletPageContent() {
  return (
    <div className="mx-auto max-w-4xl space-y-8 px-4 py-8">
      <header>
        <h1 className="text-2xl font-bold">کیف پول</h1>
        <p className="mt-2 text-sm text-muted">موجودی ریال و طلا</p>
      </header>
      <WalletBalancesCard />
      <WalletTransactionsTable />
    </div>
  );
}
