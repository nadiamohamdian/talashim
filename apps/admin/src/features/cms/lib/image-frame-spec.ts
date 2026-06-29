export interface ImageFrameSpec {
  width: number;
  height: number;
  label?: string;
}

export const IMAGE_FRAME_PRESETS = {
  categoryHero: {
    width: 1328,
    height: 502,
    label: 'بنر اسلایدر دسته‌بندی',
  },
  productThumbnail: {
    width: 800,
    height: 800,
    label: 'تصویر کارت محصول',
  },
  heroDesktop: {
    width: 1920,
    height: 1080,
    label: 'هیرو دسکتاپ',
  },
  heroMobile: {
    width: 1200,
    height: 2100,
    label: 'هیرو موبایل',
  },
  banner: {
    width: 1600,
    height: 640,
    label: 'بنر تبلیغاتی',
  },
  blogCover: {
    width: 1200,
    height: 630,
    label: 'کاور مقاله',
  },
  square: {
    width: 1000,
    height: 1000,
    label: 'مربع',
  },
} as const satisfies Record<string, ImageFrameSpec>;

function parseAspectRatioFromClassName(
  className?: string,
): { width: number; height: number } | null {
  if (!className) {
    return null;
  }

  const customAspect = className.match(/aspect-\[(\d+)\/(\d+)\]/);
  if (customAspect) {
    return {
      width: Number(customAspect[1]),
      height: Number(customAspect[2]),
    };
  }

  if (className.includes('aspect-square')) {
    return { width: 1, height: 1 };
  }

  if (className.includes('aspect-video') || className.includes('aspect-[16/9]')) {
    return { width: 16, height: 9 };
  }

  if (className.includes('aspect-[9/16]')) {
    return { width: 9, height: 16 };
  }

  return null;
}

function normalizeAspectToPixels(aspect: { width: number; height: number }): ImageFrameSpec {
  const maxDim = 1600;

  if (aspect.width >= aspect.height) {
    return {
      width: maxDim,
      height: Math.round((maxDim * aspect.height) / aspect.width),
      label: `${aspect.width}:${aspect.height}`,
    };
  }

  return {
    width: Math.round((maxDim * aspect.width) / aspect.height),
    height: maxDim,
    label: `${aspect.width}:${aspect.height}`,
  };
}

export function resolveImageFrame(
  frame?: ImageFrameSpec,
  previewClassName?: string,
): ImageFrameSpec {
  if (frame) {
    return frame;
  }

  const aspect = parseAspectRatioFromClassName(previewClassName);
  if (aspect) {
    return normalizeAspectToPixels(aspect);
  }

  return IMAGE_FRAME_PRESETS.square;
}
