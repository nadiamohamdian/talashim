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

export interface CmsHeroConfig {
  badge: string;
  title: string;
  titleAccent: string;
  description: string;
  primaryCta: CmsHeroCta;
  secondaryCta: CmsHeroCta;
  imageUrl: string;
}

export interface CmsHomepageSections {
  featuredTitle: string;
  featuredSubtitle: string;
  bestsellerTitle: string;
  bestsellerSubtitle: string;
  showCategoryShowcase: boolean;
}

export interface CmsHomepageDto {
  hero: CmsHeroConfig;
  sections: CmsHomepageSections;
  updatedAt: string;
}

export interface PublicCmsHomepage {
  hero: CmsHeroConfig;
  sections: CmsHomepageSections;
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
