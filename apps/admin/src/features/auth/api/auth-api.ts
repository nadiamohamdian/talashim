import { axiosClient } from '@/shared/api/axios-client';
import { isAdminDevLoginEnabled } from '@/shared/config/env';
import { mapApiAuthSession, type ApiAuthSessionDto } from '@sadafgold/shared/auth/map-session';
import type { AuthSession } from '@sadafgold/types';
import type { PasswordLoginValues } from '@sadafgold/shared/validation/auth';
import { createDevAdminSession } from '../lib/dev-admin-session';

export async function adminLogin(payload: PasswordLoginValues): Promise<AuthSession> {
  if (isAdminDevLoginEnabled()) {
    return createDevAdminSession(payload.email);
  }

  const { data } = await axiosClient.post<ApiAuthSessionDto>('/auth/login', payload);
  const session = mapApiAuthSession(data);
  if (session.user.role !== 'admin') {
    throw new Error('دسترسی ادمین مجاز نیست');
  }
  return session;
}
