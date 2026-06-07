import type { Metadata } from 'next';
import { FaqPageShell } from '@/features/content/components/faq-list';
import { FeatureDisabledPage } from '@/features/site/components/feature-disabled-page';
import { fetchSiteConfig } from '@/lib/api/site.api';
import { getFaqPosts } from '@/shared/api/blog-api';

export const metadata: Metadata = {
  title: 'سوالات متداول',
};

export const dynamic = 'force-dynamic';

export default async function FaqPage() {
  const config = await fetchSiteConfig();
  if (!config.featureFlags.enableBlog) {
    return (
      <FeatureDisabledPage
        title="بخش محتوا غیرفعال است"
        description="وبلاگ و مقالات فعلاً در دسترس نیستند."
      />
    );
  }

  let posts: Awaited<ReturnType<typeof getFaqPosts>> = [];
  try {
    posts = await getFaqPosts();
  } catch {
    posts = [];
  }

  return <FaqPageShell posts={posts} />;
}
