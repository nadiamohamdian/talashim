'use client';

import { create } from 'zustand';
import type { AuthSession, UserProfile } from '@sadafgold/types';
import { clearAuthCookie, syncAuthCookie } from '@/features/auth/api/auth-api';
import { clearSessionLoginStamp } from '@/features/auth/lib/session-expiry';

interface AuthState {
  user: UserProfile | null;
  accessToken: string | null;
  refreshToken: string | null;
  otpIdentifier: string | null;
  /** True after a fresh login/verify response — until the next full reload. */
  sessionTrusted: boolean;
  setSession: (session: AuthSession) => void;
  setOtpIdentifier: (identifier: string) => void;
  clearOtpIdentifier: () => void;
  clearSession: () => void;
  isAuthenticated: () => boolean;
}

const LEGACY_AUTH_STORAGE_KEY = 'sadafgold-auth';

if (typeof window !== 'undefined') {
  try {
    localStorage.removeItem(LEGACY_AUTH_STORAGE_KEY);
  } catch {
    // Ignore quota / private mode errors.
  }
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  accessToken: null,
  refreshToken: null,
  otpIdentifier: null,
  sessionTrusted: false,
  setSession: (session) => {
    syncAuthCookie(session.tokens.accessToken);
    set({
      user: session.user,
      accessToken: session.tokens.accessToken,
      refreshToken: session.tokens.refreshToken,
      otpIdentifier: null,
      sessionTrusted: true,
    });
  },
  setOtpIdentifier: (identifier) => set({ otpIdentifier: identifier }),
  clearOtpIdentifier: () => set({ otpIdentifier: null }),
  clearSession: () => {
    clearAuthCookie();
    clearSessionLoginStamp();
    set({
      user: null,
      accessToken: null,
      refreshToken: null,
      otpIdentifier: null,
      sessionTrusted: false,
    });
  },
  isAuthenticated: () => Boolean(get().accessToken && get().user),
}));

/** Sync HTTP cookie for middleware — call before navigation when session exists in memory. */
export function syncAuthCookieFromStore(): void {
  const token = useAuthStore.getState().accessToken;
  if (token) {
    syncAuthCookie(token);
  }
}
