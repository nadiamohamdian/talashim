'use client';

import { useState } from 'react';
import { cn } from '@sadafgold/ui';
import { useAuth } from '@/features/auth/hooks/use-auth';
import { useCartStore } from '@/features/cart/model/cart-store';
import { useRemoveCartItemMutation, useUpsertCartItemMutation } from '@/lib/api';
import { toPersianDigits } from '@/shared/lib/to-persian-digits';
import { ProductDetailCartIcon } from './product-detail-cart-icon';

interface AddToCartButtonProps {
  productId: string;
  slug: string;
  title: string;
  priceToman: number;
  imageUrl?: string;
  weightGram?: number;
  quantity?: number;
  label?: string;
  addedLabel?: string;
  className?: string;
  disabled?: boolean;
  variant?: 'default' | 'product-detail';
}

export function AddToCartButton({
  productId,
  slug,
  title,
  priceToman,
  imageUrl,
  weightGram,
  quantity = 1,
  label = 'افزودن به سبد',
  addedLabel = 'به سبد اضافه شد',
  className,
  disabled = false,
  variant = 'default',
}: AddToCartButtonProps) {
  const addItem = useCartStore((s) => s.addItem);
  const updateQuantity = useCartStore((s) => s.updateQuantity);
  const removeItem = useCartStore((s) => s.removeItem);
  const cartQuantity = useCartStore(
    (s) => s.items.find((line) => line.id === productId)?.quantity ?? 0,
  );
  const { isAuthenticated } = useAuth();
  const upsertMutation = useUpsertCartItemMutation();
  const removeMutation = useRemoveCartItemMutation();
  const [justAdded, setJustAdded] = useState(false);

  const isProductDetail = variant === 'product-detail';
  const inCart = cartQuantity > 0;
  const showStepper = isProductDetail && inCart;

  const syncQuantity = (nextQuantity: number) => {
    if (nextQuantity < 1) {
      removeItem(productId);
      if (isAuthenticated) {
        removeMutation.mutate(productId);
      }
      return;
    }

    updateQuantity(productId, nextQuantity);

    if (isAuthenticated) {
      upsertMutation.mutate({ productId, quantity: nextQuantity });
    }
  };

  const handleAdd = () => {
    if (disabled || upsertMutation.isPending || justAdded) {
      return;
    }

    addItem({
      id: productId,
      slug,
      title,
      priceToman,
      imageUrl,
      weightGram,
      quantity,
    });

    if (isAuthenticated) {
      upsertMutation.mutate({
        productId,
        quantity: cartQuantity > 0 ? cartQuantity + quantity : quantity,
      });
    }

    if (!isProductDetail) {
      setJustAdded(true);
      window.setTimeout(() => setJustAdded(false), 1800);
    }
  };

  const handleIncrement = () => {
    if (disabled || upsertMutation.isPending) {
      return;
    }
    syncQuantity(cartQuantity + 1);
  };

  const handleDecrement = () => {
    if (disabled || upsertMutation.isPending || removeMutation.isPending) {
      return;
    }
    syncQuantity(cartQuantity - 1);
  };

  if (showStepper) {
    return (
      <div
        className={cn(
          'product-details-action product-details-action-cart product-details-action-cart--stepper',
          className,
        )}
        dir="ltr"
        role="group"
        aria-label={`تعداد ${title} در سبد خرید`}
      >
        <button
          type="button"
          className="product-details-cart-stepper-btn"
          onClick={handleDecrement}
          disabled={disabled || upsertMutation.isPending || removeMutation.isPending}
          aria-label="کاهش تعداد"
        >
          <span className="product-details-cart-stepper-minus" aria-hidden />
        </button>
        <span className="product-details-cart-stepper-qty" aria-live="polite">
          {toPersianDigits(cartQuantity)}
        </span>
        <button
          type="button"
          className="product-details-cart-stepper-btn"
          onClick={handleIncrement}
          disabled={disabled || upsertMutation.isPending}
          aria-label="افزایش تعداد"
        >
          <span className="product-details-cart-stepper-plus" aria-hidden />
        </button>
      </div>
    );
  }

  const buttonLabel = upsertMutation.isPending
    ? 'در حال افزودن...'
    : justAdded
      ? addedLabel
      : label;

  return (
    <button
      type="button"
      onClick={handleAdd}
      disabled={disabled || upsertMutation.isPending}
      aria-live="polite"
      data-added={justAdded ? 'true' : undefined}
      className={cn(
        'inline-flex items-center transition disabled:cursor-not-allowed disabled:opacity-60',
        !isProductDetail && 'justify-center',
        justAdded && 'product-details-action-cart--added',
        className,
      )}
    >
      {isProductDetail ? (
        <>
          <ProductDetailCartIcon />
          <span className="product-details-action-cart-label">{buttonLabel}</span>
        </>
      ) : (
        buttonLabel
      )}
    </button>
  );
}
