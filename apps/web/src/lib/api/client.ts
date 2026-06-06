import axios, {
  type AxiosError,
  type AxiosInstance,
  type AxiosRequestConfig,
  type AxiosResponse,
  type InternalAxiosRequestConfig,
} from 'axios';
import { createApiClient, getApiErrorMessage as parseApiError } from '@talashim/api-client';
import {
  mapApiAuthSession,
  type ApiAuthSessionDto,
} from '@talashim/shared/auth/map-session';
import {
  WEB_ACCESS_TOKEN_COOKIE,
  clearAccessTokenCookie,
  setAccessTokenCookie,
} from '@talashim/shared/constants/auth';
import { readAuthCookieToken } from '@/features/auth/lib/auth-cookie';
import { webEnv } from '@/shared/config/env';
import { useAuthStore } from '@/features/auth/model/auth-store';

type RetryConfig = InternalAxiosRequestConfig & { _retry?: boolean };

export type ApiRequestConfig = AxiosRequestConfig & {
  /** Optional logical key — aborts any in-flight request with the same key before sending. */
  abortKey?: string;
};

export class ApiClientError extends Error {
  constructor(
    message: string,
    readonly status?: number,
    readonly code?: string,
  ) {
    super(message);
    this.name = 'ApiClientError';
  }
}

/** Tracks in-flight requests by logical key for deduplication and cancellation. */
class RequestAbortRegistry {
  private readonly controllers = new Map<string, AbortController>();

  attach(config: ApiRequestConfig): AbortSignal | undefined {
    if (!config.abortKey) {
      return (config.signal ?? undefined) as AbortSignal | undefined;
    }

    this.cancel(config.abortKey);
    const controller = new AbortController();
    this.controllers.set(config.abortKey, controller);
    return controller.signal;
  }

  cancel(key: string): void {
    this.controllers.get(key)?.abort();
    this.controllers.delete(key);
  }

  cancelAll(): void {
    for (const controller of this.controllers.values()) {
      controller.abort();
    }
    this.controllers.clear();
  }
}

export const requestAbortRegistry = new RequestAbortRegistry();

let refreshPromise: Promise<string | null> | null = null;

const bareAuthClient = axios.create({
  baseURL: webEnv.NEXT_PUBLIC_API_BASE_URL,
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
});

async function refreshAccessToken(): Promise<string | null> {
  if (!refreshPromise) {
    refreshPromise = bareAuthClient
      .post<ApiAuthSessionDto>('/auth/refresh', {})
      .then(({ data }) => {
        const session = mapApiAuthSession(data);
        useAuthStore.getState().setSession(session);
        return session.tokens.accessToken;
      })
      .catch(() => {
        useAuthStore.getState().clearSession();
        return null;
      })
      .finally(() => {
        refreshPromise = null;
      });
  }

  return refreshPromise;
}

function createConfiguredClient(): AxiosInstance {
  const client = createApiClient({
    baseURL: webEnv.NEXT_PUBLIC_API_BASE_URL,
    getAccessToken: () =>
      useAuthStore.getState().accessToken ?? readAuthCookieToken(),
    onUnauthorized: async () => {
      const token = await refreshAccessToken();
      return Boolean(token);
    },
  });

  client.interceptors.request.use((config: InternalAxiosRequestConfig) => {
    const apiConfig = config as ApiRequestConfig;
    const signal = requestAbortRegistry.attach(apiConfig);
    if (signal) {
      config.signal = signal;
    }
    return config;
  });

  client.interceptors.response.use(
    (response: AxiosResponse) => response,
    (error: AxiosError) => {
      if (axios.isCancel(error)) {
        return Promise.reject(error);
      }

      const status = error.response?.status;
      const message = parseApiError(error, 'درخواست API ناموفق بود');
      return Promise.reject(new ApiClientError(message, status));
    },
  );

  return client;
}

export const apiClient = createConfiguredClient();

export function getApiErrorMessage(error: unknown, fallback = 'خطایی رخ داد'): string {
  if (error instanceof ApiClientError) {
    return error.message;
  }
  return parseApiError(error, fallback);
}

export async function apiGet<T>(url: string, config?: ApiRequestConfig): Promise<T> {
  const { data } = await apiClient.get<T>(url, config);
  return data;
}

export async function apiPost<T>(
  url: string,
  body?: unknown,
  config?: ApiRequestConfig,
): Promise<T> {
  const { data } = await apiClient.post<T>(url, body, config);
  return data;
}

export async function apiPatch<T>(
  url: string,
  body?: unknown,
  config?: ApiRequestConfig,
): Promise<T> {
  const { data } = await apiClient.patch<T>(url, body, config);
  return data;
}

