import type { AuthSession } from '@sadafgold/types';

/** Mock session for local UI testing — not valid against real API guards. */
export function createDevAdminSession(email: string): AuthSession {
  const normalizedEmail = email.trim() || 'admin@sadafgold.local';
  return {
    user: {
      id: 'dev-admin-user',
      email: normalizedEmail,
      fullName: 'مدیر تست',
      role: 'admin',
    },
    tokens: {
      accessToken: 'dev-admin-access-token',
      refreshToken: 'dev-admin-refresh-token',
    },
  };
}
