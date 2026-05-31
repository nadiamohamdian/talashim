export {
  authApi,
  login,
  logout,
  requestOtp,
  verifyOtp,
} from '@/lib/api/auth.api';

export {
  refreshSession,
  syncAuthCookie,
  clearAuthCookie,
  mapSession,
  AUTH_COOKIE,
  type ApiAuthSession,
} from '@/lib/api/client';
