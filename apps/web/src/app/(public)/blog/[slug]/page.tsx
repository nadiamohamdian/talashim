import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { FeatureDisabledPage } from '@/features/site/components/feature-disabled-page';
import { fetchSiteConfig } from '@/lib/api/site.api';
import { getProducts } from '@/shared/api/catalog-api';
import { getBlogPostBySlug, getBlogPosts } from '@/shared/api/blog-api';
import { BlogPostPageView } from '@/widgets/blog/blog-post-page-view';

interface BlogDetailsPageProps {
  params: Promise<{ slug: string }>;
}

export const dynamic = 'force-dynamic';

export async function generateMetadata({
  params,
}: BlogDetailsPageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = await getBlogPostBySlug(slug);
  if (!post) {
    return { title: 'مقاله یافت نشد' };
  }
  return {
    title: post.title,
    description: post.excerpt ?? post.content.slice(0, 160),
  };
}

export default async function BlogDetailsPage({ params }: BlogDetailsPageProps) {
  const config = await fetchSiteConfig();
  if (!config.featureFlags.enableBlog) {
    return (
      <FeatureDisabledPage
        title="بخش محتوا غیرفعال است"
        description="وبلاگ و مقالات فعلاً در دسترس نیستند."
      />
    );
  }

  const { slug } = await params;

  const [post, allPosts, relatedProducts] = await Promise.all([
    getBlogPostBySlug(slug),
    getBlogPosts().catch(() => [] as Awaited<ReturnType<typeof getBlogPosts>>),
    getProducts(6).catch(() => [] as Awaited<ReturnType<typeof getProducts>>),
  ]);

  if (!post) {
    notFound();
  }

  return (
    <BlogPostPageView
      post={post}
      relatedPosts={allPosts}
      relatedProducts={relatedProducts}
    />
  );
}
