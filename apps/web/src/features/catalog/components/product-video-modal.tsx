'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { createPortal } from 'react-dom';
import type { ProductVideo } from '@sadafgold/types';
import type { HomeProductCarouselItem } from '@/shared/config/storefront-ia';
import { formatPrice } from '@/shared/lib/format-price';
import { toPersianDigits } from '@/shared/lib/to-persian-digits';
import { StoreImage } from '@/shared/ui/store-image';

interface ProductVideoModalProps {
  open: boolean;
  video: ProductVideo | null;
  videos?: ProductVideo[];
  relatedProducts?: HomeProductCarouselItem[];
  onClose: () => void;
}

const VIDEO_MODAL_RELATED_LIMIT = 3;

function isAllowedVideoUrl(url: string): boolean {
  try {
    const parsed = new URL(url, typeof window !== 'undefined' ? window.location.origin : 'https://localhost');
    return parsed.protocol === 'https:' || parsed.protocol === 'http:';
  } catch {
    return false;
  }
}

function resolveSafeVideoUrl(video: ProductVideo | null): string | null {
  const url = video?.videoUrl.trim() ?? '';
  return url && isAllowedVideoUrl(url) ? url : null;
}

export function ProductVideoModal({
  open,
  video,
  videos = [],
  relatedProducts = [],
  onClose,
}: ProductVideoModalProps) {
  const [mounted, setMounted] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  const playlist = useMemo(
    () =>
      [...videos]
        .filter((item) => item.videoUrl.trim().length > 0)
        .sort((a, b) => a.sortOrder - b.sortOrder),
    [videos],
  );

  const activeVideo = playlist[activeIndex] ?? video;
  const safeVideoUrl = useMemo(() => resolveSafeVideoUrl(activeVideo), [activeVideo]);

  const overlayProducts = useMemo(
    () => relatedProducts.slice(0, VIDEO_MODAL_RELATED_LIMIT),
    [relatedProducts],
  );

  const resetAndClose = useCallback(() => {
    setProgress(0);
    setActiveIndex(0);
    onClose();
  }, [onClose]);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!open) {
      return undefined;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        resetAndClose();
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [open, resetAndClose]);

  useEffect(() => {
    if (!open || !video) {
      return;
    }

    const initialIndex = playlist.findIndex((item) => item.id === video.id);
    setActiveIndex(initialIndex >= 0 ? initialIndex : 0);
    setProgress(0);
  }, [open, video, playlist]);

  const goToPrevVideo = () => {
    if (playlist.length <= 1) {
      return;
    }
    setProgress(0);
    setActiveIndex((index) => (index - 1 + playlist.length) % playlist.length);
  };

  const goToNextVideo = () => {
    if (playlist.length <= 1) {
      return;
    }
    setProgress(0);
    setActiveIndex((index) => (index + 1) % playlist.length);
  };

  const handleTimeUpdate = () => {
    const element = videoRef.current;
    if (!element || !Number.isFinite(element.duration) || element.duration <= 0) {
      return;
    }
    setProgress((element.currentTime / element.duration) * 100);
  };

  const togglePlayback = () => {
    const element = videoRef.current;
    if (!element) {
      return;
    }
    if (element.paused) {
      void element.play();
      return;
    }
    element.pause();
  };

  if (!mounted || !open || !activeVideo) {
    return null;
  }

  const showNav = playlist.length > 1;

  return createPortal(
    <div className="product-video-modal" role="dialog" aria-modal="true" aria-label={activeVideo.title}>
      <button
        type="button"
        className="product-video-modal-overlay"
        aria-label="بستن ویدیو"
        onClick={resetAndClose}
      />

      <div className="product-video-modal-panel">
        <button
          type="button"
          className="product-video-modal-close"
          aria-label="بستن"
          onClick={resetAndClose}
        >
          <span className="product-video-modal-close-line product-video-modal-close-line--a" aria-hidden />
          <span className="product-video-modal-close-line product-video-modal-close-line--b" aria-hidden />
        </button>

        <button
          type="button"
          className="product-video-modal-nav product-video-modal-nav--prev"
          aria-label="ویدیوی قبلی"
          disabled={!showNav}
          onClick={goToPrevVideo}
        >
          <span className="product-video-modal-nav-glyph" aria-hidden />
        </button>
        <button
          type="button"
          className="product-video-modal-nav product-video-modal-nav--next"
          aria-label="ویدیوی بعدی"
          disabled={!showNav}
          onClick={goToNextVideo}
        >
          <span className="product-video-modal-nav-glyph" aria-hidden />
        </button>

        <div className="product-video-modal-frame">
          {safeVideoUrl ? (
            <video
              ref={videoRef}
              key={safeVideoUrl}
              className="product-video-modal-player"
              src={safeVideoUrl}
              poster={activeVideo.thumbnailUrl?.trim() || undefined}
              playsInline
              preload="metadata"
              onClick={togglePlayback}
              onTimeUpdate={handleTimeUpdate}
            />
          ) : (
            <div className="product-video-modal-fallback" role="img" aria-label={activeVideo.title}>
              {activeVideo.thumbnailUrl ? (
                <StoreImage
                  src={activeVideo.thumbnailUrl}
                  alt=""
                  fill
                  className="product-video-modal-fallback-image"
                  sizes="308px"
                />
              ) : null}
            </div>
          )}

          {(overlayProducts.length > 0 || safeVideoUrl) ? (
            <div className="product-video-modal-bottom">
              {safeVideoUrl ? (
                <div className="product-video-modal-progress-wrap" aria-hidden>
                  <div className="product-video-modal-progress-track">
                    <div
                      className="product-video-modal-progress-fill"
                      style={{ height: `${Math.min(100, Math.max(0, progress))}%` }}
                    />
                  </div>
                </div>
              ) : null}

              {overlayProducts.length > 0 ? (
              <div className="product-video-modal-products">
                {overlayProducts.map((item) => (
                  <Link
                    key={item.id}
                    href={item.href ?? '/products'}
                    className="product-video-modal-product"
                    onClick={resetAndClose}
                  >
                    <span className="product-video-modal-product-arrow" aria-hidden>
                      <svg viewBox="0 0 10 6" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                      </svg>
                    </span>
                    <span className="product-video-modal-product-info">
                      <span className="product-video-modal-product-title">{item.title}</span>
                      <span className="product-video-modal-product-price">
                        {formatPrice(item.priceToman)} تومان
                      </span>
                      <span className="product-video-modal-product-weight">
                        {toPersianDigits(item.weightGram)} گرم
                      </span>
                    </span>
                    <span className="product-video-modal-product-thumb">
                      <StoreImage
                        src={item.imageUrl}
                        alt=""
                        fill
                        className="product-video-modal-product-image"
                        sizes="60px"
                      />
                    </span>
                  </Link>
                ))}
              </div>
              ) : null}
            </div>
          ) : null}
        </div>
      </div>
    </div>,
    document.body,
  );
}
