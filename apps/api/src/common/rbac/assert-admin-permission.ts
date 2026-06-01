import { ForbiddenException } from '@nestjs/common';
import {
  hasAdminPermission,
  resolvePermissionsForRole,
  type AdminPermissionKey,
} from '@sadafgold/shared/admin-rbac';

export function assertAdminPermission(
  role: string | undefined,
  required: AdminPermissionKey,
): void {
  const permissions = resolvePermissionsForRole(role);
  if (!hasAdminPermission(permissions, required)) {
    throw new ForbiddenException('Insufficient permissions');
  }
}
