'use client';

import { createContext, useContext, type PropsWithChildren } from 'react';
import {
  useRestoreSession,
  type SessionRestoreStatus,
} from '@/features/auth/hooks/use-restore-session';
import { useMergeGuestCart } from '@/features/cart/hooks/use-merge-guest-cart';

const SessionRestoreContext = createContext<SessionRestoreStatus>('idle');

export function useSessionRestoreStatus(): SessionRestoreStatus {
  return useContext(SessionRestoreContext);
}

/** Restores auth from cookie and merges guest cart after login. */
export function SessionBootstrap({ children }: PropsWithChildren) {
  const restoreStatus = useRestoreSession();
  useMergeGuestCart();

  return (
    <SessionRestoreContext.Provider value={restoreStatus}>
      {children}
    </SessionRestoreContext.Provider>
  );
}
