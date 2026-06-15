import type { Metadata } from 'next';
import { FeatureDisabledPage } from '@/features/site/components/feature-disabled-page';
import { fetchSiteConfig } from '@/lib/api/site.api';
import { getBlogPosts } from '@/shared/api/blog-api';
import { BLOG_ARCHIVE_PAGE_SIZE, BLOG_PAGE_META } from '@/shared/config/blog-page';
import { BlogPageView } from '@/widgets/blog/blog-page-view';

export const metadata: Metadata = {
  title: BLOG_PAGE_META.title,
  description: BLOG_PAGE_META.description,
};

export const dynamic = 'force-dynamic';

interface BlogPageProps {
  searchParams: Promise<{ page?: string }>;
}

export default async function BlogPage({ searchParams }: BlogPageProps) {
  const config = await fetchSiteConfig();
  if (!config.featureFlags.enableBlog) {
    return (
      <FeatureDisabledPage
        title="بخش محتوا غیرفعال است"
        description="وبلاگ و مقالات فعلاً در دسترس نیستند."
      />
    );
  }

  const { page: pageParam } = await searchParams;
  const requestedPage = Number.parseInt(pageParam ?? '1', 10);
  const safeRequestedPage = Number.isFinite(requestedPage) && requestedPage > 0 ? requestedPage : 1;

  let allPosts: Awaited<ReturnType<typeof getBlogPosts>> = [];
  try {
    allPosts = await getBlogPosts();
  } catch {
    allPosts = [];
  }

  const totalPages = Math.max(1, Math.ceil(allPosts.length / BLOG_ARCHIVE_PAGE_SIZE));
  const currentPage = Math.min(safeRequestedPage, totalPages);
  const pagePosts =
    allPosts.length > 0
      ? allPosts.slice(
          (currentPage - 1) * BLOG_ARCHIVE_PAGE_SIZE,
          currentPage * BLOG_ARCHIVE_PAGE_SIZE,
        )
      : [];

  return (
    <BlogPageView posts={pagePosts} currentPage={currentPage} totalPages={totalPages} />
  );
}
