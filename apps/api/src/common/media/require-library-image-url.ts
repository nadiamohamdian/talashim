import { BadRequestException } from '@nestjs/common';

export function requireLibraryImageUrl(
  url: string | undefined | null,
  fieldLabel = 'تصویر',
): string {
  const trimmed = url?.trim();
  if (!trimmed) {
    throw new BadRequestException(`${fieldLabel} باید از کتابخانه رسانه انتخاب شود`);
  }
  if (!trimmed.includes('/media-files/')) {
    throw new BadRequestException(`${fieldLabel} باید از کتابخانه رسانه آپلود شده باشد`);
  }
  return trimmed;
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
