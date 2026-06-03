'use client';

import { useSyncExternalStore } from 'react';
import { useCartStore } from '@/features/cart/model/cart-store';

function subscribe(onStoreChange: () => void) {
  const persistApi = useCartStore.persist;

  if (persistApi.hasHydrated()) {
    return () => {};
  }

  return persistApi.onFinishHydration(onStoreChange);
}

function getHydratedSnapshot() {
  return useCartStore.persist.hasHydrated();
}

function getServerHydratedSnapshot() {
  return false;
}

export function useCartHydrated(): boolean {
  return useSyncExternalStore(subscribe, getHydratedSnapshot, getServerHydratedSnapshot);
}
