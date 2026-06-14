'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import type { ProductVideo } from '@sadafgold/types';

interface ProductVideoModalProps {
  open: boolean;
  video: ProductVideo | null;
  onClose: () => void;
}

function isAllowedVideoUrl(url: string): boolean {
  try {
    const parsed = new URL(url, typeof window !== 'undefined' ? window.location.origin : 'https://localhost');
    return parsed.protocol === 'https:' || parsed.protocol === 'http:';
  } catch {
    return false;
  }
}

export function ProductVideoModal({ open, video, onClose }: ProductVideoModalProps) {
  const [mounted, setMounted] = useState(false);

  const safeVideoUrl = useMemo(() => {
    const url = video?.videoUrl.trim() ?? '';
    return url && isAllowedVideoUrl(url) ? url : null;
  }, [video?.videoUrl]);

  const resetAndClose = useCallback(() => {
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

  if (!mounted || !open || !video) {
    return null;
  }

  return createPortal(
    <div className="product-video-modal" role="dialog" aria-modal="true" aria-label={video.title}>
      <button
        type="button"
        className="product-video-modal-overlay"
        aria-label="بستن ویدیو"
        onClick={resetAndClose}
      />

      <div className="product-video-modal-panel">
        <div className="product-video-modal-head">
          <h2 className="product-video-modal-title">{video.title}</h2>
          <button type="button" className="product-video-modal-close" onClick={resetAndClose}>
            بستن
          </button>
        </div>

        <div className="product-video-modal-frame">
          {safeVideoUrl ? (
            <video
              key={safeVideoUrl}
              className="product-video-modal-player"
              src={safeVideoUrl}
              poster={video.thumbnailUrl?.trim() || undefined}
              controls
              playsInline
              preload="metadata"
            />
          ) : (
            <p className="product-video-modal-empty">آدرس ویدیو معتبر نیست.</p>
          )}
        </div>
      </div>
    </div>,
    document.body,
  );
}
