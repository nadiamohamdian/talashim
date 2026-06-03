'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { AuthSession, UserProfile } from '@sadafgold/types';
import { clearAuthCookie, syncAuthCookie } from '@/features/auth/api/auth-api';

interface AuthState {
  user: UserProfile | null;
  accessToken: string | null;
  refreshToken: string | null;
  otpIdentifier: string | null;
  setSession: (session: AuthSession) => void;
  setOtpIdentifier: (identifier: string) => void;
  clearOtpIdentifier: () => void;
  clearSession: () => void;
  isAuthenticated: () => boolean;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      otpIdentifier: null,
      setSession: (session) => {
        syncAuthCookie(session.tokens.accessToken);
        set({
          user: session.user,
          accessToken: session.tokens.accessToken,
          refreshToken: session.tokens.refreshToken,
          otpIdentifier: null,
        });
      },
      setOtpIdentifier: (identifier) => set({ otpIdentifier: identifier }),
      clearOtpIdentifier: () => set({ otpIdentifier: null }),
      clearSession: () => {
        clearAuthCookie();
        set({ user: null, accessToken: null, refreshToken: null, otpIdentifier: null });
      },
      isAuthenticated: () => Boolean(get().accessToken && get().user),
    }),
    {
      name: 'sadafgold-auth',
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
      }),
      onRehydrateStorage: () => (state) => {
        if (state?.accessToken) {
          syncAuthCookie(state.accessToken);
        }
      },
    },
  ),
);

/** Sync HTTP cookie for middleware — call after persist rehydration or before navigation. */
export function syncAuthCookieFromStore(): void {
  const token = useAuthStore.getState().accessToken;
  if (token) {
    syncAuthCookie(token);
  }
}
