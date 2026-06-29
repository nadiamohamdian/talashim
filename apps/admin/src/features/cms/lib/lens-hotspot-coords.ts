import type { CmsLensHotspot } from '@talashim/types';
import {
  LENS_SHOWCASE_ARTBOARD,
  detectPositionUnit,
  formatLensPosition,
  parseLensPosition,
  type LensShowcaseViewport,
} from '@sadafgold/shared';

export const LENS_HERO_ARTBOARD = LENS_SHOWCASE_ARTBOARD;

export type LensHotspotViewport = LensShowcaseViewport;

export { detectPositionUnit, formatLensPosition, parseLensPosition };

export function readHotspotCoords(
  spot: CmsLensHotspot,
  viewport: LensHotspotViewport,
): { top: string; left: string } {
  if (viewport === 'mobile') {
    return {
      top: spot.topMobile ?? spot.top,
      left: spot.leftMobile ?? spot.left,
    };
  }

  return { top: spot.top, left: spot.left };
}

export function readChipCoords(
  spot: CmsLensHotspot,
  viewport: LensHotspotViewport,
): { top: string; left: string } {
  if (viewport === 'mobile') {
    return {
      top: spot.chipTopMobile ?? spot.chipTop ?? spot.topMobile ?? spot.top,
      left: spot.chipLeftMobile ?? spot.chipLeft ?? spot.leftMobile ?? spot.left,
    };
  }

  return {
    top: spot.chipTop ?? spot.top,
    left: spot.chipLeft ?? spot.left,
  };
}

export function writeHotspotCoords(
  spot: CmsLensHotspot,
  viewport: LensHotspotViewport,
  top: string,
  left: string,
): CmsLensHotspot {
  if (viewport === 'mobile') {
    return { ...spot, topMobile: top, leftMobile: left };
  }

  return { ...spot, top, left };
}

export function writeChipCoords(
  spot: CmsLensHotspot,
  viewport: LensHotspotViewport,
  top: string,
  left: string,
): CmsLensHotspot {
  if (viewport === 'mobile') {
    return { ...spot, chipTopMobile: top, chipLeftMobile: left };
  }

  return { ...spot, chipTop: top, chipLeft: left };
}
