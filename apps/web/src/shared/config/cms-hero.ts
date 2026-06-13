import { getMediaFileUrl } from '@/shared/lib/media-url';

export const CMS_HERO_MEDIA_FILE = 'a5b565d2-4979-4a17-9538-66f5d01d5397.png';
export const CMS_HERO_MEDIA_FOLDER = 'general';
export const CMS_HERO_STATIC_FALLBACK = '/images/home/hero-mobile-bg.png';

export function getDefaultHeroImageUrl(): string {
  return getMediaFileUrl(CMS_HERO_MEDIA_FOLDER, CMS_HERO_MEDIA_FILE);
}
