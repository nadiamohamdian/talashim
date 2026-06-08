import type { BlogPostSummary } from '@sadafgold/types';

/** Public storefront — only posts explicitly marked published. */
export function filterPublishedBlogPosts(posts: BlogPostSummary[]): BlogPostSummary[] {
  return posts.filter((post) => post.isPublished !== false);
}
