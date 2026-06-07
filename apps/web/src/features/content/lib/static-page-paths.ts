export const ROOT_STATIC_PAGE_SLUGS = ['about', 'terms', 'policies'] as const;

export type RootStaticPageSlug = (typeof ROOT_STATIC_PAGE_SLUGS)[number];

const LEGAL_STATIC_PAGE_SLUGS = new Set<string>(['terms', 'policies']);

export function resolveStaticPageHref(slug: string): string {
  if (ROOT_STATIC_PAGE_SLUGS.includes(slug as RootStaticPageSlug)) {
    return `/${slug}`;
  }
  return `/pages/${slug}`;
}

export function isLegalStaticPageSlug(slug: string): boolean {
  return LEGAL_STATIC_PAGE_SLUGS.has(slug);
}
