import { axiosClient } from '@/shared/api/axios-client';
import {
  mapApiAuthSession,
  type ApiAuthSessionDto,
} from '@sadafgold/shared/auth/map-session';
import type { AuthSession } from '@sadafgold/types';
import type { PasswordLoginValues } from '@sadafgold/shared/validation/auth';

export async function adminLogin(payload: PasswordLoginValues): Promise<AuthSession> {
  const { data } = await axiosClient.post<ApiAuthSessionDto>('/auth/login', payload);
  return mapApiAuthSession(data);
}
