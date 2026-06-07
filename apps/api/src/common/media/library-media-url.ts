import { getApiEnv } from '@/config/env';

/** Matches public media file paths served by the API (`.../media-files/{folder}/{file}`). */
export const LIBRARY_MEDIA_URL_PATTERN = /\/media-files\/[^/]+\/[^/?#]+/;

export const LIBRARY_MEDIA_URL_MESSAGE = 'آدرس تصویر باید از کتابخانه رسانه باشد';

export function isLibraryMediaUrl(url: string): boolean {
  return LIBRARY_MEDIA_URL_PATTERN.test(url.trim());
}

export function normalizeLibraryMediaUrl(url: string): string {
  const trimmed = url.trim();
  if (!trimmed) {
    return trimmed;
  }
  if (/^https?:\/\//i.test(trimmed)) {
    return trimmed;
  }
  if (trimmed.startsWith('/')) {
    const env = getApiEnv();
    const publicBase = env.UPLOAD_PUBLIC_BASE_URL.replace(/\/$/, '');
    return `${publicBase}${trimmed}`;
  }
  return trimmed;
}
