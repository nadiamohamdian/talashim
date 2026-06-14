import type { CmsHomepageSections } from '@sadafgold/types';
import {
  HOME_CATEGORY_SHOWCASE,
  type HomeCategoryShowcaseItem,
} from '@/shared/config/storefront-ia';

export function resolveCategoryShowcase(
  sections: Pick<CmsHomepageSections, 'categoryShowcase'>,
): {
  title: string;
  items: HomeCategoryShowcaseItem[];
} {
  const configured = sections.categoryShowcase;
  const title = configured?.title?.trim() || 'دسته بندی محصولات';

  const items = HOME_CATEGORY_SHOWCASE.map((fallback) => {
    const cmsItem = configured?.items?.find((item) => item.slug === fallback.slug);
    const mobileImageUrl = cmsItem?.mobileImageUrl?.trim();
    const desktopImageUrl = cmsItem?.desktopImageUrl?.trim();

    return {
      ...fallback,
      label: cmsItem?.label?.trim() || fallback.label,
      href: cmsItem?.href?.trim() || fallback.href,
      ...(mobileImageUrl ? { cmsMobileImageUrl: mobileImageUrl } : {}),
      ...(desktopImageUrl ? { desktopImageUrl } : {}),
    };
  });

  return { title, items };
}

export type ResolvedCategoryShowcaseItem = HomeCategoryShowcaseItem & {
  cmsMobileImageUrl?: string;
};

export function resolveCategoryShowcaseImage(
  category: ResolvedCategoryShowcaseItem,
  viewport: 'mobile' | 'desktop',
): string {
  if (viewport === 'desktop') {
    if (category.desktopImageUrl) {
      return category.desktopImageUrl;
    }
  }

  if (viewport === 'mobile' && category.cmsMobileImageUrl) {
    return category.cmsMobileImageUrl;
  }

  return '';
}
