import Link from 'next/link';
import type { BlogPostSummary } from '@sadafgold/types';
import { FaqList } from '@/features/content/components/faq-list';

interface HomeFaqSectionProps {
  posts: BlogPostSummary[];
}

export function HomeFaqSection({ posts }: HomeFaqSectionProps) {
  if (posts.length === 0) {
    return null;
  }

  return (
    <section className="container-store py-12 md:py-16">
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-medium tracking-widest text-gold-dark">پشتیبانی</p>
          <h2 className="mt-1 text-2xl font-bold text-foreground md:text-3xl">سوالات متداول</h2>
          <p className="mt-2 text-sm text-muted">پاسخ سریع به پرسش‌های رایج خریداران</p>
        </div>
        <Link href="/faq" className="text-sm font-medium text-gold-dark hover:underline">
          مشاهده همه ←
        </Link>
      </div>
      <FaqList posts={posts} />
    </section>
  );
}
