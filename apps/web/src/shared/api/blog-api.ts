import type { BlogPostDetails, BlogPostSummary } from '@sadafgold/types';
import {
  ApiClientError,
  serverFetchCatalogDetail,
  serverFetchCatalogList,
} from '@/lib/api/client';
import { filterPublishedBlogPosts } from '@/shared/lib/published-blog-posts';

export async function getBlogPosts(): Promise<BlogPostSummary[]> {
  const posts = await serverFetchCatalogList<BlogPostSummary[]>('/blog?limit=50', {
    revalidate: 300,
  });
  return filterPublishedBlogPosts(posts);
}

export function getBlogPostBySlug(slug: string): Promise<BlogPostDetails | null> {
  return serverFetchCatalogDetail<BlogPostDetails>(
    `/blog/${encodeURIComponent(slug)}`,
    { revalidate: 300 },
  );
}

export async function getBlogPostBySlugOrThrow(slug: string): Promise<BlogPostDetails> {
  const post = await getBlogPostBySlug(slug);
  if (!post) {
    throw new ApiClientError('Blog post not found', 404);
  }
  return post;
}

export async function getFaqPosts(limit = 20): Promise<BlogPostSummary[]> {
  const posts = await serverFetchCatalogList<BlogPostSummary[]>(
    `/blog?category=faq&limit=${limit}`,
    {
      tags: ['content:faq'],
      revalidate: 120,
    },
  );
  return filterPublishedBlogPosts(posts);
}
