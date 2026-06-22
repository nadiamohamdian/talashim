export type CmsBannerPlacement = 'HOME_HERO' | 'HOME_MID' | 'CATEGORY_TOP' | 'GLOBAL';
export type CmsBannerStatus = 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
export type CmsBannerLinkType = 'URL' | 'COLLECTION';

import type { ProductSummary } from './catalog';

export interface PublicCmsBanner {
  id: string;
  title: string;
  subtitle: string | null;
  imageUrl: string;
  linkType: CmsBannerLinkType;
  linkUrl: string | null;
  placement: CmsBannerPlacement;
  sortOrder: number;
}

export interface PublicCmsLensVideo {
  id: string;
  title: string | null;
  videoUrl: string;
  thumbnailUrl: string | null;
  heroImageUrl: string | null;
  hotspots: CmsLensHotspot[];
  sortOrder: number;
  products: ProductSummary[];
}

export interface CmsLensHotspot {
  id?: string;
  top: string;
  left: string;
  chipTop?: string;
  chipLeft?: string;
  chipTopMobile?: string;
  chipLeftMobile?: string;
  chipTranslateX?: string;
  chipTranslateY?: string;
}

export interface CmsLensVideoDto {
  id: string;
  title: string | null;
  videoUrl: string;
  thumbnailUrl: string | null;
  heroImageUrl: string | null;
  hotspots: CmsLensHotspot[];
  sortOrder: number;
  status: CmsBannerStatus;
  productIds: string[];
  createdAt: string;
  updatedAt: string;
}

export interface PublicCmsCollection {
  id: string;
  title: string;
  subtitle: string | null;
  imageUrl: string;
  products: ProductSummary[];
}

export interface PublicCmsStaticPageSummary {
  slug: string;
  title: string;
}

export interface PublicCmsStaticPage {
  slug: string;
  title: string;
  content: string;
  metaTitle: string | null;
  metaDescription: string | null;
  updatedAt: string;
}

export interface CmsBannerDto {
  id: string;
  title: string;
  subtitle: string | null;
  imageUrl: string;
  linkType: CmsBannerLinkType;
  linkUrl: string | null;
  productIds: string[];
  placement: CmsBannerPlacement;
  sortOrder: number;
  status: CmsBannerStatus;
  startsAt: string | null;
  endsAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CmsHeroCta {
  label: string;
  href: string;
}

export interface CmsHeroDesktopCarouselItem {
  id: string;
  imageUrl: string;
  href: string;
}

export interface CmsHeroConfig {
  badge: string;
  title: string;
  titleAccent: string;
  description: string;
  primaryCta: CmsHeroCta;
  secondaryCta: CmsHeroCta;
  /** Mobile hero background */
  imageUrl: string;
  /** Desktop hero background — empty uses storefront default asset */
  desktopBackgroundImageUrl?: string;
  /** Desktop hero product carousel — empty uses storefront defaults */
  desktopCarouselItems?: CmsHeroDesktopCarouselItem[];
}

export type CmsCategoryShowcaseSlug = 'rings' | 'bracelets' | 'earrings' | 'necklaces';

export interface CmsCategoryShowcaseItem {
  slug: CmsCategoryShowcaseSlug;
  label: string;
  href: string;
  /** Mobile card image — empty uses storefront default */
  mobileImageUrl?: string;
  /** Desktop card image — empty uses storefront default */
  desktopImageUrl?: string;
}

export interface CmsCategoryShowcaseConfig {
  title: string;
  items: CmsCategoryShowcaseItem[];
}

export type CmsCategoryListingGallerySlug =
  | 'rings'
  | 'necklaces'
  | 'bracelets'
  | 'earrings'
  | 'sets'
  | 'wedding-rings'
  | 'coins';

export interface CmsCategoryListingGalleryItem {
  slug: CmsCategoryListingGallerySlug;
  label: string;
  /** Product listing page hero gallery — library image URLs in display order */
  imageUrls: string[];
}

export interface CmsCategoryListingGalleryConfig {
  items: CmsCategoryListingGalleryItem[];
}

export interface CmsLensSetsShowcaseConfig {
  eyebrow: string;
  title: string;
  description: string;
}

export interface CmsHomepageSections {
  featuredTitle: string;
  featuredSubtitle: string;
  bestsellerTitle: string;
  bestsellerSubtitle: string;
  /** Homepage new arrivals carousel title */
  newArrivalsTitle: string;
  showCategoryShowcase: boolean;
  /** Category showcase title and per-category images */
  categoryShowcase?: CmsCategoryShowcaseConfig;
  /** Category product listing page hero galleries */
  categoryListingGallery?: CmsCategoryListingGalleryConfig;
  /** Lens sets showcase section copy */
  lensSetsShowcase?: CmsLensSetsShowcaseConfig;
  /** Homepage bestsellers carousel — 7–12 catalog product IDs */
  bestsellerProductIds?: string[];
  /** Homepage new arrivals carousel — 1–12 catalog product IDs */
  newArrivalsProductIds?: string[];
}

export interface CmsHomepageDto {
  hero: CmsHeroConfig;
  sections: CmsHomepageSections;
  updatedAt: string;
}

export interface PublicCmsHomepage {
  hero: CmsHeroConfig;
  sections: CmsHomepageSections;
  /** Resolved bestseller products for the homepage carousel */
  bestsellerProducts: ProductSummary[];
  /** Resolved new arrivals products for the homepage carousel */
  newArrivalsProducts: ProductSummary[];
}

/** Public storefront SEO settings (from CMS). */
export interface PublicCmsSeo {
  siteTitle: string;
  siteDescription: string;
  defaultOgImageUrl: string | null;
  robotsIndex: boolean;
  googleAnalyticsId: string | null;
  extraMeta: Record<string, string> | null;
}

export interface CmsStaticPageDto {
  id: string;
  slug: string;
  title: string;
  content: string;
  metaTitle: string | null;
  metaDescription: string | null;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CmsSeoSettingsDto {
  siteTitle: string;
  siteDescription: string;
  defaultOgImageUrl: string | null;
  robotsIndex: boolean;
  googleAnalyticsId: string | null;
  extraMeta: Record<string, string> | null;
  updatedAt: string;
}

export type CmsAboutValueKey = 'authenticity' | 'design' | 'trust' | 'satisfaction';

export interface CmsAboutPageValue {
  key: CmsAboutValueKey;
  label: string;
  icon: string;
  iconWidth: number;
  iconHeight: number;
}

export interface CmsAboutPageMeta {
  title: string;
  description: string;
}

export interface CmsAboutPageCopy {
  heroTitle: string;
  intro: string;
  storyTitle: string;
  storyBody: string;
  valuesTitle: string;
}

export interface CmsAboutPageDto {
  meta: CmsAboutPageMeta;
  copy: CmsAboutPageCopy;
  decorImageUrl: string;
  values: CmsAboutPageValue[];
  updatedAt: string;
}

export type PublicCmsAboutPage = Omit<CmsAboutPageDto, 'updatedAt'>;

export interface MediaAssetDto {
  id: string;
  filename: string;
  url: string;
  mimeType: string;
  sizeBytes: number;
  alt: string | null;
  folder: string;
  uploadedBy: string | null;
  createdAt: string;
}

export interface AdminBlogCategoryDto {
  id: string;
  slug: string;
  title: string;
}

export interface AdminBlogPostDto {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  coverImageUrl: string;
  publishedAt: string;
  isPublished: boolean;
  sortOrder: number;
  categoryId: string | null;
  categorySlug: string | null;
  categoryTitle: string | null;
  createdAt: string;
  updatedAt: string;
}
