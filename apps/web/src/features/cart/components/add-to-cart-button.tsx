'use client';

import { useState } from 'react';
import { cn } from '@sadafgold/ui';
import { useAuth } from '@/features/auth/hooks/use-auth';
import { useCartStore } from '@/features/cart/model/cart-store';
import { useUpsertCartItemMutation } from '@/lib/api';

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
}: AddToCartButtonProps) {
  const addItem = useCartStore((s) => s.addItem);
  const { isAuthenticated } = useAuth();
  const upsertMutation = useUpsertCartItemMutation();
  const [justAdded, setJustAdded] = useState(false);

  const handleClick = () => {
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
      upsertMutation.mutate({ productId, quantity });
    }

    setJustAdded(true);
    window.setTimeout(() => setJustAdded(false), 1800);
  };

  const buttonLabel = upsertMutation.isPending
    ? 'در حال افزودن...'
    : justAdded
      ? addedLabel
      : label;

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={disabled || upsertMutation.isPending}
      aria-live="polite"
      data-added={justAdded ? 'true' : undefined}
      className={cn(
        'inline-flex items-center justify-center transition disabled:cursor-not-allowed disabled:opacity-60',
        justAdded && 'product-details-action-cart--added',
        className,
      )}
    >
      {buttonLabel}
    </button>
  );
}
