'use client';

import { StoreImage } from '@/shared/ui/store-image';
import Link from 'next/link';
import { useCartStore } from '@/features/cart/model/cart-store';
import { useDisplayCart } from '@/features/cart/hooks/use-display-cart';
import { useRemoveCartItemMutation } from '@/lib/api';
import { formatPrice } from '@/shared/lib/format-price';
import { buildLoginHref } from '@/shared/routing/safe-redirect';
import { syncAuthCookieFromStore } from '@/features/auth/model/auth-store';
import { IconMinus, IconPlus, IconTrash } from '@/shared/ui/icons';
import { Skeleton } from '@sadafgold/ui';

export function CartPageContent() {
  const updateQuantity = useCartStore((s) => s.updateQuantity);
  const removeLocalItem = useCartStore((s) => s.removeItem);
  const clearCart = useCartStore((s) => s.clearCart);
  const removeServerItem = useRemoveCartItemMutation();

  const { items, total, useServer, isLoading, isAuthenticated } = useDisplayCart();

  if (isLoading) {
    return <Skeleton className="h-64 w-full rounded-2xl" />;
  }

  if (items.length === 0) {
    return (
      <div className="card-luxury p-12 text-center">
        <p className="text-muted">سبد خرید شما خالی است.</p>
        <Link href="/products" className="btn-gold mt-5 inline-flex">
          بازگشت به فروشگاه
        </Link>
      </div>
    );
  }

  const handleRemove = (productId: string) => {
    if (useServer) {
      removeServerItem.mutate(productId);
    } else {
      removeLocalItem(productId);
    }
  };

  const handleQuantity = (productId: string, quantity: number) => {
    if (useServer) {
      return;
    }
    updateQuantity(productId, quantity);
  };

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_340px]">
      <div className="card-luxury overflow-hidden">
        <table className="w-full text-sm">
          <thead className="border-b border-nude-200 bg-nude-50/80 text-muted">
            <tr>
              <th className="px-4 py-3 text-right font-medium">محصول</th>
              <th className="px-4 py-3 text-right font-medium">قیمت</th>
              <th className="px-4 py-3 text-right font-medium">تعداد</th>
              <th className="px-4 py-3 text-right font-medium">جمع</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.id} className="border-b border-nude-100 last:border-0">
                <td className="px-4 py-4">
                  <div className="flex items-center gap-3">
                    <div className="relative h-16 w-16 overflow-hidden rounded-lg bg-nude-100">
                      {item.imageUrl ? (
                        <StoreImage
                          src={item.imageUrl}
                          alt={item.title}
                          fill
                          className="object-cover"
                          sizes="64px"
                        />
                      ) : null}
                    </div>
                    <div>
                      <Link
                        href={`/products/${item.slug}`}
                        className="font-semibold text-foreground hover:text-gold-dark"
                      >
                        {item.title}
                      </Link>
                      {item.weightGram ? (
                        <p className="mt-1 text-xs text-muted">وزن: {item.weightGram} گرم</p>
                      ) : null}
                    </div>
                  </div>
                </td>
                <td className="px-4 py-4 font-medium text-gold-dark">
                  {formatPrice(item.priceToman)} تومان
                </td>
                <td className="px-4 py-4">
                  {useServer ? (
                    <span>{item.quantity}</span>
                  ) : (
                    <div className="inline-flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleQuantity(item.id, item.quantity - 1)}
                        className="rounded-lg border border-nude-200 p-1"
                      >
                        <IconMinus className="h-3.5 w-3.5" />
                      </button>
                      <span>{item.quantity}</span>
                      <button
                        type="button"
                        onClick={() => handleQuantity(item.id, item.quantity + 1)}
                        className="rounded-lg border border-nude-200 p-1"
                      >
                        <IconPlus className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  )}
                </td>
                <td className="px-4 py-4 font-bold text-foreground">
                  {formatPrice(item.priceToman * item.quantity)} تومان
                </td>
                <td className="px-4 py-4">
                  <button
                    type="button"
                    onClick={() => handleRemove(item.id)}
                    className="text-rose-600 hover:text-rose-700"
                    aria-label="حذف"
                  >
                    <IconTrash className="h-4 w-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <aside className="card-luxury h-fit p-6">
        <h2 className="section-heading text-lg">خلاصه سفارش</h2>
        <div className="mt-5 flex items-center justify-between border-b border-nude-200 pb-4">
          <span className="text-muted">جمع کل</span>
          <span className="text-xl font-bold text-gold-dark">
            {formatPrice(total)} تومان
          </span>
        </div>
        <Link
          href={isAuthenticated ? '/checkout' : buildLoginHref('/checkout')}
          onClick={() => {
            if (isAuthenticated) {
              syncAuthCookieFromStore();
            }
          }}
          className="btn-gold mt-5 block w-full py-3 text-center"
        >
          {isAuthenticated ? 'ادامه تسویه حساب' : 'ورود برای تسویه'}
        </Link>
        {!useServer ? (
          <button
            type="button"
            onClick={clearCart}
            className="mt-3 w-full text-sm text-muted hover:text-rose-600"
          >
            خالی کردن سبد
          </button>
        ) : null}
      </aside>
    </div>
  );
}
