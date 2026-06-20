import { BlogPostSidebarRelatedArticleCard } from '@/widgets/blog/blog-post-sidebar-related-article-card';

export interface BlogPostSidebarRelatedArticleItem {
  id: string;
  title: string;
  imageUrl: string;
  href: string;
}

interface BlogPostSidebarRelatedArticlesProps {
  items: BlogPostSidebarRelatedArticleItem[];
}

export function BlogPostSidebarRelatedArticles({ items }: BlogPostSidebarRelatedArticlesProps) {
  if (!items.length) {
    return null;
  }

  return (
    <section className="blog-post-sidebar-related" aria-labelledby="blog-post-sidebar-related-title">
      <h2 id="blog-post-sidebar-related-title" className="blog-post-sidebar-related-title">
        مقالات مرتبط
      </h2>
      <ul className="blog-post-sidebar-related-list">
        {items.map((item) => (
          <li key={item.id} className="blog-post-sidebar-related-item">
            <BlogPostSidebarRelatedArticleCard item={item} />
          </li>
        ))}
      </ul>
    </section>
  );
}
