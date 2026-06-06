'use client';

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
  className,
  disabled = false,
}: AddToCartButtonProps) {
  const addItem = useCartStore((s) => s.addItem);
  const { isAuthenticated } = useAuth();
  const upsertMutation = useUpsertCartItemMutation();

  const handleClick = () => {
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
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={disabled || upsertMutation.isPending}
      className={cn(
        'inline-flex items-center justify-center transition disabled:opacity-60',
        className,
      )}
    >
      {upsertMutation.isPending ? 'در حال افزودن...' : label}
    </button>
  );
}
