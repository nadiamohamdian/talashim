import { axiosClient } from '@/shared/api/axios-client';
import { mapApiAuthSession, type ApiAuthSessionDto } from '@talashim/shared/auth/map-session';
import { isStaffRoleSlug } from '@talashim/shared/admin-rbac';
import type { AuthSession } from '@talashim/types';
import type { PasswordLoginValues } from '@talashim/shared/validation/auth';

export async function adminLogin(payload: PasswordLoginValues): Promise<AuthSession> {
  const { data } = await axiosClient.post<ApiAuthSessionDto>('/auth/login', {
    identifier: payload.email,
    password: payload.password,
  });
  const session = mapApiAuthSession(data);
  if (!isStaffRoleSlug(session.user.role)) {
    throw new Error(
      'این حساب دسترسی پنل مدیریت ندارد. از admin@talashim.local / Admin12345! استفاده کنید.',
    );
  }
  return session;
}
