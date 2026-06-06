import axios, { type AxiosError, type AxiosInstance, type InternalAxiosRequestConfig } from 'axios';

type RetryConfig = InternalAxiosRequestConfig & { _retry?: boolean };

interface ApiErrorBody {
  message?: string | string[];
}

function parseApiErrorMessage(data: unknown, fallback = 'خطایی رخ داد'): string {
  if (typeof data !== 'object' || data === null) {
    return fallback;
  }

  const root = data as ApiErrorBody & { error?: { message?: string | string[] } };

  if (typeof root.error === 'object' && root.error !== null && 'message' in root.error) {
    const nested = root.error.message;
    if (typeof nested === 'string') {
      return nested;
    }
    if (Array.isArray(nested) && typeof nested[0] === 'string') {
      return nested[0];
    }
  }

  if ('message' in root) {
    const payload = root.message;
    if (typeof payload === 'string') {
      return payload;
    }
    if (Array.isArray(payload) && typeof payload[0] === 'string') {
      return payload[0];
    }
  }

  return fallback;
}

export interface ApiClientOptions {
  baseURL: string;
  getAccessToken: () => string | null;
  /** Return true to retry the request after refreshing credentials. */
  onUnauthorized?: (error: AxiosError) => Promise<boolean>;
}

export function createApiClient(options: ApiClientOptions): AxiosInstance {
  const client = axios.create({
    baseURL: options.baseURL,
    withCredentials: true,
    headers: { 'Content-Type': 'application/json' },
  });

  client.interceptors.request.use((config) => {
    const token = options.getAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  });

  client.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
      const original = error.config as RetryConfig | undefined;
      if (
        !original ||
        error.response?.status !== 401 ||
        original._retry ||
        !options.onUnauthorized
      ) {
        return Promise.reject(error);
      }

      const shouldRetry = await options.onUnauthorized(error);
      if (!shouldRetry) {
        return Promise.reject(error);
      }

      const token = options.getAccessToken();
      if (!token) {
        return Promise.reject(error);
      }

      original._retry = true;
      original.headers.Authorization = `Bearer ${token}`;
      return client(original);
    },
  );

  return client;
}

export function getApiErrorMessage(error: unknown, fallback = 'خطایی رخ داد'): string {
  if (axios.isAxiosError(error)) {
    if (!error.response) {
      const code = error.code ?? '';
      const message = error.message ?? '';
      if (
        code === 'ECONNREFUSED' ||
        code === 'ERR_NETWORK' ||
        code === 'ENOTFOUND' ||
        message.includes('Network Error')
      ) {
        return 'اتصال به API برقرار نیست. ابتدا PostgreSQL را بالا بیاورید (pnpm dev:infra) سپس API را اجرا کنید (pnpm dev:api).';
      }
    }
    return parseApiErrorMessage(error.response?.data, fallback);
  }
  return fallback;
}
