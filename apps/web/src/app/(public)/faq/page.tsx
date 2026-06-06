import type { Metadata } from 'next';
import { FaqPageShell } from '@/features/content/components/faq-list';
import { productApi } from '@/lib/api/product.api';

export const metadata: Metadata = {
  title: 'سوالات متداول',
};

export default async function FaqPage() {
  const posts = await productApi.getFaqPosts();
  return <FaqPageShell posts={posts} />;
}
