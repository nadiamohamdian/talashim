'use client';

import type { BlogPostSummary } from '@sadafgold/types';
import { filterPublishedBlogPosts } from '@/shared/lib/published-blog-posts';
import { RichHtmlContent } from '@/shared/ui/rich-html-content';
import { PublicPageShell } from '@/widgets/content/public-page-shell';

interface FaqListProps {
  posts: BlogPostSummary[];
}

export function FaqList({ posts }: FaqListProps) {
  const visiblePosts = filterPublishedBlogPosts(posts);

  if (!visiblePosts.length) {
    return <p className="text-sm text-muted">سوالی ثبت نشده است.</p>;
  }

  return (
    <div className="mx-auto max-w-2xl space-y-3">
      {visiblePosts.map((post) => (
        <details key={post.id} className="card-luxury group p-5">
          <summary className="cursor-pointer list-none text-base font-semibold text-foreground marker:content-none">
            <span className="flex items-start justify-between gap-3">
              <span>{post.title}</span>
              <span className="shrink-0 text-muted transition group-open:rotate-180" aria-hidden>
                ▾
              </span>
            </span>
          </summary>
          <div className="mt-4 border-t border-border pt-4">
            <RichHtmlContent
              html={post.content ?? post.excerpt}
              className="prose prose-sm max-w-none text-sm leading-8 text-muted [&_p]:mb-3"
            />
          </div>
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
