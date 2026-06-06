import {
  resolvePermissionsForRole,
  type AdminPermissionKey,
} from '@talashim/shared/admin-rbac';

const rolePermissionsCache = new Map<string, AdminPermissionKey[]>();

export function setRolePermissionsCache(
  entries: ReadonlyMap<string, readonly AdminPermissionKey[]>,
): void {
  rolePermissionsCache.clear();
  for (const [roleKey, permissions] of entries) {
    rolePermissionsCache.set(roleKey, [...permissions]);
  }
}

export function getRuntimePermissionsForRole(role: string | undefined): AdminPermissionKey[] {
  const upper = role?.toUpperCase();
  if (upper && rolePermissionsCache.has(upper)) {
    return [...rolePermissionsCache.get(upper)!];
  }

  const lower = role?.toLowerCase();
  if (lower && rolePermissionsCache.has(lower)) {
    return [...rolePermissionsCache.get(lower)!];
  }

  return resolvePermissionsForRole(role);
}
