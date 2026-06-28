import type { ProductDetails, ProductPdpConfig, ProductVariant } from '@sadafgold/types';
import type { ProductSpecRow, StoneColorSwatch } from '@/shared/config/product-detail-demo';

export function findMatchingVariant(
  variants: ProductVariant[],
  selection: { goldColor?: string; size?: string | number; stone?: string },
): ProductVariant | null {
  if (variants.length === 0) {
    return null;
  }

  const sizeValue =
    selection.size !== undefined && selection.size !== null
      ? String(selection.size)
      : undefined;

  const stoneValue = selection.stone?.trim() || undefined;

  const matches = variants.filter((variant) => {
    if (selection.goldColor && variant.color && variant.color !== selection.goldColor) {
      return false;
    }
    if (sizeValue && variant.size && variant.size !== sizeValue) {
      return false;
    }
    if (stoneValue && variant.stone && variant.stone !== stoneValue) {
      return false;
    }
    return true;
  });

  if (matches.length === 0) {
    return null;
  }

  return matches.find((variant) => variant.quantity > 0) ?? matches[0] ?? null;
}

export function resolveActiveSize(
  config: ProductPdpConfig | null | undefined,
  sizeKinds: { ring?: number[]; necklace?: number[]; bracelet?: number[] },
): string | undefined {
  if (config?.sizeKind === 'ring' && sizeKinds.ring?.length) {
    return String(sizeKinds.ring[Math.floor(sizeKinds.ring.length / 2)] ?? sizeKinds.ring[0]);
  }
  if (config?.sizeKind === 'necklace' && sizeKinds.necklace?.length) {
    return String(
      sizeKinds.necklace[Math.floor(sizeKinds.necklace.length / 2)] ?? sizeKinds.necklace[0],
    );
  }
  if (config?.sizeKind === 'bracelet' && sizeKinds.bracelet?.length) {
    return String(
      sizeKinds.bracelet[Math.floor(sizeKinds.bracelet.length / 2)] ?? sizeKinds.bracelet[0],
    );
  }
  return undefined;
}

export function resolvePdpSections(product: ProductDetails): {
  goldColors?: string[];
  stoneSwatches?: StoneColorSwatch[];
  ringSizes?: number[];
  necklaceSizes?: number[];
  braceletSizes?: number[];
  specRows?: ProductSpecRow[];
} {
  const config = product.pdpConfig;
  if (!config) {
    return {};
  }

  const result: {
    goldColors?: string[];
    stoneSwatches?: StoneColorSwatch[];
    ringSizes?: number[];
    necklaceSizes?: number[];
    braceletSizes?: number[];
    specRows?: ProductSpecRow[];
  } = {};

  if (config.goldColors && config.goldColors.length > 0) {
    result.goldColors = config.goldColors;
  }

  if (config.stoneSwatches && config.stoneSwatches.length > 0) {
    result.stoneSwatches = config.stoneSwatches;
  }

  if (config.sizeKind && config.sizes && config.sizes.length > 0) {
    if (config.sizeKind === 'ring') {
      result.ringSizes = config.sizes;
    } else if (config.sizeKind === 'necklace') {
      result.necklaceSizes = config.sizes;
    } else if (config.sizeKind === 'bracelet') {
      result.braceletSizes = config.sizes;
    }
  }

  if (config.customSpecs && config.customSpecs.length > 0) {
    result.specRows = config.customSpecs;
  }

  return result;
}
