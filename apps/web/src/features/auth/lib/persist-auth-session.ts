import type { AuthSession } from '@sadafgold/types';
import { useAuthStore } from '@/features/auth/model/auth-store';

const STORAGE_KEY = 'sadafgold-auth';

/** Writes session to Zustand and localStorage before a full-page navigation. */
export function persistAuthSessionSync(session: AuthSession): void {
  useAuthStore.getState().setSession(session);

  const payload = {
    state: {
      user: session.user,
      accessToken: session.tokens.accessToken,
      refreshToken: session.tokens.refreshToken,
    },
    version: 0,
  };

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  } catch {
    // Private mode / quota — cookie still set by setSession
  }
}
