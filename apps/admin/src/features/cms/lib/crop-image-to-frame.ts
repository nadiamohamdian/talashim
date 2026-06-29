import type { ImageFrameSpec } from './image-frame-spec';

export interface ImageFrameFocus {
  x: number;
  y: number;
}

export const DEFAULT_IMAGE_FRAME_FOCUS: ImageFrameFocus = {
  x: 50,
  y: 50,
};

function loadImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.crossOrigin = 'anonymous';
    image.decoding = 'async';
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error('بارگذاری تصویر برای برش ناموفق بود.'));
    image.src = url;
  });
}

export function computeCoverDrawRect(
  imageWidth: number,
  imageHeight: number,
  frameWidth: number,
  frameHeight: number,
  focus: ImageFrameFocus,
) {
  const scale = Math.max(frameWidth / imageWidth, frameHeight / imageHeight);
  const drawWidth = imageWidth * scale;
  const drawHeight = imageHeight * scale;
  const offsetX = (focus.x / 100) * (frameWidth - drawWidth);
  const offsetY = (focus.y / 100) * (frameHeight - drawHeight);

  return {
    x: offsetX,
    y: offsetY,
    width: drawWidth,
    height: drawHeight,
  };
}

export async function cropImageToFrame(
  sourceUrl: string,
  frame: ImageFrameSpec,
  focus: ImageFrameFocus = DEFAULT_IMAGE_FRAME_FOCUS,
): Promise<Blob> {
  const image = await loadImage(sourceUrl);
  const canvas = document.createElement('canvas');
  canvas.width = frame.width;
  canvas.height = frame.height;

  const context = canvas.getContext('2d');
  if (!context) {
    throw new Error('امکان آماده‌سازی برش تصویر وجود ندارد.');
  }

  const drawRect = computeCoverDrawRect(
    image.naturalWidth,
    image.naturalHeight,
    frame.width,
    frame.height,
    focus,
  );

  context.drawImage(image, drawRect.x, drawRect.y, drawRect.width, drawRect.height);

  const blob = await new Promise<Blob | null>((resolve) => {
    canvas.toBlob(resolve, 'image/jpeg', 0.92);
  });

  if (!blob) {
    throw new Error('خروجی برش تصویر تولید نشد.');
  }

  return blob;
}
