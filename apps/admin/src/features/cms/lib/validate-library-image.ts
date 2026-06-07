export function validateLibraryImageUrl(url: string, fieldLabel = 'تصویر'): string | null {
  const trimmed = url.trim();
  if (!trimmed) {
    return `${fieldLabel} باید از کتابخانه رسانه انتخاب شود.`;
  }
  if (!trimmed.includes('/media-files/')) {
    return `${fieldLabel} باید از کتابخانه رسانه آپلود شده باشد.`;
  }
  return null;
}
