'use client';

import type { BlogPostSummary } from '@sadafgold/types';
import { DEMO_FAQ_ITEMS, FAQ_PAGE_META, type FaqPageItem } from '@/shared/config/faq-page';
import { filterPublishedBlogPosts } from '@/shared/lib/published-blog-posts';
import { FaqAccordion } from '@/widgets/faq/faq-accordion';

interface FaqPageViewProps {
  posts: BlogPostSummary[];
}

function mapPostsToItems(posts: BlogPostSummary[]): FaqPageItem[] {
  return posts.map((post) => ({
    id: post.id,
    question: post.title,
    answer: post.content?.trim() || post.excerpt,
  }));
}

export function FaqPageView({ posts }: FaqPageViewProps) {
  const visiblePosts = filterPublishedBlogPosts(posts);
  const items = visiblePosts.length > 0 ? mapPostsToItems(visiblePosts) : DEMO_FAQ_ITEMS;

  return (
    <div className="faq-page store-chrome-light store-minimal-header">
      <div className="faq-page-inner">
        <h1 className="faq-page-title">{FAQ_PAGE_META.title}</h1>
        <FaqAccordion items={items} defaultOpenIndices={[2, 3]} />
      </div>
    </div>
  );
}
