'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import type { PublicCmsBanner } from '@sadafgold/types';
import { StoreImage } from '@/shared/ui/store-image';

interface BannerCarouselProps {
  banners: PublicCmsBanner[];
  autoRotateMs?: number;
}

export function BannerCarousel({ banners, autoRotateMs = 6000 }: BannerCarouselProps) {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    if (banners.length <= 1) {
      return;
    }

    const timer = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % banners.length);
    }, autoRotateMs);

    return () => window.clearInterval(timer);
  }, [banners.length, autoRotateMs]);

  if (!banners.length) {
    return null;
  }

  const active = banners[activeIndex] ?? banners[0];
  if (!active) {
    return null;
  }

  const content = (
    <article className="relative overflow-hidden rounded-2xl border border-nude-200 bg-nude-50/60 shadow-[var(--shadow-soft)]">
      <div className="relative aspect-[21/7] w-full min-h-[140px] md:aspect-[21/6]">
        <StoreImage
          src={active.imageUrl}
          alt={active.title}
          fill
          className="object-cover"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-l from-foreground/70 via-foreground/25 to-transparent" />
        <div className="absolute inset-y-0 left-0 flex max-w-xl flex-col justify-center px-6 py-5 md:px-10">
          <h2 className="text-xl font-bold text-white md:text-2xl">{active.title}</h2>
          {active.subtitle ? (
            <p className="mt-2 text-sm leading-7 text-white/90 md:text-base">{active.subtitle}</p>
          ) : null}
          {active.linkUrl ? (
            <span className="mt-4 inline-flex w-fit rounded-full bg-gold px-5 py-2 text-sm font-semibold text-white">
              مشاهده
            </span>
          ) : null}
        </div>
      </div>
      {banners.length > 1 ? (
        <div className="flex items-center justify-center gap-2 border-t border-nude-200 bg-white/90 px-4 py-3">
          {banners.map((banner, index) => (
            <button
              key={banner.id}
              type="button"
              aria-label={`بنر ${index + 1}`}
              className={`h-2.5 rounded-full transition ${
                index === activeIndex ? 'w-8 bg-gold' : 'w-2.5 bg-nude-300'
              }`}
              onClick={() => setActiveIndex(index)}
            />
          ))}
        </div>
      ) : null}
    </article>
  );

  if (active.linkUrl) {
    return (
      <Link href={active.linkUrl} className="block transition hover:opacity-95">
        {content}
      </Link>
    );
  }

  return content;
}
