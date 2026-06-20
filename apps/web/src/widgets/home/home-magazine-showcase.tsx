import Link from 'next/link';
import { getBlogPosts } from '@/shared/api/blog-api';
import {
  HOME_MAGAZINE_COVER_IMAGE,
  HOME_MAGAZINE_DEMO_ITEMS,
  HOME_MAGAZINE_DEMO_EXCERPT,
  type HomeMagazineArticleItem,
} from '@/shared/config/home-magazine-demo';
import { HomeMagazineArticleCard } from '@/widgets/home/home-magazine-article-card';

function stripHtml(value: string): string {
  return value.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
}

function formatMagazineExcerpt(value: string): string {
  const text = stripHtml(value);
  if (text.length <= 108) return text;
  return `${text.slice(0, 108).trim()}...`;
}

function mapBlogPostsToItems(
  posts: Awaited<ReturnType<typeof getBlogPosts>>,
): HomeMagazineArticleItem[] {
  return posts.slice(0, 3).map((post) => ({
    id: post.id,
    title: post.title,
    excerpt: formatMagazineExcerpt(post.excerpt || post.content || HOME_MAGAZINE_DEMO_EXCERPT),
    imageUrl: HOME_MAGAZINE_COVER_IMAGE,
    href: `/blog/${post.slug}`,
  }));
}

function ensureThreeMagazineItems(items: HomeMagazineArticleItem[]): HomeMagazineArticleItem[] {
  if (items.length >= 3) {
    return items.slice(0, 3);
  }

  const padded = [...items];

  for (let index = items.length; index < 3; index += 1) {
    const fallback = HOME_MAGAZINE_DEMO_ITEMS[index] ?? HOME_MAGAZINE_DEMO_ITEMS[0];
    if (!fallback) {
      continue;
    }
    padded.push({
      ...fallback,
      id: `${fallback.id}-fill-${index}`,
    });
  }

  return padded;
}

export async function HomeMagazineShowcase() {
  let items = HOME_MAGAZINE_DEMO_ITEMS;

  try {
    const posts = await getBlogPosts();
    if (posts.length > 0) {
      items = ensureThreeMagazineItems(mapBlogPostsToItems(posts));
    }
  } catch {
    items = HOME_MAGAZINE_DEMO_ITEMS;
  }

  return (
    <section className="home-magazine-showcase" aria-labelledby="home-magazine-title">
      <div className="home-magazine-showcase-inner">
        <div className="home-magazine-showcase-header">
          <div className="home-magazine-showcase-heading">
            <h2 id="home-magazine-title" className="home-magazine-showcase-title">
              مجله طلاشیم
            </h2>
          </div>

          <Link href="/blog" className="home-magazine-showcase-view-all">
            نمایش همه
          </Link>
        </div>

        <div className="home-magazine-showcase-frame">
          <div className="home-magazine-showcase-track" role="list">
            {items.map((item) => (
              <HomeMagazineArticleCard key={item.id} item={item} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
