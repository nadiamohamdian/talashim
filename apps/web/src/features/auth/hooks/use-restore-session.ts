'use client';

import { useEffect, useRef, useState } from 'react';
import { refreshSession } from '@/features/auth/api/auth-api';
import { hasValidAuthCookie } from '@/features/auth/lib/auth-cookie';
import { useAuthHydrated } from '@/features/auth/hooks/use-auth-hydrated';
import { useAuthStore } from '@/features/auth/model/auth-store';

export type SessionRestoreStatus = 'idle' | 'restoring' | 'done';

/**
 * Restores Zustand session when middleware cookie exists but persist is empty.
 */
export function useRestoreSession(): SessionRestoreStatus {
  const hydrated = useAuthHydrated();
  const attemptedRef = useRef(false);
  const [status, setStatus] = useState<SessionRestoreStatus>('idle');

  useEffect(() => {
    if (!hydrated) {
      return;
    }

    const { user, accessToken } = useAuthStore.getState();
    if (user && accessToken) {
      setStatus('done');
      return;
    }

    if (!hasValidAuthCookie()) {
      setStatus('done');
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
      })
      .catch(() => {
        useAuthStore.getState().clearSession();
      })
      .finally(() => {
        setStatus('done');
      });
  }, [hydrated]);

  return hydrated ? status : 'idle';
}
