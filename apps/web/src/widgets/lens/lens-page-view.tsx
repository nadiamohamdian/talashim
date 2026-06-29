'use client';

import { useState } from 'react';
import { createPortal } from 'react-dom';
import type { LensShowcaseDemoItem } from '@/shared/config/lens-showcase-demo';
import { LENS_PAGE_META } from '@/shared/config/lens-page';
import { LensArchiveCard } from '@/widgets/lens/lens-archive-card';
import { LensArchivePagination } from '@/widgets/lens/lens-archive-pagination';
import { LensVideoPopup } from '@/widgets/home/lens-video-popup';

interface LensPageViewProps {
  items: LensShowcaseDemoItem[];
  currentPage: number;
  totalPages: number;
}

export function LensPageView({ items, currentPage, totalPages }: LensPageViewProps) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  return (
    <>
      <div className="lens-page store-chrome-light store-minimal-header">
        <div className="lens-page-inner">
          <h1 className="lens-page-title">{LENS_PAGE_META.title}</h1>

          {items.length === 0 ? (
            <p className="lens-page-empty">هنوز ویدیویی منتشر نشده است.</p>
          ) : (
            <ul className="lens-archive-list">
              {items.map((item, index) => (
                <li key={item.id} className="lens-archive-item">
                  <LensArchiveCard item={item} onOpen={() => setActiveIndex(index)} />
                </li>
              ))}
            </ul>
          )}

          <LensArchivePagination currentPage={currentPage} totalPages={totalPages} />
        </div>
      </div>

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
