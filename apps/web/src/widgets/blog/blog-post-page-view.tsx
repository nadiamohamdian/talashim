import type { BlogPostDetails, BlogPostSummary, ProductSummary } from '@sadafgold/types';
import {
  BLOG_POST_DEMO_BODY,
  BLOG_POST_DEMO_BODY_SECOND,
  BLOG_POST_DEMO_TITLE,
  BLOG_POST_DEMO_TOC_ITEMS,
  BLOG_POST_FALLBACK_COVER,
  BLOG_POST_SECTION_TITLES,
} from '@/shared/config/blog-post-page';
import { injectHeadingIds } from '@/shared/lib/blog-post-toc';
import { formatPersianDate } from '@/shared/lib/persian-date';
import { RichHtmlContent } from '@/shared/ui/rich-html-content';
import { BlogPostRelatedArticleCard } from '@/widgets/blog/blog-post-related-article-card';
import { BlogPostRelatedProducts } from '@/widgets/blog/blog-post-related-products';
import { BlogPostReviewSection } from '@/widgets/blog/blog-post-review-section';
import { BlogPostSidebarRelatedArticles } from '@/widgets/blog/blog-post-sidebar-related-articles';
import { BlogPostTableOfContents } from '@/widgets/blog/blog-post-table-of-contents';

interface BlogPostPageViewProps {
  post: BlogPostDetails;
  relatedPosts: BlogPostSummary[];
  relatedProducts: ProductSummary[];
}

function stripHtml(value: string): string {
  return value.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
}

function hasRenderableContent(content: string): boolean {
  return stripHtml(content).length > 0;
}

function resolveContentHtml(content: string): string {
  if (!hasRenderableContent(content)) {
    return `<p>${BLOG_POST_DEMO_BODY}</p><h2>${BLOG_POST_DEMO_TITLE}</h2><p>${BLOG_POST_DEMO_BODY_SECOND}</p>`;
  }

  const text = stripHtml(content);
  const baseHtml = content.includes('<') ? content : `<p>${content.trim()}</p>`;

  if (text.length < 280) {
    return `${baseHtml}<p>${BLOG_POST_DEMO_BODY_SECOND}</p>`;
  }

  return baseHtml;
}

function resolveCoverImage(coverImageUrl: string | undefined): string {
  const normalized = coverImageUrl?.trim() ?? '';
  if (!normalized || normalized.startsWith('http')) {
    return BLOG_POST_FALLBACK_COVER;
  }
  return normalized;
}

function mapRelatedPosts(
  posts: BlogPostSummary[],
  currentSlug: string,
): Array<{ id: string; title: string; imageUrl: string; href: string }> {
  const items = posts
    .filter((item) => item.slug !== currentSlug)
    .slice(0, 5)
    .map((item) => ({
      id: item.id,
      title: item.title,
      imageUrl: resolveCoverImage(item.coverImageUrl),
      href: `/blog/${encodeURIComponent(item.slug)}`,
    }));

  if (items.length > 0) {
    return items;
  }

  return Array.from({ length: 5 }, (_, index) => ({
    id: `blog-related-demo-${index + 1}`,
    title: BLOG_POST_DEMO_TITLE,
    imageUrl: BLOG_POST_FALLBACK_COVER,
    href: '/blog',
  }));
}

export function BlogPostPageView({
  post,
  relatedPosts,
  relatedProducts,
}: BlogPostPageViewProps) {
  const coverImage = resolveCoverImage(post.coverImageUrl);
  const rawContentHtml = resolveContentHtml(post.content);

  const { html: contentHtml, items: tocItems } = injectHeadingIds(rawContentHtml);
  const resolvedTocItems = tocItems.length > 0 ? tocItems : [...BLOG_POST_DEMO_TOC_ITEMS];
  const relatedArticleItems = mapRelatedPosts(relatedPosts, post.slug);

  return (
    <article className="blog-post-page store-chrome-light store-minimal-header">
      <div className="blog-post-shell">
        <div className="blog-post-layout">
          <aside className="blog-post-sidebar" aria-label="نوار کناری مقاله">
            <BlogPostTableOfContents items={resolvedTocItems} />
            <BlogPostSidebarRelatedArticles items={relatedArticleItems} />
          </aside>

          <div className="blog-post-main">
            <div className="blog-post-main-panel">
              <div className="blog-post-article-panel">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={coverImage}
                  alt=""
                  className="blog-post-hero-image"
                  decoding="async"
                  fetchPriority="high"
                />

                <div className="blog-post-title-wrap">
                  <span className="blog-post-title-accent" aria-hidden />
                  <h1 className="blog-post-title">{post.title}</h1>
                  <p className="blog-post-published-at">{formatPersianDate(post.publishedAt)}</p>
                </div>

                <RichHtmlContent html={contentHtml} className="blog-post-content" />
              </div>
            </div>
          </div>
        </div>

        <section className="blog-post-section blog-post-section--reviews blog-post-section--full" aria-labelledby="blog-post-reviews-title">
          <BlogPostReviewSection title={BLOG_POST_SECTION_TITLES.reviews} />
        </section>

        <section
          className="blog-post-section blog-post-mobile-related blog-post-section--full"
          aria-labelledby="blog-post-mobile-related-articles-title"
        >
          <h2 id="blog-post-mobile-related-articles-title" className="blog-post-section-title">
            {BLOG_POST_SECTION_TITLES.relatedArticles}
          </h2>
          <div className="blog-post-related-articles-track" role="list">
            {relatedArticleItems.slice(0, 3).map((item) => (
              <div key={item.id} className="blog-post-related-articles-item" role="listitem">
                <BlogPostRelatedArticleCard
                  title={item.title}
                  imageUrl={item.imageUrl}
                  href={item.href}
                />
              </div>
            ))}
          </div>
        </section>

        <section
          className="blog-post-section blog-post-section--products blog-post-section--full"
          aria-labelledby="blog-post-related-products-title"
        >
          <BlogPostRelatedProducts
            products={relatedProducts}
            title={
              <h2
                id="blog-post-related-products-title"
                className="blog-post-section-title blog-post-section-title--products"
              >
                <span className="blog-post-section-title-mobile">
                  {BLOG_POST_SECTION_TITLES.relatedProducts}
                </span>
                <span className="blog-post-section-title-desktop">
                  {BLOG_POST_SECTION_TITLES.relatedProductsDesktop}
                </span>
              </h2>
            }
          />
        </section>
      </div>
    </article>
  );
}
