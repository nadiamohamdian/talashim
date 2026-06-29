'use client';

import { useEffect } from 'react';
import { logout } from '@/features/auth/api/auth-api';
import { useAuth } from '@/features/auth/hooks/use-auth';
import {
  clearSessionLoginStamp,
  isSessionExpired,
} from '@/features/auth/lib/session-expiry';
import { useAuthStore } from '@/features/auth/model/auth-store';

const CHECK_INTERVAL_MS = 60_000;

/**
 * Forces logout when the 5-hour storefront session window expires.
 */
export function useSessionExpiryWatcher(): void {
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    if (!isAuthenticated) {
      return;
    }

    const expireSession = () => {
      void logout()
        .catch(() => undefined)
        .finally(() => {
          clearSessionLoginStamp();
          useAuthStore.getState().clearSession();
          window.location.replace('/login?reason=session_expired');
        });
    };

    const checkExpiry = () => {
      if (isSessionExpired()) {
        expireSession();
      }
    };

    checkExpiry();

    const intervalId = window.setInterval(checkExpiry, CHECK_INTERVAL_MS);
    const onVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        checkExpiry();
      }
    };

    document.addEventListener('visibilitychange', onVisibilityChange);

    return () => {
      window.clearInterval(intervalId);
      document.removeEventListener('visibilitychange', onVisibilityChange);
    };
  }, [isAuthenticated]);
}
