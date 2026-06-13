import Link from 'next/link';
import {
  HOME_MAGAZINE_COVER_IMAGE,
  type HomeMagazineArticleItem,
} from '@/shared/config/home-magazine-demo';
import { StoreImage } from '@/shared/ui/store-image';

function MagazineArticleArrow() {
  return (
    <svg viewBox="0 0 11 8" fill="none" aria-hidden className="home-magazine-article-card-arrow">
      <path
        d="M10.5 4H0.5M0.5 4L4 0.5M0.5 4L4 7.5"
        stroke="currentColor"
        strokeWidth="1"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

interface HomeMagazineArticleCardProps {
  item: HomeMagazineArticleItem;
}

export function HomeMagazineArticleCard({ item }: HomeMagazineArticleCardProps) {
  return (
    <article className="home-magazine-article-card" role="listitem">
      <Link href={item.href} className="home-magazine-article-card-link">
        <div className="home-magazine-article-card-media">
          <StoreImage
            src={HOME_MAGAZINE_COVER_IMAGE}
            alt=""
            fill
            unoptimized
            className="home-magazine-article-card-image"
            sizes="130px"
          />
        </div>

        <div className="home-magazine-article-card-copy">
          <h3 className="home-magazine-article-card-title">{item.title}</h3>
          <p className="home-magazine-article-card-excerpt">{item.excerpt}</p>
          <span className="home-magazine-article-card-cta">
            <MagazineArticleArrow />
            <span>ادامه مطلب</span>
          </span>
        </div>
      </Link>
    </article>
  );
}
