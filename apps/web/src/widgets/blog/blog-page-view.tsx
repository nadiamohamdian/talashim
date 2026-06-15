import type { BlogPostSummary } from '@sadafgold/types';
import {
  BLOG_ARCHIVE_DEMO_ITEMS,
  BLOG_ARCHIVE_FALLBACK_COVER,
  BLOG_PAGE_META,
  type BlogArchiveCardItem,
} from '@/shared/config/blog-page';
import { BlogArchiveCard } from '@/widgets/blog/blog-archive-card';
import { BlogArchivePagination } from '@/widgets/blog/blog-archive-pagination';

interface BlogPageViewProps {
  posts: BlogPostSummary[];
  currentPage: number;
  totalPages: number;
}

function stripHtml(value: string): string {
  return value.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
}

function formatArchiveExcerpt(value: string): string {
  const text = stripHtml(value);
  if (text.length <= 108) return text;
  return `${text.slice(0, 108).trim()}...`;
}

function mapPostsToArchiveItems(posts: BlogPostSummary[]): BlogArchiveCardItem[] {
  return posts.map((post) => ({
    id: post.id,
    slug: post.slug,
    title: post.title,
    excerpt: formatArchiveExcerpt(post.excerpt),
    imageUrl: post.coverImageUrl?.trim() || BLOG_ARCHIVE_FALLBACK_COVER,
  }));
}

export function BlogPageView({ posts, currentPage, totalPages }: BlogPageViewProps) {
  const items = posts.length > 0 ? mapPostsToArchiveItems(posts) : BLOG_ARCHIVE_DEMO_ITEMS;

  return (
    <div className="blog-page store-chrome-light store-minimal-header">
      <div className="blog-page-inner">
        <h1 className="blog-page-title">{BLOG_PAGE_META.title}</h1>

        <ul className="blog-archive-list">
          {items.map((item) => (
            <li key={item.id} className="blog-archive-item">
              <BlogArchiveCard item={item} />
            </li>
          ))}
        </ul>

        <BlogArchivePagination currentPage={currentPage} totalPages={totalPages} />
      </div>
    </div>
  );
}
