'use client';

import axios from 'axios';
import { useEffect, useRef, useState } from 'react';
import { refreshSession } from '@/features/auth/api/auth-api';
import { useAuthStore } from '@/features/auth/model/auth-store';

export type SessionRestoreStatus = 'idle' | 'restoring' | 'done';

export interface SessionRestoreState {
  status: SessionRestoreStatus;
  /** True only after /auth/refresh succeeds in this browser session. */
  verified: boolean;
}

function isSessionRefreshNetworkError(error: unknown): boolean {
  if (axios.isAxiosError(error)) {
    return (
      error.code === 'ERR_NETWORK' ||
      error.code === 'ECONNREFUSED' ||
      error.message.toLowerCase().includes('network error')
    );
  }

  return false;
}

/**
 * Restores session via HttpOnly refresh cookie. Guests stay logged out until refresh succeeds.
 */
export function useRestoreSession(): SessionRestoreState {
  const attemptedRef = useRef(false);
  const [status, setStatus] = useState<SessionRestoreStatus>('idle');
  const [verified, setVerified] = useState(false);

  useEffect(() => {
    if (attemptedRef.current) {
      return;
    }

    attemptedRef.current = true;
    setStatus('restoring');

    void refreshSession()
      .then((session) => {
        useAuthStore.getState().setSession(session);
        setVerified(true);
      })
      .catch((error: unknown) => {
        if (isSessionRefreshNetworkError(error)) {
          setVerified(false);
          return;
        }

        useAuthStore.getState().clearSession();
        setVerified(false);
      })
      .finally(() => {
        setStatus('done');
      });
  }, []);

  return { status, verified };
}
