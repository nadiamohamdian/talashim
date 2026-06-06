export interface ApiErrorBody {
  message?: string | string[];
  statusCode?: number;
  error?: string | { message?: string | string[] };
}

function extractMessage(value: unknown): string | null {
  if (typeof value === 'string') {
    return value;
  }
  if (Array.isArray(value) && typeof value[0] === 'string') {
    return value[0];
  }
  return null;
}

export function parseApiErrorMessage(
  data: unknown,
  fallback = 'خطایی رخ داد',
): string {
  if (typeof data !== 'object' || data === null) {
    return fallback;
  }

  const root = data as ApiErrorBody;

  if (typeof root.error === 'object' && root.error !== null && 'message' in root.error) {
    const nested = extractMessage(root.error.message);
    if (nested) {
      return nested;
    }
  }

  const direct = extractMessage(root.message);
  if (direct) {
    return direct;
  }

  return fallback;
}
