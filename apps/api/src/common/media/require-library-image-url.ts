import { BadRequestException } from '@nestjs/common';
import {
  isLibraryMediaUrl,
  LIBRARY_MEDIA_URL_MESSAGE,
  normalizeLibraryMediaUrl,
} from './library-media-url';

export function requireLibraryImageUrl(
  url: string | undefined | null,
  fieldLabel = 'تصویر',
): string {
  const trimmed = url?.trim();
  if (!trimmed) {
    throw new BadRequestException(`${fieldLabel} باید از کتابخانه رسانه انتخاب شود`);
  }

  const normalized = normalizeLibraryMediaUrl(trimmed);
  if (!isLibraryMediaUrl(normalized)) {
    throw new BadRequestException(`${fieldLabel} باید ${LIBRARY_MEDIA_URL_MESSAGE.toLowerCase()}`);
  }

  return normalized;
}

export function optionalLibraryImageUrl(
  url: string | undefined | null,
  fieldLabel = 'تصویر',
): string | null | undefined {
  if (url === undefined) {
    return undefined;
  }
  if (url === null || !url.trim()) {
    return null;
  }
  return requireLibraryImageUrl(url, fieldLabel);
}
