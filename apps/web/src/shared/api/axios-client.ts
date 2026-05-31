export {
  apiClient,
  apiClient as axiosClient,
  getApiErrorMessage,
  requestAbortRegistry,
  refreshSession,
  syncAuthCookie,
  clearAuthCookie,
  mapSession,
  AUTH_COOKIE,
  serverFetch,
} from '@/lib/api/client';

/** @deprecated Use `serverFetch` from `@/lib/api` */
export { serverFetch as apiRequest } from '@/lib/api/client';
