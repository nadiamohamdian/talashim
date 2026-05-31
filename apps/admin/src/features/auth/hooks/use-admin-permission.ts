'use client';

import type { AdminPermissionKey } from '@/shared/config/admin-permissions';
import { useAdminAuthStore } from '../model/admin-auth-store';

export function useAdminPermission(required: AdminPermissionKey): boolean {
  return useAdminAuthStore((s) => s.hasPermission(required));
}

export function useAdminPermissions(): AdminPermissionKey[] {
  return useAdminAuthStore((s) => s.permissions);
}
