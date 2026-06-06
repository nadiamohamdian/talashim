export const MEDIA_PICKER_RESULT_KEY = 'talashim:media-picker-url';

export function setMediaPickerResult(url: string) {
  if (typeof window === 'undefined') {
    return;
  }
  sessionStorage.setItem(MEDIA_PICKER_RESULT_KEY, url);
}

export function consumeMediaPickerResult(): string | null {
  if (typeof window === 'undefined') {
    return null;
  }
  const url = sessionStorage.getItem(MEDIA_PICKER_RESULT_KEY);
  if (url) {
    sessionStorage.removeItem(MEDIA_PICKER_RESULT_KEY);
  }
  return url;
}
