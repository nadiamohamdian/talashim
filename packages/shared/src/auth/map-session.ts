import type { AuthSession, UserProfile } from '@sadafgold/types';

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

function mapRole(role: string): UserProfile['role'] {
  return role.toUpperCase() === 'ADMIN' ? 'admin' : 'customer';
}

export function mapApiAuthSession(data: ApiAuthSessionDto): AuthSession {
  return {
    user: {
      id: data.user.id,
      email: data.user.email,
      fullName: data.user.fullName,
      role: mapRole(data.user.role),
    },
    tokens: data.tokens,
  };
}
