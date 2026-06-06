'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
  ADMIN_ACCESS_TOKEN_COOKIE,
  clearAccessTokenCookie,
  setAccessTokenCookie,
} from '@talashim/shared/constants/auth';
import { isStaffRoleSlug, resolvePermissionsForRole } from '@talashim/shared/admin-rbac';
import type { AdminPermissionKey } from '@/shared/config/admin-permissions';
import { hasPermission as checkPermission } from '../lib/permission-resolver';
import type { AuthSession, StaffRoleSlug } from '@talashim/types';

interface AdminAuthState {
  user: AuthSession['user'] | null;
  accessToken: string | null;
  permissions: AdminPermissionKey[];
  setSession: (session: AuthSession) => void;
  setPermissions: (permissions: AdminPermissionKey[]) => void;
  clearSession: () => void;
  isStaffUser: () => boolean;
  /** @deprecated Use isStaffUser — kept for existing callers */
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
        if (!isStaffRoleSlug(session.user.role)) {
          throw new Error('دسترسی به پنل مدیریت مجاز نیست');
        }
        const permissions = resolvePermissionsForRole(session.user.role);
        set({
          user: session.user,
          accessToken: session.tokens.accessToken,
          permissions,
        });
        setAccessTokenCookie(ADMIN_ACCESS_TOKEN_COOKIE, session.tokens.accessToken);
      },
      setPermissions: (permissions) => {
        set({ permissions });
      },
      clearSession: () => {
        clearAccessTokenCookie(ADMIN_ACCESS_TOKEN_COOKIE);
        set({ user: null, accessToken: null, permissions: [] });
      },
      isStaffUser: () =>
        isStaffRoleSlug(get().user?.role) && Boolean(get().accessToken),
      isAdmin: () => get().isStaffUser(),
      hasPermission: (key) => checkPermission(get().permissions, key),
    }),
    {
      name: 'talashim-admin-auth',
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
        permissions: state.permissions,
      }),
      onRehydrateStorage: () => (state) => {
        if (state?.accessToken === 'dev-admin-access-token') {
          state.user = null;
          state.accessToken = null;
          state.permissions = [];
          clearAccessTokenCookie(ADMIN_ACCESS_TOKEN_COOKIE);
          return;
        }
        if (state?.user && isStaffRoleSlug(state.user.role)) {
          state.permissions = resolvePermissionsForRole(state.user.role);
        }
        if (state?.accessToken) {
          setAccessTokenCookie(ADMIN_ACCESS_TOKEN_COOKIE, state.accessToken);
        }
      },
    },
  ),
);

export type { StaffRoleSlug };

/** Sync HTTP cookie for middleware — call before client navigations if needed. */
export function syncAdminAuthCookieFromStore() {
  const token = useAdminAuthStore.getState().accessToken;
  if (token) {
    setAccessTokenCookie(ADMIN_ACCESS_TOKEN_COOKIE, token);
  }
}
