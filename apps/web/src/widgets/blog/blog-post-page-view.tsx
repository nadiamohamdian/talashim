import type { BlogPostDetails, BlogPostSummary, ProductSummary } from '@sadafgold/types';
import {
  BLOG_POST_DEMO_BODY,
  BLOG_POST_DEMO_BODY_SECOND,
  BLOG_POST_DEMO_TITLE,
  BLOG_POST_FALLBACK_COVER,
  BLOG_POST_SECTION_TITLES,
} from '@/shared/config/blog-post-page';
import { RichHtmlContent } from '@/shared/ui/rich-html-content';
import { BlogPostRelatedArticleCard } from '@/widgets/blog/blog-post-related-article-card';
import { BlogPostRelatedProducts } from '@/widgets/blog/blog-post-related-products';
import { BlogPostReviewSection } from '@/widgets/blog/blog-post-review-section';

interface BlogPostPageViewProps {
  post: BlogPostDetails;
  relatedPosts: BlogPostSummary[];
  relatedProducts: ProductSummary[];
}

function stripHtml(value: string): string {
  return value.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
}

function hasRenderableContent(content: string): boolean {
  const text = stripHtml(content);
  return text.length > 0;
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
    .slice(0, 3)
    .map((item) => ({
      id: item.id,
      title: item.title,
      imageUrl: resolveCoverImage(item.coverImageUrl),
      href: `/blog/${encodeURIComponent(item.slug)}`,
    }));

  if (items.length > 0) {
    return items;
  }

  return Array.from({ length: 2 }, (_, index) => ({
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
  const contentHtml = hasRenderableContent(post.content)
    ? post.content
    : `<p>${BLOG_POST_DEMO_BODY}</p><h2>${BLOG_POST_DEMO_TITLE}</h2><p>${BLOG_POST_DEMO_BODY_SECOND}</p>`;

  const relatedArticleItems = mapRelatedPosts(relatedPosts, post.slug);

  return (
    <article className="blog-post-page store-chrome-light store-minimal-header">
      <div className="blog-post-shell">
        <div className="blog-post-hero">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={coverImage}
            alt=""
            className="blog-post-hero-image"
            decoding="async"
            fetchPriority="high"
          />
        </div>

        <div className="blog-post-article-panel">
          <div className="blog-post-title-wrap">
            <span className="blog-post-title-accent" aria-hidden />
            <h1 className="blog-post-title">{post.title}</h1>
          </div>

          <RichHtmlContent html={contentHtml} className="blog-post-content" />
        </div>

        <div className="blog-post-sections">
          <section className="blog-post-section" aria-labelledby="blog-post-reviews-title">
            <h2 id="blog-post-reviews-title" className="blog-post-section-title">
              {BLOG_POST_SECTION_TITLES.reviews}
            </h2>
            <BlogPostReviewSection />
          </section>

          <section className="blog-post-section" aria-labelledby="blog-post-related-articles-title">
            <h2 id="blog-post-related-articles-title" className="blog-post-section-title">
              {BLOG_POST_SECTION_TITLES.relatedArticles}
            </h2>
            <div className="blog-post-related-articles-track" role="list">
              {relatedArticleItems.map((item) => (
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

          <section className="blog-post-section" aria-labelledby="blog-post-related-products-title">
            <h2 id="blog-post-related-products-title" className="blog-post-section-title">
              {BLOG_POST_SECTION_TITLES.relatedProducts}
            </h2>
            <BlogPostRelatedProducts products={relatedProducts} />
          </section>
        </div>
      </div>
    </article>
  );
}
