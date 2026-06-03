'use client';

import { useCartStore, type CartLineItem } from '@/features/cart/model/cart-store';
import { useAuth } from '@/features/auth/hooks/use-auth';
import { useCart } from '@/lib/api';
function mapServerItems(
  items: Array<{
    productId: string;
    slug: string;
    title: string;
    quantity: number;
    unitPriceToman: number;
    imageUrl: string;
    weightGram: number;
  }>,
): CartLineItem[] {
  return items.map((item) => ({
    id: item.productId,
    slug: item.slug,
    title: item.title,
    quantity: item.quantity,
    priceToman: item.unitPriceToman,
    imageUrl: item.imageUrl,
    weightGram: item.weightGram,
  }));
}

export function useDisplayCart() {
  const { isAuthenticated } = useAuth();
  const localItems = useCartStore((s) => s.items);
  const localTotal = useCartStore((s) => s.total());
  const localCount = useCartStore((s) => s.itemCount());
  const cartQuery = useCart({ enabled: isAuthenticated });
  const serverCart = cartQuery.data;
  const serverHasItems = (serverCart?.items.length ?? 0) > 0;

  const useServer = isAuthenticated && !cartQuery.isError && serverHasItems;

  const items = useServer
    ? mapServerItems(serverCart!.items)
    : localItems;

  const total = useServer ? serverCart!.subtotalToman : localTotal;
  const count = useServer
    ? serverCart!.items.reduce((sum, line) => sum + line.quantity, 0)
    : localCount;

  const isLoading = isAuthenticated && cartQuery.isLoading && localItems.length === 0;

  return {
    items,
    total,
    count,
    useServer,
    isLoading,
    serverCartId: serverCart?.id ?? null,
    isAuthenticated,
  };
}
