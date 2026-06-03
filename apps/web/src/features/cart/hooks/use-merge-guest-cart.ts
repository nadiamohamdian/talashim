'use client';

import { useEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import { useAuthHydrated } from '@/features/auth/hooks/use-auth-hydrated';
import { useAuthStore } from '@/features/auth/model/auth-store';
import { useCartStore } from '@/features/cart/model/cart-store';
import { syncGuestCartToServer } from '@/features/cart/lib/sync-guest-cart';
import { queryKeys } from '@/lib/api/query-keys';
import { isAuthPath } from '@/shared/routing/path-matcher';

/**
 * Merges persisted guest cart lines into the server cart once after login.
 */
export function useMergeGuestCart(): boolean {
  const queryClient = useQueryClient();
  const pathname = usePathname();
  const authHydrated = useAuthHydrated();
  const accessToken = useAuthStore((s) => s.accessToken);
  const user = useAuthStore((s) => s.user);
  const localItems = useCartStore((s) => s.items);
  const clearCart = useCartStore((s) => s.clearCart);
  const removeItem = useCartStore((s) => s.removeItem);
  const [syncing, setSyncing] = useState(false);
  const attemptedRef = useRef(false);

  const isLoggedIn = Boolean(accessToken && user);

  useEffect(() => {
    if (!authHydrated || !isLoggedIn || localItems.length === 0) {
      return;
    }
    if (isAuthPath(pathname)) {
      return;
    }
    if (attemptedRef.current) {
      return;
    }
    attemptedRef.current = true;
    setSyncing(true);

    void syncGuestCartToServer(localItems)
      .then(({ syncedProductIds, removedProductIds }) => {
        for (const productId of removedProductIds) {
          removeItem(productId);
        }
        if (syncedProductIds.length > 0 || removedProductIds.length === localItems.length) {
          const remaining = useCartStore.getState().items;
          if (remaining.length === 0) {
            clearCart();
          }
        }
        return queryClient.invalidateQueries({ queryKey: queryKeys.cart.all });
      })
      .catch(() => {
        // Keep guest lines; user can retry from cart page.
      })
      .finally(() => {
        setSyncing(false);
      });
  }, [
    authHydrated,
    isLoggedIn,
    localItems,
    pathname,
    clearCart,
    removeItem,
    queryClient,
  ]);

  useEffect(() => {
    if (!isLoggedIn) {
      attemptedRef.current = false;
    }
  }, [isLoggedIn]);

  return syncing;
}
