import type { Metadata } from 'next';
import { FaqPageShell } from '@/features/content/components/faq-list';
import { FeatureGate } from '@/features/site/components/feature-gate';
import { productApi } from '@/lib/api/product.api';

export const metadata: Metadata = {
  title: 'سوالات متداول',
};

export const dynamic = 'force-dynamic';

export default async function FaqPage() {
  const posts = await productApi.getFaqPosts();
  return (
    <FeatureGate flag="enableBlog">
      <FaqPageShell posts={posts} />
    </FeatureGate>
  );
}
