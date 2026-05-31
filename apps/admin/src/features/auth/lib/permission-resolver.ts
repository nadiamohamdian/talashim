import { ALL_ADMIN_PERMISSIONS, type AdminPermissionKey } from '@/shared/config/admin-permissions';

/** Until RBAC API exists: platform admins receive full permission set. */
export function resolvePermissionsForRole(role: string | undefined): AdminPermissionKey[] {
  if (role?.toLowerCase() === 'admin') {
    return [...ALL_ADMIN_PERMISSIONS];
  }
  return [];
}

export function hasPermission(
  permissions: readonly AdminPermissionKey[],
  required: AdminPermissionKey,
): boolean {
  return permissions.includes(required);
}
