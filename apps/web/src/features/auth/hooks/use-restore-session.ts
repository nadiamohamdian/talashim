'use client';

import axios from 'axios';
import { useEffect, useRef, useState } from 'react';
import { refreshSession } from '@/features/auth/api/auth-api';
import { hasValidAuthCookie } from '@/features/auth/lib/auth-cookie';
import { useAuthHydrated } from '@/features/auth/hooks/use-auth-hydrated';
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
 * Restores Zustand session via /auth/refresh when cookie or persist hints exist.
 */
export function useRestoreSession(): SessionRestoreState {
  const hydrated = useAuthHydrated();
  const attemptedRef = useRef(false);
  const [status, setStatus] = useState<SessionRestoreStatus>('idle');
  const [verified, setVerified] = useState(false);

  useEffect(() => {
    if (!hydrated) {
      return;
    }

    const { user, accessToken } = useAuthStore.getState();
    const hasPersistedSession = Boolean(user && accessToken);
    const hasCookie = hasValidAuthCookie();

    if (!hasPersistedSession && !hasCookie) {
      setStatus('done');
      setVerified(false);
      return;
    }

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
          // Keep local session; login page must not redirect until refresh succeeds.
          setVerified(false);
          return;
        }

        useAuthStore.getState().clearSession();
        setVerified(false);
      })
      .finally(() => {
        setStatus('done');
      });
  }, [hydrated]);

  if (!hydrated) {
    return { status: 'idle', verified: false };
  }

  return { status, verified };
}
