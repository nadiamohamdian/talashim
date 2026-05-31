'use client';

import { useSyncExternalStore } from 'react';
import { useAdminAuthStore } from '../model/admin-auth-store';

function subscribe(onStoreChange: () => void) {
  const persistApi = useAdminAuthStore.persist;

  if (persistApi.hasHydrated()) {
    return () => {};
  }

  return persistApi.onFinishHydration(onStoreChange);
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
