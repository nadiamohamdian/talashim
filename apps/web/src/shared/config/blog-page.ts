import {
  HOME_MAGAZINE_COVER_IMAGE,
  HOME_MAGAZINE_DEMO_EXCERPT,
  HOME_MAGAZINE_READ_MORE_LABEL,
} from '@/shared/config/home-magazine-demo';

export const BLOG_PAGE_META = {
  title: 'آرشیو مقالات',
  description: 'مقالات، راهنماها و نکات نگهداری جواهرات طلاشیم.',
} as const;

export const BLOG_ARCHIVE_PAGE_SIZE = 12;

export const BLOG_ARCHIVE_READ_MORE_LABEL = HOME_MAGAZINE_READ_MORE_LABEL;

export const BLOG_ARCHIVE_FALLBACK_COVER = HOME_MAGAZINE_COVER_IMAGE;

const BLOG_ARCHIVE_DEMO_TITLE = 'چگونه از جواهرات خود نگهداری کنیم؟';

export interface BlogArchiveCardItem {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  imageUrl: string;
}

/** Fallback cards when CMS posts are unavailable — matches Figma mobile layout. */
export const BLOG_ARCHIVE_DEMO_ITEMS: BlogArchiveCardItem[] = Array.from(
  { length: 12 },
  (_, index) => ({
    id: `blog-archive-demo-${index + 1}`,
    slug: '',
    title: BLOG_ARCHIVE_DEMO_TITLE,
    excerpt: HOME_MAGAZINE_DEMO_EXCERPT,
    imageUrl: BLOG_ARCHIVE_FALLBACK_COVER,
  }),
);
