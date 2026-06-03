'use client';

import { useSyncExternalStore } from 'react';
import { useAuthStore } from '@/features/auth/model/auth-store';

function subscribe(onStoreChange: () => void) {
  const persistApi = useAuthStore.persist;

  if (persistApi.hasHydrated()) {
    return () => {};
  }

  return persistApi.onFinishHydration(onStoreChange);
}

function getHydratedSnapshot() {
  return useAuthStore.persist.hasHydrated();
}

function getServerHydratedSnapshot() {
  return false;
}

/**
 * True only after Zustand persist has read client storage.
 * Avoids treating the user as logged out before rehydration completes.
 */
export function useAuthHydrated(): boolean {
  return useSyncExternalStore(subscribe, getHydratedSnapshot, getServerHydratedSnapshot);
}
