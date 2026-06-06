import type { Metadata } from 'next';
import { Card } from '@sadafgold/ui';
import { getBlogPostBySlug } from '@/shared/api/blog-api';

interface BlogDetailsPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({
  params,
}: BlogDetailsPageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = await getBlogPostBySlug(slug);
  return {
    title: post.title,
    description: post.excerpt ?? post.content.slice(0, 160),
  };
}

export default async function BlogDetailsPage({ params }: BlogDetailsPageProps) {
  const { slug } = await params;
  const post = await getBlogPostBySlug(slug);

  return (
    <Card className="mx-auto max-w-4xl p-8">
      <p className="text-sm font-medium text-amber-700">مجله طلا</p>
      <h1 className="mt-3 text-3xl font-bold text-stone-950 dark:text-zinc-50">
        {post.title}
      </h1>
      <p className="mt-6 text-base leading-8 text-stone-700 dark:text-zinc-300">
        {post.content}
      </p>
    </Card>
  );
}
