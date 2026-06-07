import Link from 'next/link';
import type { BlogPostSummary } from '@sadafgold/types';
import { formatPersianDate } from '@/shared/lib/persian-date';
import { StoreImage } from '@/shared/ui/store-image';

interface BlogListProps {
  posts: BlogPostSummary[];
}

export function BlogList({ posts }: BlogListProps) {
  if (!posts.length) {
    return (
      <p className="text-sm leading-7 text-stone-600 dark:text-zinc-400">
        هنوز مقاله‌ای منتشر نشده است.
      </p>
    );
  }

  return (
    <div className="grid gap-6 md:grid-cols-2">
      {posts.map((post) => (
        <article key={post.id} className="group h-full">
          <Link
            href={`/blog/${encodeURIComponent(post.slug)}`}
            className="block h-full rounded-[var(--radius-xl,0.875rem)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-600 focus-visible:ring-offset-2"
          >
            <div className="card-luxury flex h-full flex-col overflow-hidden transition hover:-translate-y-1 hover:shadow-lg">
              {post.coverImageUrl ? (
                <div className="relative aspect-[16/10] overflow-hidden bg-nude-50">
                  <StoreImage
                    src={post.coverImageUrl}
                    alt={post.title}
                    fill
                    className="object-cover transition duration-500 group-hover:scale-105"
                    sizes="(max-width: 768px) 100vw, 50vw"
                  />
                </div>
              ) : null}
              <div className="flex flex-1 flex-col p-6">
                <p className="text-xs font-medium text-amber-700">
                  {formatPersianDate(post.publishedAt)}
                </p>
                <h3 className="mt-3 text-xl font-bold text-stone-950 transition group-hover:text-amber-800 dark:text-zinc-50">
                  {post.title}
                </h3>
                <p className="mt-4 line-clamp-3 flex-1 text-sm leading-7 text-stone-600 dark:text-zinc-400">
                  {post.excerpt}
                </p>
                <p className="mt-4 text-sm font-semibold text-amber-700">ادامه مطلب ←</p>
              </div>
            </div>
          </Link>
        </article>
      ))}
    </div>
  );
}
