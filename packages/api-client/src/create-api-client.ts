import axios, {
  type AxiosError,
  type AxiosInstance,
  type InternalAxiosRequestConfig,
} from 'axios';
import { parseApiErrorMessage } from '@sadafgold/shared/api-error';

type RetryConfig = InternalAxiosRequestConfig & { _retry?: boolean };

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
    return parseApiErrorMessage(error.response?.data, fallback);
  }
  return fallback;
}
