'use client';

import type { LensShowcaseDemoItem } from '@/shared/config/lens-showcase-demo';
import { LENS_ARCHIVE_DEFAULT_TITLE, LENS_ARCHIVE_FALLBACK_POSTER } from '@/shared/config/lens-page';

interface LensArchiveCardProps {
  item: LensShowcaseDemoItem;
  onOpen: () => void;
}

export function LensArchiveCard({ item, onOpen }: LensArchiveCardProps) {
  const posterUrl = item.thumbnailUrl.trim() || LENS_ARCHIVE_FALLBACK_POSTER;
  const title = item.title?.trim() || LENS_ARCHIVE_DEFAULT_TITLE;
  const hasVideo = item.videoUrl.length > 0;

  return (
    <article className="lens-archive-card">
      <button
        type="button"
        className="lens-archive-card-button"
        onClick={onOpen}
        aria-label={`پخش ${title}`}
      >
        <div className="lens-archive-card-media">
          {hasVideo ? (
            <video
              className="lens-archive-card-video"
              src={item.videoUrl}
              poster={posterUrl}
              playsInline
              muted
              loop
              preload="metadata"
              tabIndex={-1}
              aria-hidden
              draggable={false}
            />
          ) : (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={posterUrl}
              alt=""
              className="lens-archive-card-poster"
              loading="lazy"
              decoding="async"
              draggable={false}
            />
          )}
          <span className="lens-archive-card-play" aria-hidden>
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M8 5v14l11-7z" />
            </svg>
          </span>
        </div>

        <div className="lens-archive-card-copy">
          <h2 className="lens-archive-card-title">{title}</h2>
        </div>
      </button>
    </article>
  );
}
