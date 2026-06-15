import Link from 'next/link';

interface BlogPostRelatedArticleCardProps {
  title: string;
  imageUrl: string;
  href: string;
}

export function BlogPostRelatedArticleCard({
  title,
  imageUrl,
  href,
}: BlogPostRelatedArticleCardProps) {
  return (
    <article className="blog-post-related-article-card">
      <Link href={href} className="blog-post-related-article-link">
        <h3 className="blog-post-related-article-title">{title}</h3>
        <div className="blog-post-related-article-media">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={imageUrl}
            alt=""
            className="blog-post-related-article-image"
            loading="lazy"
            decoding="async"
          />
        </div>
      </Link>
    </article>
  );
}
