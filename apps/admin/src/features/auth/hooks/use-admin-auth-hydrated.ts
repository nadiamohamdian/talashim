'use client';

import { useSyncExternalStore } from 'react';
import { useAdminAuthStore } from '../model/admin-auth-store';

function subscribe(onStoreChange: () => void) {
  const persistApi = useAdminAuthStore.persist;
  const unsubscribe = persistApi.onFinishHydration(onStoreChange);

  if (persistApi.hasHydrated()) {
    onStoreChange();
  }

  return unsubscribe;
}

function getHydratedSnapshot() {
  return useAdminAuthStore.persist.hasHydrated();
}

function getServerHydratedSnapshot() {
  return false;
}

/**
 * True only after Zustand persist has read client storage.
 * Keeps SSR and the first client paint aligned (avoids hydration mismatch).
 */
export function useAdminAuthHydrated(): boolean {
  return useSyncExternalStore(subscribe, getHydratedSnapshot, getServerHydratedSnapshot);
}
