export const MEDIA_FOLDERS = [
  { value: '', label: 'همه رسانه‌ها' },
  { value: 'general', label: 'عمومی' },
  { value: 'products', label: 'محصولات' },
  { value: 'blog', label: 'وبلاگ و FAQ' },
  { value: 'banners', label: 'بنرها' },
  { value: 'lens', label: 'لنز طلاشیم' },
  { value: 'cms', label: 'تنظیمات و SEO' },
] as const;

export type MediaFolderValue = (typeof MEDIA_FOLDERS)[number]['value'];

export const MEDIA_FOLDER_LABELS: Record<string, string> = Object.fromEntries(
  MEDIA_FOLDERS.filter((item) => item.value).map((item) => [item.value, item.label]),
);

export const IMAGE_ACCEPT = 'image/jpeg,image/png,image/webp,image/gif';
