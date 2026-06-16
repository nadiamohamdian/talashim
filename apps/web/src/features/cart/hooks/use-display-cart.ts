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
  const { isAuthenticated, hydrated } = useAuth();
  const localItems = useCartStore((s) => s.items);
  const localTotal = localItems.reduce(
    (sum, line) => sum + line.quantity * line.priceToman,
    0,
  );
  const localCount = localItems.reduce((sum, line) => sum + line.quantity, 0);
  const cartQuery = useCart({ enabled: hydrated && isAuthenticated });
  const serverCart = cartQuery.data;
  const hasServerCart =
    isAuthenticated && !cartQuery.isError && serverCart !== undefined;

  const useServer = hasServerCart;

  const items = useServer
    ? mapServerItems(serverCart.items)
    : localItems;

  const total = useServer ? serverCart.subtotalToman : localTotal;
  const count = useServer
    ? serverCart.items.reduce((sum, line) => sum + line.quantity, 0)
    : localCount;

  const isLoading =
    hydrated && isAuthenticated && cartQuery.isLoading && serverCart === undefined;
  const isServerCartUnavailable =
    hydrated &&
    isAuthenticated &&
    !isLoading &&
    (cartQuery.isError || serverCart === undefined);

  return {
    items,
    total,
    count,
    useServer,
    isLoading,
    isServerCartUnavailable,
    isRefetching: cartQuery.isRefetching,
    refetchServerCart: cartQuery.refetch,
    serverCartId: serverCart?.id ?? null,
    isAuthenticated,
  };
}
