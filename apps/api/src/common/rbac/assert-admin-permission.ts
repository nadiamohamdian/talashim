import { ForbiddenException } from '@nestjs/common';
import {
  hasAdminPermission,
  type AdminPermissionKey,
} from '@talashim/shared/admin-rbac';
import { getRuntimePermissionsForRole } from './admin-rbac-runtime';

export function assertAdminPermission(
  role: string | undefined,
  required: AdminPermissionKey,
): void {
  const permissions = getRuntimePermissionsForRole(role);
  if (!hasAdminPermission(permissions, required)) {
    throw new ForbiddenException('Insufficient permissions');
  }
}
