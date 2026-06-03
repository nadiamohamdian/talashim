import type { AuthSession, StaffRoleSlug } from '@talashim/types';

/** Mock session for local UI testing — not valid against real API guards. */
export function createDevAdminSession(
  email: string,
  role: StaffRoleSlug = 'super_admin',
): AuthSession {
  const normalizedEmail = email.trim() || 'admin@talashim.local';
  return {
    user: {
      id: 'dev-admin-user',
      email: normalizedEmail,
      fullName: 'کاربر تست پنل',
      role,
    },
    tokens: {
      accessToken: 'dev-admin-access-token',
      refreshToken: 'dev-admin-refresh-token',
    },
  };
}
