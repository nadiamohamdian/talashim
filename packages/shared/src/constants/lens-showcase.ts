/** Figma artboard — must match storefront CSS (--ls-art-hero-w/h) and admin CMS editor */
export const LENS_SHOWCASE_ARTBOARD = {
  desktop: { width: 691, height: 263 },
  mobile: { width: 350, height: 133 },
} as const;

/** Product chip on hero — Figma Group proportions */
export const LENS_SHOWCASE_CHIP = {
  width: 334,
  height: 119,
  thumbWidth: 106,
  thumbHeight: 87,
  imageHeight: 80,
} as const;

export type LensShowcaseViewport = keyof typeof LENS_SHOWCASE_ARTBOARD;

const LENS_POSITION_PATTERN = /^(-?\d+(?:\.\d+)?)(%|px)$/;

export function parseLensPosition(
  value: string | undefined,
  artboardSize: number,
  fallback = 0,
): number {
  const trimmed = value?.trim() ?? '';
  const match = LENS_POSITION_PATTERN.exec(trimmed);
  if (!match) {
    return fallback;
  }

  const amount = Number.parseFloat(match[1] ?? '0');
  if (match[2] === '%') {
    return (amount / 100) * artboardSize;
  }

  return amount;
}

export function formatLensPosition(
  pixels: number,
  artboardSize: number,
  preferUnit: 'px' | '%' = 'px',
): string {
  if (preferUnit === '%') {
    const percent = (pixels / artboardSize) * 100;
    return `${percent.toFixed(1).replace(/\.0$/, '')}%`;
  }

  return `${Math.round(pixels)}px`;
}

/** Converts artboard px coordinates to % so hotspots scale with responsive hero size */
export function scaleLensPositionToPercent(value: string, artboardSize: number): string {
  const trimmed = value.trim();
  if (!trimmed) {
    return '0%';
  }

  const match = LENS_POSITION_PATTERN.exec(trimmed);
  if (!match) {
    return trimmed;
  }

  if (match[2] === '%') {
    return trimmed;
  }

  const px = Number.parseFloat(match[1] ?? '0');
  const percent = (px / artboardSize) * 100;
  return `${Number(percent.toFixed(4))}%`;
}

export function detectPositionUnit(value: string | undefined): 'px' | '%' {
  return value?.trim().endsWith('%') ? '%' : 'px';
}

export const DEFAULT_LENS_CHIP_TRANSLATE = {
  x: '-50%',
  y: 'calc(-100% - 8px)',
} as const;
