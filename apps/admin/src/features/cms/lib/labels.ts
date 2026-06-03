import type { CmsBannerDto } from '@talashim/types';

export const selectFieldClass =
  'mt-1 flex h-11 w-full min-w-[140px] rounded-2xl border border-border bg-white px-3 text-sm';

export const BANNER_PLACEMENT_FA: Record<CmsBannerDto['placement'], string> = {
  HOME_HERO: 'هیرو صفحه اصلی',
  HOME_MID: 'میانه صفحه اصلی',
  CATEGORY_TOP: 'بالای دسته‌بندی',
  GLOBAL: 'سراسری',
};

export const BANNER_STATUS_FA: Record<CmsBannerDto['status'], string> = {
  DRAFT: 'پیش‌نویس',
  PUBLISHED: 'منتشرشده',
  ARCHIVED: 'بایگانی',
};

export function formatBytes(bytes: number): string {
  if (bytes < 1024) {
    return `${bytes} B`;
  }
  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`;
  }
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
