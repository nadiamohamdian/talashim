import Link from 'next/link';
import type { BlogPostSidebarRelatedArticleItem } from '@/widgets/blog/blog-post-sidebar-related-articles';
import { StoreImage } from '@/shared/ui/store-image';

interface BlogPostSidebarRelatedArticleCardProps {
  item: BlogPostSidebarRelatedArticleItem;
}

export function BlogPostSidebarRelatedArticleCard({ item }: BlogPostSidebarRelatedArticleCardProps) {
  return (
    <article className="blog-post-sidebar-article-card">
      <Link href={item.href} className="blog-post-sidebar-article-link">
        <h3 className="blog-post-sidebar-article-title">{item.title}</h3>
        <div className="blog-post-sidebar-article-media">
          <StoreImage
            src={item.imageUrl}
            alt=""
            fill
            unoptimized
            className="blog-post-sidebar-article-image"
            sizes="60px"
          />
        </div>
      </Link>
    </article>
  );
}
