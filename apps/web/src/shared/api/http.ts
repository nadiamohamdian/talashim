import { webEnv } from "../config/env";

interface ApiRequestOptions extends RequestInit {
  revalidate?: number;
}

export async function apiRequest<T>(
  path: string,
  options: ApiRequestOptions = {},
): Promise<T> {
  const response = await fetch(`${webEnv.NEXT_PUBLIC_API_BASE_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options.headers ?? {}),
    },
    next: options.revalidate ? { revalidate: options.revalidate } : undefined,
  });

  if (!response.ok) {
    throw new Error(`API request failed: ${response.status}`);
  }

  return (await response.json()) as T;
}
