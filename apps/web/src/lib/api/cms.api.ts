import type { CmsBannerPlacement, PublicCmsBanner } from '@sadafgold/types';
import { serverFetchCatalogList } from '@/lib/api/client';

export async function getPublishedBanners(
  placement?: CmsBannerPlacement,
): Promise<PublicCmsBanner[]> {
  const query = placement ? `?placement=${encodeURIComponent(placement)}` : '';
  return serverFetchCatalogList<PublicCmsBanner[]>(`/cms/banners${query}`, {
    revalidate: 120,
    tags: ['content:banners'],
  });
}
