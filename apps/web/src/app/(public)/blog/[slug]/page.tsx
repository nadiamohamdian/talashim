import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { RichHtmlContent } from '@/shared/ui/rich-html-content';
import { StoreImage } from '@/shared/ui/store-image';
import { FeatureDisabledPage } from '@/features/site/components/feature-disabled-page';
import { fetchSiteConfig } from '@/lib/api/site.api';
import { getBlogPostBySlug } from '@/shared/api/blog-api';
import { formatPersianDate } from '@/shared/lib/persian-date';

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
  const post = await getBlogPostBySlug(slug);
  if (!post) {
    notFound();
  }

  return (
    <article className="mx-auto max-w-4xl space-y-8">
      <Link
        href="/blog"
        className="inline-flex text-sm font-medium text-amber-700 transition hover:text-amber-800"
      >
        ← بازگشت به مجله
      </Link>

      <header className="space-y-4">
        <p className="text-sm font-medium text-amber-700">مجله طلا</p>
        <h1 className="text-3xl font-bold text-stone-950 dark:text-zinc-50">{post.title}</h1>
        <p className="text-sm text-stone-500 dark:text-zinc-400">
          {formatPersianDate(post.publishedAt)}
        </p>
        {post.excerpt ? (
          <p className="max-w-2xl text-base leading-8 text-stone-600 dark:text-zinc-400">
            {post.excerpt}
          </p>
        ) : null}
      </header>

      {post.coverImageUrl ? (
        <div className="relative aspect-[16/9] overflow-hidden rounded-[var(--radius-xl,0.875rem)] bg-nude-50">
          <StoreImage
            src={post.coverImageUrl}
            alt={post.title}
            fill
            className="object-cover"
            sizes="(max-width: 896px) 100vw, 896px"
            priority
          />
        </div>
      ) : null}

      <RichHtmlContent
        html={post.content}
        className="prose prose-stone max-w-none text-base leading-8 text-stone-700 dark:text-zinc-300 [&_p]:mb-4"
      />
    </article>
  );
}
