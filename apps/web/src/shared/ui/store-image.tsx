'use client';

import Image, { type ImageProps } from 'next/image';
import { useCallback, useEffect, useState } from 'react';
import { cn } from '@sadafgold/ui';
import {
  DEFAULT_PRODUCT_IMAGE,
  IMAGE_MAX_RETRIES,
  IMAGE_RETRY_BASE_MS,
} from '@/shared/config/images';
import { isNextImageHostAllowed } from '@/shared/config/image-hosts';

function appendRetryToken(src: string, attempt: number): string {
  if (src.startsWith('/')) {
    const separator = src.includes('?') ? '&' : '?';
    return `${src}${separator}retry=${attempt}&t=${Date.now()}`;
  }

  try {
    const url = new URL(src);
    url.searchParams.set('retry', String(attempt));
    url.searchParams.set('t', String(Date.now()));
    return url.toString();
  } catch {
    return src;
  }
}

export type StoreImageProps = Omit<ImageProps, 'src' | 'onError' | 'onLoadingComplete'> & {
  src: string;
  fallbackSrc?: string;
};

function NativeStoreImage({
  src,
  alt,
  className,
  fill,
  sizes,
  width,
  height,
  onError,
}: {
  src: string;
  alt: string;
  className?: string;
  fill?: boolean;
  sizes?: string;
  width?: number | `${number}`;
  height?: number | `${number}`;
  onError: () => void;
}) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={alt}
      sizes={sizes}
      width={fill ? undefined : width}
      height={fill ? undefined : height}
      className={cn(fill && 'absolute inset-0 h-full w-full', className)}
      onError={onError}
      loading="lazy"
      decoding="async"
      draggable={false}
    />
  );
}

function ImageUnavailablePlaceholder({
  alt,
  className,
  fill,
}: {
  alt: string;
  className?: string;
  fill?: boolean;
}) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center gap-1 bg-nude-100 text-muted',
        fill && 'absolute inset-0',
        className,
      )}
      aria-label={alt}
    >
      <svg
        viewBox="0 0 24 24"
        className="h-8 w-8 opacity-40"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        aria-hidden
      >
        <rect x="3" y="5" width="18" height="14" rx="2" />
        <path d="M8 11l3 3 5-6" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      <span className="text-[10px]">تصویر در دسترس نیست</span>
    </div>
  );
}

export function StoreImage({
  src,
  fallbackSrc = DEFAULT_PRODUCT_IMAGE,
  alt,
  className,
  fill,
  sizes,
  width,
  height,
  ...props
}: StoreImageProps) {
  const normalizedSrc = src?.trim() ?? '';
  const normalizedFallback = fallbackSrc?.trim() ?? '';
  const [attempt, setAttempt] = useState(0);
  const [currentSrc, setCurrentSrc] = useState(normalizedSrc || normalizedFallback);
  const [usingFallback, setUsingFallback] = useState(!normalizedSrc && Boolean(normalizedFallback));
  const [hardFailed, setHardFailed] = useState(false);

  useEffect(() => {
    const nextSrc = normalizedSrc || normalizedFallback;
    setCurrentSrc(nextSrc);
    setAttempt(0);
    setUsingFallback(!normalizedSrc && Boolean(normalizedFallback));
    setHardFailed(!nextSrc);
  }, [normalizedSrc, normalizedFallback]);

  const handleError = useCallback(() => {
    if (!usingFallback && attempt < IMAGE_MAX_RETRIES) {
      const nextAttempt = attempt + 1;
      window.setTimeout(() => {
        setAttempt(nextAttempt);
        setCurrentSrc(appendRetryToken(normalizedSrc || currentSrc, nextAttempt));
      }, IMAGE_RETRY_BASE_MS * nextAttempt);
      return;
    }

    if (!usingFallback && normalizedFallback && currentSrc !== normalizedFallback) {
      setUsingFallback(true);
      setAttempt(0);
      setCurrentSrc(normalizedFallback);
      return;
    }

    setHardFailed(true);
  }, [attempt, normalizedSrc, normalizedFallback, currentSrc, usingFallback]);

  if (hardFailed || !currentSrc) {
    return <ImageUnavailablePlaceholder alt={alt} className={className} fill={fill} />;
  }

  const useNativeImage = !isNextImageHostAllowed(currentSrc) || props.unoptimized === true;

  if (useNativeImage) {
    return (
      <NativeStoreImage
        src={currentSrc}
        alt={alt}
        className={className}
        fill={fill}
        sizes={sizes}
        width={width}
        height={height}
        onError={handleError}
      />
    );
  }

  return (
    <Image
      {...props}
      fill={fill}
      sizes={sizes}
      width={width}
      height={height}
      src={currentSrc}
      alt={alt}
      className={className}
      onError={handleError}
      draggable={false}
    />
  );
}
