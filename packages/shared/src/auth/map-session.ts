import { mapStaffRoleToSlug } from '../admin-rbac/roles';
import type { UserRoleSlug } from '../admin-rbac/roles';
import { isPlaceholderPhoneEmail } from './placeholder-email';

export interface UserProfile {
  id: string;
  email: string;
  fullName: string;
  role: UserRoleSlug;
  requiresPasswordSetup?: boolean;
  requiresEmailSetup?: boolean;
}

export interface AuthSession {
  user: UserProfile;
  tokens: { accessToken: string; refreshToken: string };
}

export interface ApiAuthUserDto {
  id: string;
  email: string;
  fullName: string;
  role: string;
  requiresPasswordSetup?: boolean;
  requiresEmailSetup?: boolean;
}

export interface ApiAuthSessionDto {
  user: ApiAuthUserDto;
  tokens: { accessToken: string; refreshToken: string };
}

export function mapApiAuthSession(data: ApiAuthSessionDto): AuthSession {
  const email = data.user.email;
  return {
    user: {
      id: data.user.id,
      email,
      fullName: data.user.fullName,
      role: mapStaffRoleToSlug(data.user.role),
      requiresPasswordSetup: data.user.requiresPasswordSetup ?? false,
      requiresEmailSetup:
        data.user.requiresEmailSetup ?? isPlaceholderPhoneEmail(email),
    },
    tokens: data.tokens,
  };
}

export function needsAccountSetup(
  user: Pick<UserProfile, 'requiresPasswordSetup' | 'requiresEmailSetup' | 'email'>,
): boolean {
  return Boolean(
    user.requiresPasswordSetup ||
      user.requiresEmailSetup ||
      isPlaceholderPhoneEmail(user.email),
  );
}

export function isAdminPanelRole(role: UserProfile['role']): boolean {
  return role !== 'customer';
}
