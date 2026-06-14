import type { Metadata } from 'next';
import { FeatureDisabledPage } from '@/features/site/components/feature-disabled-page';
import { fetchSiteConfig } from '@/lib/api/site.api';
import { getFaqPosts } from '@/shared/api/blog-api';
import { FAQ_PAGE_META } from '@/shared/config/faq-page';
import { FaqPageView } from '@/widgets/faq/faq-page-view';

export const metadata: Metadata = {
  title: FAQ_PAGE_META.title,
  description: FAQ_PAGE_META.description,
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

  return <FaqPageView posts={posts} />;
}
