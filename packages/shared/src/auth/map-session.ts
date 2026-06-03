import { mapStaffRoleToSlug } from '../admin-rbac/roles';
import type { AuthSession, UserProfile } from '@talashim/types';

export interface ApiAuthUserDto {
  id: string;
  email: string;
  fullName: string;
  role: string;
}

export interface ApiAuthSessionDto {
  user: ApiAuthUserDto;
  tokens: { accessToken: string; refreshToken: string };
}

export function mapApiAuthSession(data: ApiAuthSessionDto): AuthSession {
  return {
    user: {
      id: data.user.id,
      email: data.user.email,
      fullName: data.user.fullName,
      role: mapStaffRoleToSlug(data.user.role),
    },
    tokens: data.tokens,
  };
}

export function isAdminPanelRole(role: UserProfile['role']): boolean {
  return role !== 'customer';
}
