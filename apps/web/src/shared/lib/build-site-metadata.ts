import type { Metadata } from 'next';
import { platformConfig } from '@sadafgold/shared';
import type { PublicCmsSeo } from '@sadafgold/types';

const DEFAULT_DESCRIPTION =
  'فروش طلا، جواهرات و زیورآلات با قیمت روز و خرید آنلاین امن.';

export function resolveSiteSeoBrand(siteTitle: string): string {
  const fromTitle = siteTitle.split('|')[0]?.trim();
  return fromTitle || platformConfig.storeName;
}

export function buildSiteMetadata(seo: PublicCmsSeo | null): Metadata {
  const siteTitle =
    seo?.siteTitle?.trim() ||
    `${platformConfig.storeName} | ${platformConfig.nameEn}`;
  const siteDescription = seo?.siteDescription?.trim() || DEFAULT_DESCRIPTION;
  const brand = resolveSiteSeoBrand(siteTitle);
  const ogImage = seo?.defaultOgImageUrl?.trim() || undefined;
  const robotsIndex = seo?.robotsIndex ?? true;
  const extraMeta = seo?.extraMeta ?? {};

  const other: Record<string, string | number | (string | number)[]> = {};
  for (const [key, value] of Object.entries(extraMeta)) {
    const trimmedKey = key.trim();
    const trimmedValue = value.trim();
    if (trimmedKey && trimmedValue) {
      other[trimmedKey] = trimmedValue;
    }
  }

  return {
    title: {
      default: siteTitle,
      template: `%s | ${brand}`,
    },
    description: siteDescription,
    robots: {
      index: robotsIndex,
      follow: robotsIndex,
    },
    openGraph: {
      type: 'website',
      locale: 'fa_IR',
      title: siteTitle,
      description: siteDescription,
      ...(ogImage ? { images: [{ url: ogImage, alt: brand }] } : {}),
    },
    twitter: {
      card: ogImage ? 'summary_large_image' : 'summary',
      title: siteTitle,
      description: siteDescription,
      ...(ogImage ? { images: [ogImage] } : {}),
    },
    ...(Object.keys(other).length > 0 ? { other } : {}),
  };
}

export function isValidGoogleAnalyticsId(id: string): boolean {
  return /^(G-[A-Z0-9]+|UA-\d+-\d+)$/.test(id.trim());
}
