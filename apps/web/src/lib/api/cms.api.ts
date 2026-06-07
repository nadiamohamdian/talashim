import type {
  CmsBannerPlacement,
  PublicCmsBanner,
  PublicCmsStaticPage,
  PublicCmsStaticPageSummary,
} from '@sadafgold/types';
import {
  ApiClientError,
  isApiUnreachableError,
  serverFetch,
  serverFetchCatalogList,
} from '@/lib/api/client';

export async function getPublishedBanners(
  placement?: CmsBannerPlacement,
): Promise<PublicCmsBanner[]> {
  const query = placement ? `?placement=${encodeURIComponent(placement)}` : '';
  return serverFetchCatalogList<PublicCmsBanner[]>(`/cms/banners${query}`, {
    revalidate: 120,
    tags: ['content:banners'],
  });
}

export async function getPublishedStaticPages(): Promise<PublicCmsStaticPageSummary[]> {
  return serverFetchCatalogList<PublicCmsStaticPageSummary[]>('/cms/pages', {
    revalidate: 120,
    tags: ['content:static-pages'],
  });
}

export async function getPublishedStaticPage(slug: string): Promise<PublicCmsStaticPage | null> {
  try {
    return await serverFetch<PublicCmsStaticPage>(`/cms/pages/${encodeURIComponent(slug)}`, {
      revalidate: 120,
      tags: ['content:static-pages', `content:static-page:${slug}`],
      preserveConnectionError: true,
    });
  } catch (error) {
    if (error instanceof ApiClientError && error.status === 404) {
      return null;
    }
    if (process.env.NODE_ENV === 'development' && isApiUnreachableError(error)) {
      return null;
    }
    throw error;
  }
}
