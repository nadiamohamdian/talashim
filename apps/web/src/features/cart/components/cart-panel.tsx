'use client';

import { StoreImage } from '@/shared/ui/store-image';
import Link from 'next/link';
import { useEffect } from 'react';
import { useDisplayCart } from '@/features/cart/hooks/use-display-cart';
import { useCartStore } from '@/features/cart/model/cart-store';
import { useRemoveCartItemMutation } from '@/lib/api';
import { formatPrice } from '@/shared/lib/format-price';
import { buildLoginHref } from '@/shared/routing/safe-redirect';
import { IconClose, IconMinus, IconPlus, IconTrash } from '@/shared/ui/icons';

export function CartPanel() {
  const isOpen = useCartStore((s) => s.isOpen);
  const closeCart = useCartStore((s) => s.closeCart);
  const removeLocalItem = useCartStore((s) => s.removeItem);
  const updateQuantity = useCartStore((s) => s.updateQuantity);
  const clearCart = useCartStore((s) => s.clearCart);
  const { items, total, useServer, isAuthenticated } = useDisplayCart();
  const removeServerItem = useRemoveCartItemMutation();

  const handleRemove = (productId: string) => {
    if (useServer) {
      removeServerItem.mutate(productId);
    } else {
      removeLocalItem(productId);
    }
  };

  const handleQuantity = (productId: string, quantity: number) => {
    if (!useServer) {
      updateQuantity(productId, quantity);
    }
  };

  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50">
      <button
        type="button"
        className="absolute inset-0 bg-foreground/30 backdrop-blur-sm"
        aria-label="بستن سبد خرید"
        onClick={closeCart}
      />
      <aside
        className="absolute inset-y-0 left-0 flex w-full max-w-md flex-col border-r border-nude-200 bg-card shadow-[var(--shadow-card)]"
        aria-label="سبد خرید"
      >
        <div className="flex items-center justify-between border-b border-nude-200 bg-nude-50/50 px-5 py-4">
          <h2 className="text-lg font-bold text-foreground">سبد خرید</h2>
          <button
            type="button"
            onClick={closeCart}
            className="rounded-lg p-2 text-muted transition hover:bg-nude-100"
            aria-label="بستن"
          >
            <IconClose className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4">
          {items.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center gap-4 text-center">
              <p className="text-muted">سبد خرید شما خالی است.</p>
              <Link href="/products" onClick={closeCart} className="btn-gold">
                مشاهده فروشگاه
              </Link>
            </div>
          ) : (
            <ul className="space-y-4">
              {items.map((item) => (
                <li
                  key={item.id}
                  className="flex gap-3 rounded-xl border border-nude-100 bg-nude-50/40 p-3"
                >
                  <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-lg bg-nude-100">
                    {item.imageUrl ? (
                      <StoreImage
                        src={item.imageUrl}
                        alt={item.title}
                        fill
                        className="object-cover"
                        sizes="80px"
                      />
                    ) : null}
                  </div>
                  <div className="min-w-0 flex-1">
                    <Link
                      href={`/products/${item.slug}`}
                      onClick={closeCart}
                      className="line-clamp-2 text-sm font-semibold text-foreground hover:text-gold-dark"
                    >
                      {item.title}
                    </Link>
                    {item.weightGram ? (
                      <p className="mt-1 text-xs text-muted">وزن: {item.weightGram} گرم</p>
                    ) : null}
                    <p className="mt-1 text-sm font-bold text-gold-dark">
                      {formatPrice(item.priceToman)} تومان
                    </p>
                    <div className="mt-2 flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleQuantity(item.id, item.quantity - 1)}
                        className="rounded-lg border border-nude-200 bg-card p-1 hover:bg-nude-50"
                        aria-label="کاهش تعداد"
                      >
                        <IconMinus className="h-3.5 w-3.5" />
                      </button>
                      <span className="min-w-6 text-center text-sm">{item.quantity}</span>
                      <button
                        type="button"
                        onClick={() => handleQuantity(item.id, item.quantity + 1)}
                        className="rounded-lg border border-nude-200 bg-card p-1 hover:bg-nude-50"
                        aria-label="افزایش تعداد"
                      >
                        <IconPlus className="h-3.5 w-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleRemove(item.id)}
                        className="mr-auto rounded-lg p-1 text-rose-600 hover:bg-rose-50"
                        aria-label="حذف"
                      >
                        <IconTrash className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {items.length > 0 ? (
          <div className="border-t border-nude-200 bg-nude-50/30 px-5 py-4">
            <div className="mb-4 flex items-center justify-between">
              <span className="text-sm text-muted">جمع کل</span>
              <span className="text-lg font-bold text-gold-dark">
                {formatPrice(total)} تومان
              </span>
            </div>
            <div className="grid gap-2">
              <Link href="/cart" onClick={closeCart} className="btn-nude w-full py-2.5 text-center">
                مشاهده سبد خرید
              </Link>
              <Link
                href={isAuthenticated ? '/checkout' : buildLoginHref('/checkout')}
                onClick={closeCart}
                className="btn-gold w-full py-2.5 text-center"
              >
                {isAuthenticated ? 'تسویه حساب' : 'ورود و تسویه'}
              </Link>
              {!useServer ? (
                <button
                  type="button"
                  onClick={clearCart}
                  className="text-xs text-muted hover:text-rose-600"
                >
                  خالی کردن سبد
                </button>
              ) : null}
            </div>
          </div>
        ) : null}
      </aside>
    </div>
  );
}
