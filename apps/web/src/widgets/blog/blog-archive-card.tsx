import Link from 'next/link';
import type { BlogArchiveCardItem } from '@/shared/config/blog-page';
import { BLOG_ARCHIVE_READ_MORE_LABEL } from '@/shared/config/blog-page';
import { StoreImage } from '@/shared/ui/store-image';

interface BlogArchiveCardProps {
  item: BlogArchiveCardItem;
}

function BlogArchiveReadMoreArrow() {
  return (
    <svg
      viewBox="0 0 14 8"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
      className="blog-archive-card-read-more-icon"
    >
      <path
        d="M1 4H13M13 4L9.5 1M13 4L9.5 7"
        stroke="currentColor"
        strokeWidth="1"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function BlogArchiveCard({ item }: BlogArchiveCardProps) {
  const href = item.slug ? `/blog/${encodeURIComponent(item.slug)}` : '/blog';

  return (
    <article className="blog-archive-card">
      <Link href={href} className="blog-archive-card-link">
        <div className="blog-archive-card-copy">
          <h2 className="blog-archive-card-title">{item.title}</h2>
          <p className="blog-archive-card-excerpt">{item.excerpt}</p>
          <span className="blog-archive-card-read-more">
            {BLOG_ARCHIVE_READ_MORE_LABEL}
            <BlogArchiveReadMoreArrow />
          </span>
        </div>

        <div className="blog-archive-card-media">
          <StoreImage
            src={item.imageUrl}
            alt=""
            fill
            unoptimized
            className="blog-archive-card-image"
            sizes="(min-width: 768px) 130px, 34vw"
          />
        </div>
      </Link>
    </article>
  );
}
