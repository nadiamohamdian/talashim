'use client';

import Link from 'next/link';
import type { ProductSummary } from '@sadafgold/types';
import { useAuth } from '@/features/auth/hooks/use-auth';
import { useDisplayCart } from '@/features/cart/hooks/use-display-cart';
import { buildLoginHref } from '@/shared/routing/safe-redirect';
import { useCartStore } from '@/features/cart/model/cart-store';
import { useRemoveCartItemMutation, useUpsertCartItemMutation } from '@/lib/api';
import { CART_GUARANTEE_ITEMS, CART_DEFAULT_SWATCH_COLORS } from '@/shared/config/cart-page';
import { CartLineItemRow } from '@/widgets/cart/cart-line-item';
import { CartSimilarProducts } from '@/widgets/cart/cart-similar-products';

interface CartPageViewProps {
  similarProducts: ProductSummary[];
}

export function CartPageView({ similarProducts }: CartPageViewProps) {
  const { isAuthenticated } = useAuth();
  const { items, isLoading, useServer } = useDisplayCart();
  const removeLocalItem = useCartStore((s) => s.removeItem);
  const updateLocalQuantity = useCartStore((s) => s.updateQuantity);
  const removeServerItem = useRemoveCartItemMutation();
  const upsertServerItem = useUpsertCartItemMutation();

  const handleRemove = (productId: string) => {
    if (useServer) {
      removeServerItem.mutate(productId);
      return;
    }
    removeLocalItem(productId);
  };

  const handleQuantityChange = (productId: string, quantity: number) => {
    if (quantity < 1) {
      handleRemove(productId);
      return;
    }

    if (useServer) {
      upsertServerItem.mutate({ productId, quantity });
      return;
    }
    updateLocalQuantity(productId, quantity);
  };

  const checkoutHref = isAuthenticated ? '/checkout' : buildLoginHref('/checkout');
  const hasItems = items.length > 0;

  return (
    <div className={`cart-page store-minimal-header${hasItems ? ' cart-page--has-items' : ''}`}>
      <div className="cart-page-inner">
        <header className="cart-page-header">
          <h1 className="cart-page-title">سبد خرید شما</h1>
        </header>

        {isLoading ? (
          <p className="cart-page-empty">در حال بارگذاری سبد خرید...</p>
        ) : !hasItems ? (
          <div className="cart-page-empty-state">
            <p className="cart-page-empty">سبد خرید شما خالی است.</p>
            <Link href="/products" className="cart-page-empty-link">
              ادامه خرید
            </Link>
          </div>
        ) : (
          <>
            <div className="cart-page-items">
              {items.map((item, index) => (
                <CartLineItemRow
                  key={item.id}
                  item={item}
                  swatchColor={
                    CART_DEFAULT_SWATCH_COLORS[index % CART_DEFAULT_SWATCH_COLORS.length]
                  }
                  onRemove={handleRemove}
                  onQuantityChange={handleQuantityChange}
                />
              ))}
            </div>

            <section className="cart-guarantee" aria-labelledby="cart-guarantee-title">
              <h2 id="cart-guarantee-title" className="cart-guarantee-title">
                تضمین کیفیت و اصالت
              </h2>
              <ul className="cart-guarantee-list">
                {CART_GUARANTEE_ITEMS.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </section>

            <CartSimilarProducts products={similarProducts} />
          </>
        )}
      </div>

      {hasItems ? (
        <div className="cart-page-actions">
          <div className="cart-page-actions-inner">
            <Link href={checkoutHref} className="cart-page-action cart-page-action-primary">
              تکمیل سفارش
            </Link>
            <Link href="/products" className="cart-page-action cart-page-action-secondary">
              ادامه خرید
            </Link>
          </div>
        </div>
      ) : null}
    </div>
  );
}
