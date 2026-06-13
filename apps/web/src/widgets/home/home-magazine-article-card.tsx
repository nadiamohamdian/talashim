import Link from 'next/link';
import type { HomeMagazineArticleItem } from '@/shared/config/home-magazine-demo';
import { HOME_MAGAZINE_READ_MORE_LABEL } from '@/shared/config/home-magazine-demo';
import { StoreImage } from '@/shared/ui/store-image';

interface HomeMagazineArticleCardProps {
  item: HomeMagazineArticleItem;
}

function MagazineReadMoreArrow() {
  return (
    <svg
      viewBox="0 0 14 8"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
      className="home-magazine-article-card-read-more-icon"
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

export function HomeMagazineArticleCard({ item }: HomeMagazineArticleCardProps) {
  return (
    <article className="home-magazine-article-card" role="listitem">
      <Link href={item.href} className="home-magazine-article-card-link">
        <div className="home-magazine-article-card-copy">
          <h3 className="home-magazine-article-card-title">{item.title}</h3>
          <p className="home-magazine-article-card-excerpt">{item.excerpt}</p>
          <span className="home-magazine-article-card-read-more">
            {HOME_MAGAZINE_READ_MORE_LABEL}
            <MagazineReadMoreArrow />
          </span>
        </div>

        <div className="home-magazine-article-card-media">
          <StoreImage
            src={item.imageUrl}
            alt=""
            fill
            unoptimized
            className="home-magazine-article-card-image"
            sizes="(min-width: 768px) 33vw, 130px"
          />
        </div>

        <span className="home-magazine-article-card-overlay" aria-hidden />
        <span className="home-magazine-article-card-frame" aria-hidden />
      </Link>
    </article>
  );
}
