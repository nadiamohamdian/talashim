import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  OnModuleInit,
} from '@nestjs/common';
import {
  ADMIN_PERMISSIONS,
  ADMIN_ROLE_DEFINITIONS,
  ALL_ADMIN_PERMISSIONS,
  mapStaffRoleToEnum,
  normalizeStaffRoleEnum,
  type AdminPermissionKey,
} from '@talashim/shared/admin-rbac';
import { Role } from '@/generated/prisma';
import type { AuthenticatedUser } from '@/common/interfaces/auth-user.interface';
import { assertAdminPermission } from '@/common/rbac/assert-admin-permission';
import {
  getRuntimePermissionsForRole,
  setRolePermissionsCache,
} from '@/common/rbac/admin-rbac-runtime';
import { AdminRbacRepository } from '../repositories/admin-rbac.repository';
import { AdminRepository } from '../repositories/admin.repository';
import type { UpdateRolePermissionsBatchDto } from '../dto/update-role-permissions.dto';

const STAFF_ROLES: Role[] = [
  Role.SUPER_ADMIN,
  Role.SUPPORT,
  Role.ACCOUNTANT,
  Role.EDITOR,
  Role.WAREHOUSE,
];

@Injectable()
export class AdminRbacService implements OnModuleInit {
  constructor(
    private readonly adminRbacRepository: AdminRbacRepository,
    private readonly adminRepository: AdminRepository,
  ) {}

  async onModuleInit(): Promise<void> {
    await this.seedDefaultsIfEmpty();
    await this.refreshCache();
  }

  async seedDefaultsIfEmpty(): Promise<void> {
    const count = await this.adminRbacRepository.countPermissions();
    if (count > 0) {
      return;
    }

    const rows = ADMIN_ROLE_DEFINITIONS.flatMap((role) =>
      role.permissions.map((permission) => ({
        role: role.enum as Role,
        permission,
      })),
    );

    await this.adminRbacRepository.seedDefaults(rows);
  }

  async refreshCache(): Promise<void> {
    const rows = await this.adminRbacRepository.findAllGroupedByRole();
    const grouped = new Map<string, AdminPermissionKey[]>();

    for (const role of STAFF_ROLES) {
      grouped.set(role, []);
    }

    for (const row of rows) {
      const current = grouped.get(row.role) ?? [];
      current.push(row.permission as AdminPermissionKey);
      grouped.set(row.role, current);
    }

    for (const roleDef of ADMIN_ROLE_DEFINITIONS) {
      const fromDb = grouped.get(roleDef.enum) ?? [];
      const permissions =
        fromDb.length > 0 ? fromDb : [...roleDef.permissions];
      grouped.set(roleDef.enum, permissions);
      grouped.set(roleDef.slug, permissions);
    }

    setRolePermissionsCache(grouped);
  }

  getPermissionRegistry(actor: AuthenticatedUser) {
    assertAdminPermission(actor.role, ADMIN_PERMISSIONS.security.rbac);
    return this.buildRegistry();
  }

  getMyPermissions(actor: AuthenticatedUser): { permissions: AdminPermissionKey[] } {
    const staffEnum = normalizeStaffRoleEnum(actor.role);
    if (!staffEnum) {
      throw new ForbiddenException('Staff role required');
    }

    return {
      permissions: getRuntimePermissionsForRole(staffEnum),
    };
  }

  async updateRolePermissions(
    payload: UpdateRolePermissionsBatchDto,
    actor: AuthenticatedUser,
  ) {
    assertAdminPermission(actor.role, ADMIN_PERMISSIONS.security.rbac);

    const validPermissions = new Set<string>(ALL_ADMIN_PERMISSIONS);

    for (const update of payload.updates) {
      const roleEnum = mapStaffRoleToEnum(update.roleSlug);
      if (!roleEnum) {
        throw new BadRequestException(`Invalid role slug: ${update.roleSlug}`);
      }

      if (roleEnum === 'SUPER_ADMIN' && actor.role !== Role.SUPER_ADMIN) {
        throw new ForbiddenException('Only super admin can modify super admin permissions');
      }

      const uniquePermissions = [...new Set(update.permissions)];
      for (const permission of uniquePermissions) {
        if (!validPermissions.has(permission)) {
          throw new BadRequestException(`Invalid permission: ${permission}`);
        }
      }

      if (
        roleEnum === 'SUPER_ADMIN' &&
        !uniquePermissions.includes(ADMIN_PERMISSIONS.security.rbac)
      ) {
        throw new BadRequestException('Super admin must retain RBAC permission');
      }

      await this.adminRbacRepository.replaceRolePermissions(
        roleEnum as Role,
        uniquePermissions,
      );
    }

    await this.refreshCache();

    await this.adminRepository.createAuditLog('admin.rbac.permissions_updated', actor.id, {
      updates: payload.updates.map((update) => ({
        roleSlug: update.roleSlug,
        permissionCount: update.permissions.length,
      })),
    });

    return this.buildRegistry();
  }

  private buildRegistry() {
    return {
      permissions: [...ALL_ADMIN_PERMISSIONS],
      roles: ADMIN_ROLE_DEFINITIONS.map((role) => ({
        enum: role.enum,
        slug: role.slug,
        labelFa: role.labelFa,
        descriptionFa: role.descriptionFa,
        permissions: getRuntimePermissionsForRole(role.enum),
      })),
      groups: ADMIN_PERMISSIONS,
    };
  }
}