export async function apiPut<T>(
  url: string,
  body?: unknown,
  config?: ApiRequestConfig,
): Promise<T> {
  const { data } = await apiClient.put<T>(url, body, config);
  return data;
}

export async function apiDelete<T>(url: string, config?: ApiRequestConfig): Promise<T> {
  const { data } = await apiClient.delete<T>(url, config);
  return data;
}

/** Server Component / RSC fetch with ISR support. */
export interface ServerFetchOptions extends RequestInit {
  revalidate?: number;
  /** When true, connection errors are rethrown as-is (for dev fallbacks in callers). */
  preserveConnectionError?: boolean;
}

export function isApiConnectionError(error: unknown): boolean {
  const cause = (error as { cause?: { code?: string } })?.cause;
  const code = cause?.code;
  return (
    code === 'ECONNREFUSED' ||
    code === 'ENOTFOUND' ||
    code === 'ECONNRESET' ||
    code === 'EHOSTUNREACH'
  );
}

/** Dev-only: return empty list when API is down so storefront SSR does not crash. */
export function isApiUnreachableError(error: unknown): boolean {
  if (isApiConnectionError(error)) {
    return true;
  }
  if (error instanceof ApiClientError && (error.status === 503 || error.status === 429)) {
    return true;
  }
  return false;
}

function isDevApiFallbackEnabled(): boolean {
  return process.env.NODE_ENV === 'development';
}

export async function serverFetchCatalogList<T extends unknown[]>(
  path: string,
  options: ServerFetchOptions = {},
): Promise<T> {
  try {
    return await serverFetch<T>(path, { ...options, preserveConnectionError: true });
  } catch (error) {
    if (isDevApiFallbackEnabled() && isApiUnreachableError(error)) {
      return [] as unknown as T;
    }
    throw error;
  }
}

/** Dev-only: empty paginated result when API is down. */
export async function serverFetchPaginatedCatalog<T>(
  path: string,
  options: ServerFetchOptions = {},
  defaults: { page: number; limit: number },
): Promise<{ page: number; limit: number; total: number; items: T[] }> {
  try {
    return await serverFetch<{ page: number; limit: number; total: number; items: T[] }>(
      path,
      { ...options, preserveConnectionError: true },
    );
  } catch (error) {
    if (isDevApiFallbackEnabled() && isApiUnreachableError(error)) {
      return { page: defaults.page, limit: defaults.limit, total: 0, items: [] };
    }
    throw error;
  }
}

/** Dev-only: null when API is down (caller should invoke notFound()). */
export async function serverFetchCatalogDetail<T>(
  path: string,
  options: ServerFetchOptions = {},
): Promise<T | null> {
  try {
    return await serverFetch<T>(path, { ...options, preserveConnectionError: true });
  } catch (error) {
    if (isDevApiFallbackEnabled() && isApiUnreachableError(error)) {
      return null;
    }
    throw error;
  }
}

export async function serverFetch<T>(
  path: string,
  options: ServerFetchOptions = {},
): Promise<T> {
  const baseUrl = webEnv.NEXT_PUBLIC_API_BASE_URL;
  const url = `${baseUrl}${path}`;

  try {
    const cacheMode = options.cache ?? (options.revalidate ? undefined : 'no-store');
    const response = await fetch(url, {
      ...options,
      cache: cacheMode,
      headers: {
        'Content-Type': 'application/json',
        ...(options.headers ?? {}),
      },
      next: options.revalidate ? { revalidate: options.revalidate } : { revalidate: 0 },
    });

    if (!response.ok) {
      throw new ApiClientError(`API request failed: ${response.status}`, response.status);
    }

    return response.json() as Promise<T>;
  } catch (error) {
    if (isApiConnectionError(error)) {
      if (options.preserveConnectionError) {
        throw error;
      }
      throw new ApiClientError(
        `API is not reachable at ${baseUrl}. Start it with "pnpm dev:api" from the repo root (PostgreSQL and Redis required).`,
        503,
      );
    }
    throw error;
  }
}

export function syncAuthCookie(accessToken: string): void {
  setAccessTokenCookie(WEB_ACCESS_TOKEN_COOKIE, accessToken);
}

export function clearAuthCookie(): void {
  clearAccessTokenCookie(WEB_ACCESS_TOKEN_COOKIE);
}

export async function refreshSession() {
  const { data } = await bareAuthClient.post<ApiAuthSessionDto>('/auth/refresh', {});
  return mapApiAuthSession(data);
}

export const AUTH_COOKIE = WEB_ACCESS_TOKEN_COOKIE;

export { mapApiAuthSession as mapSession };
export type { ApiAuthSessionDto as ApiAuthSession };
