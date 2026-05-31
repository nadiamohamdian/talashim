import type { BlogPostSummary } from '@sadafgold/types';
import { PublicPageShell } from '@/widgets/content/public-page-shell';

interface FaqListProps {
  posts: BlogPostSummary[];
}

export function FaqList({ posts }: FaqListProps) {
  if (!posts.length) {
    return <p className="text-sm text-muted">سوالی ثبت نشده است.</p>;
  }

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      {posts.map((post) => (
        <details key={post.id} className="card-luxury group p-5">
          <summary className="cursor-pointer list-none font-semibold text-foreground marker:content-none">
            {post.title}
          </summary>
          <p className="mt-3 text-sm leading-7 text-muted">{post.excerpt}</p>
        </details>
      ))}
    </div>
  );
}

export function FaqPageShell({ posts }: FaqListProps) {
  return (
    <PublicPageShell
      eyebrow="پشتیبانی"
      title="سوالات متداول"
      description="پاسخ‌های رسمی از پایگاه دانش."
    >
      <FaqList posts={posts} />
    </PublicPageShell>
  );
}
