'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
  ADMIN_ACCESS_TOKEN_COOKIE,
  clearAccessTokenCookie,
  setAccessTokenCookie,
} from '@sadafgold/shared/constants/auth';
import type { AdminPermissionKey } from '@/shared/config/admin-permissions';
import { hasPermission as checkPermission } from '../lib/permission-resolver';
import { resolvePermissionsForRole } from '../lib/permission-resolver';
import type { AuthSession } from '@sadafgold/types';

interface AdminAuthState {
  user: AuthSession['user'] | null;
  accessToken: string | null;
  permissions: AdminPermissionKey[];
  setSession: (session: AuthSession) => void;
  clearSession: () => void;
  isAdmin: () => boolean;
  hasPermission: (key: AdminPermissionKey) => boolean;
}

export const useAdminAuthStore = create<AdminAuthState>()(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      permissions: [],
      setSession: (session) => {
        const role = session.user.role.toLowerCase();
        if (role !== 'admin') {
          throw new Error('دسترسی ادمین مجاز نیست');
        }
        const permissions = resolvePermissionsForRole(session.user.role);
        set({
          user: session.user,
          accessToken: session.tokens.accessToken,
          permissions,
        });
        setAccessTokenCookie(ADMIN_ACCESS_TOKEN_COOKIE, session.tokens.accessToken);
      },
      clearSession: () => {
        clearAccessTokenCookie(ADMIN_ACCESS_TOKEN_COOKIE);
        set({ user: null, accessToken: null, permissions: [] });
      },
      isAdmin: () => get().user?.role.toLowerCase() === 'admin' && Boolean(get().accessToken),
      hasPermission: (key) => checkPermission(get().permissions, key),
    }),
    {
      name: 'sadafgold-admin-auth',
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
        permissions: state.permissions,
      }),
      onRehydrateStorage: () => (state) => {
        if (state?.user) {
          state.permissions = resolvePermissionsForRole(state.user.role);
        }
      },
    },
  ),
);
