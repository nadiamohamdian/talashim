'use client';

import { createContext, useContext, type PropsWithChildren } from 'react';
import {
  useRestoreSession,
  type SessionRestoreState,
  type SessionRestoreStatus,
} from '@/features/auth/hooks/use-restore-session';
import { useSessionExpiryWatcher } from '@/features/auth/hooks/use-session-expiry';
import { useMergeGuestCart } from '@/features/cart/hooks/use-merge-guest-cart';

const defaultRestoreState: SessionRestoreState = { status: 'idle', verified: false };

const SessionRestoreContext = createContext<SessionRestoreState>(defaultRestoreState);

export function useSessionRestoreStatus(): SessionRestoreStatus {
  return useContext(SessionRestoreContext).status;
}

export function useSessionVerified(): boolean {
  return useContext(SessionRestoreContext).verified;
}

/** Restores auth from cookie and merges guest cart after login. */
export function SessionBootstrap({ children }: PropsWithChildren) {
  const restoreState = useRestoreSession();
  useSessionExpiryWatcher();
  useMergeGuestCart();

  return (
    <SessionRestoreContext.Provider value={restoreState}>
      {children}
    </SessionRestoreContext.Provider>
  );
}
