import { getBlogPosts } from '@/shared/api/blog-api';
import {
  HOME_MAGAZINE_COVER_IMAGE,
  HOME_MAGAZINE_DEMO_ITEMS,
  HOME_MAGAZINE_DEMO_EXCERPT,
  type HomeMagazineArticleItem,
} from '@/shared/config/home-magazine-demo';
import { HomeMagazineCarousel } from '@/widgets/home/home-magazine-carousel';

const MAGAZINE_POST_LIMIT = 12;

function stripHtml(value: string): string {
  return value.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
}

function formatMagazineExcerpt(value: string): string {
  const text = stripHtml(value);
  if (text.length <= 108) {
    return text;
  }
  return `${text.slice(0, 108).trim()}...`;
}

function mapBlogPostsToItems(
  posts: Awaited<ReturnType<typeof getBlogPosts>>,
): HomeMagazineArticleItem[] {
  return posts
    .filter((post) => Boolean(post.slug?.trim()))
    .slice(0, MAGAZINE_POST_LIMIT)
    .map((post) => ({
      id: post.id,
      title: post.title,
      excerpt: formatMagazineExcerpt(post.excerpt || post.content || HOME_MAGAZINE_DEMO_EXCERPT),
      imageUrl: post.coverImageUrl?.trim() || HOME_MAGAZINE_COVER_IMAGE,
      href: `/blog/${encodeURIComponent(post.slug.trim())}`,
    }));
}

export async function HomeMagazineShowcase() {
  let items = HOME_MAGAZINE_DEMO_ITEMS;

  try {
    const posts = await getBlogPosts();
    if (posts.length > 0) {
      items = mapBlogPostsToItems(posts);
    }
  } catch {
    items = HOME_MAGAZINE_DEMO_ITEMS;
  }

  return (
    <section className="home-magazine-showcase" aria-labelledby="home-magazine-title">
      <div className="home-magazine-showcase-inner">
        <HomeMagazineCarousel items={items} />
      </div>
    </section>
  );
}
