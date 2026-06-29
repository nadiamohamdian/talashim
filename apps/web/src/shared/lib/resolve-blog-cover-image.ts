import { HOME_MAGAZINE_COVER_IMAGE } from '@/shared/config/home-magazine-demo';

export function resolveBlogCoverImage(coverImageUrl: string | null | undefined): string {
  const normalized = coverImageUrl?.trim() ?? '';
  if (!normalized) {
    return HOME_MAGAZINE_COVER_IMAGE;
  }

  const lower = normalized.toLowerCase();
  if (lower.includes('seed-placeholder')) {
    return HOME_MAGAZINE_COVER_IMAGE;
  }

  return normalized;
}
