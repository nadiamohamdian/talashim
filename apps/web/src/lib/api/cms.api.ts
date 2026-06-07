import type {
  CmsBannerPlacement,
  PublicCmsBanner,
  PublicCmsCollection,
  PublicCmsHomepage,
  PublicCmsStaticPage,
  PublicCmsStaticPageSummary,
} from '@sadafgold/types';
import {
  ApiClientError,
  isApiUnreachableError,
  serverFetch,
  serverFetchCatalogDetail,
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

export async function getPublicCollection(id: string): Promise<PublicCmsCollection | null> {
  try {
    return await serverFetchCatalogDetail<PublicCmsCollection>(
      `/cms/collections/${encodeURIComponent(id)}`,
      {
        revalidate: 120,
        tags: ['content:banners', `content:collection:${id}`],
      },
    );
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

export async function getPublicHomepage(): Promise<PublicCmsHomepage> {
  const result = await serverFetchCatalogDetail<PublicCmsHomepage>('/cms/homepage', {
    revalidate: 120,
    tags: ['content:homepage'],
  });

  return (
    result ?? {
      hero: {
        badge: 'کالکشن جدید',
        title: 'زیبایی ماندگار',
        titleAccent: 'در هر قطعه طلا',
        description:
          'گالری طلای طلاشیم — انگشتر، گوشواره، دستبند و گردنبند با قیمت روز، وزن دقیق و خرید آنلاین امن.',
        primaryCta: { label: 'مشاهده فروشگاه', href: '/products' },
        secondaryCta: { label: 'انگشترهای زنانه', href: '/categories/rings' },
        imageUrl: '',
      },
      sections: {
        featuredTitle: 'جدیدترین محصولات',
        featuredSubtitle: 'آخرین طراحی‌های طلا و جواهر',
        bestsellerTitle: 'پرفروش‌ترین محصولات',
        bestsellerSubtitle: 'بر اساس تعداد فروش واقعی',
        showCategoryShowcase: true,
      },
    }
  );
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
