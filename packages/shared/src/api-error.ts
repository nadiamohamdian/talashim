export interface ApiErrorBody {
  message?: string | string[];
  statusCode?: number;
  error?: string;
}

export function parseApiErrorMessage(
  data: unknown,
  fallback = 'خطایی رخ داد',
): string {
  if (typeof data !== 'object' || data === null || !('message' in data)) {
    return fallback;
  }

  const payload = (data as ApiErrorBody).message;
  if (typeof payload === 'string') {
    return payload;
  }
  if (Array.isArray(payload) && typeof payload[0] === 'string') {
    return payload[0];
  }

  return fallback;
}
