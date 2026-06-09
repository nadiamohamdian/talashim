'use client';

import Link from 'next/link';
import type { PublicCmsLensVideo } from '@sadafgold/types';

const PLACEHOLDER_COUNT = 3;

interface LensShowcaseProps {
  videos: PublicCmsLensVideo[];
}

export function LensShowcase({ videos }: LensShowcaseProps) {
  const items =
    videos.length > 0
      ? videos
      : Array.from({ length: PLACEHOLDER_COUNT }, (_, index) => ({
          id: `placeholder-${index}`,
          title: null,
          videoUrl: '',
          thumbnailUrl: null,
          sortOrder: index,
        }));

  return (
    <section className="lens-showcase" aria-labelledby="lens-showcase-title">
      <div className="lens-showcase-inner">
        <div className="lens-showcase-header">
          <div className="lens-showcase-heading">
            <p className="lens-showcase-eyebrow">Talashim Lens</p>
            <h2 id="lens-showcase-title" className="lens-showcase-title">
              لنز طلاشیم
            </h2>
          </div>

          <Link href="/lens" className="lens-showcase-view-all">
            نمایش همه
          </Link>
        </div>

        <div className="lens-showcase-track" role="list">
          {items.map((item) => (
            <LensShowcaseCard key={item.id} video={item} isPlaceholder={!item.videoUrl} />
          ))}
        </div>
      </div>
    </section>
  );
}

function LensShowcaseCard({
  video,
  isPlaceholder,
}: {
  video: PublicCmsLensVideo;
  isPlaceholder: boolean;
}) {
  if (isPlaceholder) {
    return (
      <div className="lens-showcase-card lens-showcase-card-placeholder" role="listitem" aria-hidden>
        <span className="sr-only">جایگاه ویدیو</span>
      </div>
    );
  }

  return (
    <article className="lens-showcase-card" role="listitem">
      <video
        className="lens-showcase-video"
        src={video.videoUrl}
        poster={video.thumbnailUrl ?? undefined}
        playsInline
        muted
        loop
        preload="metadata"
        aria-label={video.title ?? 'ویدیو لنز طلاشیم'}
      />
    </article>
  );
}
