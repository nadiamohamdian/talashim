import { createApiClient, getApiErrorMessage } from '@talashim/api-client';
import { adminEnv } from '@/shared/config/env';
import { useAdminAuthStore } from '@/features/auth/model/admin-auth-store';

export const axiosClient = createApiClient({
  baseURL: adminEnv.NEXT_PUBLIC_API_BASE_URL,
  getAccessToken: () => useAdminAuthStore.getState().accessToken,
  onUnauthorized: async () => {
    useAdminAuthStore.getState().clearSession();
    if (typeof window !== 'undefined' && !window.location.pathname.startsWith('/login')) {
      window.location.href = '/login';
    }
    return false;
  },
});

export { getApiErrorMessage };
