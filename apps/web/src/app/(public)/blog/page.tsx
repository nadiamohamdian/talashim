import type { Metadata } from 'next';
import { FeatureGate } from '@/features/site/components/feature-gate';
import { getBlogPosts } from '@/shared/api/blog-api';
import { BlogList } from '@/widgets/blog/blog-list';

export const metadata: Metadata = {
  title: 'مجله طلا',
  description: 'مقالات، راهنماها و تحلیل بازار طلا',
};

export default async function BlogPage() {
  const posts = await getBlogPosts();

  return (
    <FeatureGate flag="enableBlog">
      <div className="space-y-6">
        <div>
          <p className="text-sm font-medium text-amber-700">مجله طلا</p>
          <h1 className="mt-3 text-3xl font-bold text-stone-950 dark:text-zinc-50">
            مجله و تحلیل بازار
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-stone-600 dark:text-zinc-400">
            دسترسی عمومی برای مهمانان و سئو.
          </p>
        </div>
        <BlogList posts={posts} />
      </div>
    </FeatureGate>
  );
}
