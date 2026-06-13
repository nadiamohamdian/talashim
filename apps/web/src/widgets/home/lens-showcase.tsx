'use client';

import { useState } from 'react';
import { createPortal } from 'react-dom';
import Link from 'next/link';
import type { LensShowcaseDemoItem } from '@/shared/config/lens-showcase-demo';
import { LensVideoPopup } from '@/widgets/home/lens-video-popup';

interface LensShowcaseProps {
  items: LensShowcaseDemoItem[];
}

export function LensShowcase({ items }: LensShowcaseProps) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  return (
    <>
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
            {items.map((item, index) => (
              <LensShowcaseCard
                key={item.id}
                item={item}
                onOpen={() => setActiveIndex(index)}
              />
            ))}
          </div>
        </div>
      </section>

      {activeIndex !== null
        ? createPortal(
            <LensVideoPopup
              items={items}
              activeIndex={activeIndex}
              onClose={() => setActiveIndex(null)}
              onNavigate={setActiveIndex}
            />,
            document.body,
          )
        : null}
    </>
  );
}

function LensShowcaseCard({
  item,
  onOpen,
}: {
  item: LensShowcaseDemoItem;
  onOpen: () => void;
}) {
  return (
    <button
      type="button"
      className="lens-showcase-card"
      role="listitem"
      onClick={onOpen}
      aria-label={item.title ?? 'مشاهده ویدیو لنز طلاشیم'}
    >
      {item.videoUrl ? (
        <video
          className="lens-showcase-video"
          src={item.videoUrl}
          poster={item.thumbnailUrl}
          playsInline
          muted
          loop
          preload="metadata"
          tabIndex={-1}
          aria-hidden
        />
      ) : (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={item.thumbnailUrl}
          alt=""
          className="lens-showcase-poster"
          loading="lazy"
          decoding="async"
        />
      )}
    </button>
  );
}
