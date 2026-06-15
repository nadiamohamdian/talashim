import type { CmsCategoryListingGallerySlug, CmsHomepageSections } from '@sadafgold/types';
import { getCategoryListingGallerySlides } from '@/shared/config/category-listing-gallery';
import { resolveCatalogCategorySlug } from '@/shared/lib/catalog-category';

const CMS_SLUG_BY_CATALOG_KEY: Record<string, CmsCategoryListingGallerySlug> = {
  ring: 'rings',
  necklace: 'necklaces',
  bracelet: 'bracelets',
  earring: 'earrings',
  wedding_ring: 'wedding-rings',
  coin: 'coins',
  set: 'sets',
};

export function resolveCategoryListingGallerySlides(
  categorySlug: string,
  sections?: Pick<CmsHomepageSections, 'categoryListingGallery'>,
): readonly string[] | undefined {
  const resolved = resolveCatalogCategorySlug(categorySlug);
  if (!resolved) {
    return undefined;
  }

  const cmsSlug = CMS_SLUG_BY_CATALOG_KEY[resolved];
  const cmsItem = sections?.categoryListingGallery?.items?.find((item) => item.slug === cmsSlug);
  const cmsUrls =
    cmsItem?.imageUrls?.map((url) => url.trim()).filter((url) => url.length > 0) ?? [];

  if (cmsUrls.length > 0) {
    return cmsUrls;
  }

  return getCategoryListingGallerySlides(categorySlug);
}
