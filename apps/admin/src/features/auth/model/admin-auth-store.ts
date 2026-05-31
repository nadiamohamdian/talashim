'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
  ADMIN_ACCESS_TOKEN_COOKIE,
  clearAccessTokenCookie,
  setAccessTokenCookie,
} from '@sadafgold/shared/constants/auth';
import type { AuthSession } from '@sadafgold/types';
interface AdminAuthState {
  user: AuthSession['user'] | null;
  accessToken: string | null;
  setSession: (session: AuthSession) => void;
  clearSession: () => void;
  isAdmin: () => boolean;
}

export const useAdminAuthStore = create<AdminAuthState>()(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      setSession: (session) => {
        const role = session.user.role.toLowerCase();
        if (role !== 'admin') {
          throw new Error('دسترسی ادمین مجاز نیست');
        }
        set({ user: session.user, accessToken: session.tokens.accessToken });
        setAccessTokenCookie(ADMIN_ACCESS_TOKEN_COOKIE, session.tokens.accessToken);
      },
      clearSession: () => {
        clearAccessTokenCookie(ADMIN_ACCESS_TOKEN_COOKIE);
        set({ user: null, accessToken: null });
      },
      isAdmin: () =>
        get().user?.role.toLowerCase() === 'admin' && Boolean(get().accessToken),
    }),
    {
      name: 'sadafgold-admin-auth',
      partialize: (state) => ({ user: state.user, accessToken: state.accessToken }),
    },
  ),
);
