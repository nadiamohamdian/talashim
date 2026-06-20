import type {
  CmsBannerPlacement,
  PublicCmsBanner,
  PublicCmsCollection,
  PublicCmsHomepage,
  PublicCmsLensVideo,
  PublicCmsSeo,
  PublicCmsStaticPage,
  PublicCmsStaticPageSummary,
} from '@sadafgold/types';
import { platformConfig } from '@sadafgold/shared';
import { getDefaultHeroImageUrl } from '@/shared/config/cms-hero';
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

export async function getPublishedLensVideos(): Promise<PublicCmsLensVideo[]> {
  try {
    return await serverFetchCatalogList<PublicCmsLensVideo[]>('/cms/lens-videos', {
      revalidate: 120,
      tags: ['content:lens-videos'],
    });
  } catch (error) {
    if (
      process.env.NODE_ENV === 'development' &&
      (isApiUnreachableError(error) ||
        (error instanceof ApiClientError && (error.status ?? 0) >= 500))
    ) {
      return [];
    }
    throw error;
  }
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

function defaultPublicHomepage(): PublicCmsHomepage {
  return {
    hero: {
      badge: 'کالکشن جدید',
      title: 'زیبایی ماندگار',
      titleAccent: 'در هر قطعه طلا',
      description:
        'گالری طلای طلاشیم — انگشتر، گوشواره، دستبند و گردنبند با قیمت روز، وزن دقیق و خرید آنلاین امن.',
      primaryCta: { label: 'مشاهده کالکشن ها', href: '/products' },
      secondaryCta: { label: 'انگشترهای زنانه', href: '/products?category=rings' },
      imageUrl: getDefaultHeroImageUrl(),
      desktopBackgroundImageUrl: '',
      desktopCarouselItems: [
        {
          id: 'hero-carousel-ring',
          imageUrl: '/images/home/hero-carousel-ring.png',
          href: '/products?category=rings',
        },
        {
          id: 'hero-carousel-necklace',
          imageUrl: '/images/home/hero-carousel-necklace.png',
          href: '/products?category=necklaces',
        },
        {
          id: 'hero-carousel-bracelet',
          imageUrl: '/images/home/hero-carousel-bracelet.png',
          href: '/products?category=bracelets',
        },
      ],
    },
    sections: {
      featuredTitle: 'جدیدترین محصولات',
      featuredSubtitle: 'آخرین طراحی‌های طلا و جواهر',
      bestsellerTitle: 'پرفروش‌ترین محصولات',
      bestsellerSubtitle: 'بر اساس تعداد فروش واقعی',
      newArrivalsTitle: 'جدیدترین ها',
      showCategoryShowcase: true,
      categoryShowcase: {
        title: 'دسته بندی محصولات',
        items: [
          { slug: 'rings', label: 'انگشتر', href: '/products?category=rings' },
          { slug: 'bracelets', label: 'دستبند', href: '/products?category=bracelets' },
          { slug: 'earrings', label: 'گوشواره', href: '/products?category=earrings' },
          { slug: 'necklaces', label: 'گردنبند', href: '/products?category=necklaces' },
        ],
      },
      categoryListingGallery: {
        items: [
          { slug: 'rings', label: 'انگشتر زنانه', imageUrls: [] },
          { slug: 'necklaces', label: 'گردنبند', imageUrls: [] },
          { slug: 'bracelets', label: 'دستبند', imageUrls: [] },
          { slug: 'earrings', label: 'گوشواره', imageUrls: [] },
          { slug: 'sets', label: 'ست و نیم‌ست', imageUrls: [] },
          { slug: 'wedding-rings', label: 'حلقه ازدواج', imageUrls: [] },
          { slug: 'coins', label: 'سکه', imageUrls: [] },
        ],
      },
    },
    bestsellerProducts: [],
    newArrivalsProducts: [],
  };
}

export async function getPublicHomepage(): Promise<PublicCmsHomepage> {
  try {
    const result = await serverFetchCatalogDetail<PublicCmsHomepage>('/cms/homepage', {
      revalidate: 120,
      tags: ['content:homepage'],
    });

    return result ?? defaultPublicHomepage();
  } catch (error) {
    if (
      process.env.NODE_ENV === 'development' &&
      (isApiUnreachableError(error) ||
        (error instanceof ApiClientError && (error.status ?? 0) >= 500))
    ) {
      return defaultPublicHomepage();
    }
    throw error;
  }
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

function defaultPublicSeo(): PublicCmsSeo {
  return {
    siteTitle: `${platformConfig.storeName} | ${platformConfig.nameEn}`,
    siteDescription: 'فروش طلا، جواهرات و زیورآلات با قیمت روز و خرید آنلاین امن.',
    defaultOgImageUrl: null,
    robotsIndex: true,
    googleAnalyticsId: null,
    extraMeta: null,
  };
}

export async function getPublicSeo(): Promise<PublicCmsSeo> {
  try {
    const result = await serverFetchCatalogDetail<PublicCmsSeo>('/cms/seo', {
      revalidate: 120,
      tags: ['content:seo'],
    });
    return result ?? defaultPublicSeo();
  } catch (error) {
    if (process.env.NODE_ENV === 'development' && isApiUnreachableError(error)) {
      return defaultPublicSeo();
    }
    throw error;
  }
}
