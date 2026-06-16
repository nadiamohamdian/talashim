import type { ProductPdpConfig } from '@sadafgold/types';

const MAX_SPECS = 30;
const MAX_GOLD_COLORS = 10;
const MAX_STONE_SWATCHES = 20;
const MAX_SIZES = 30;
const HEX_COLOR_PATTERN = /^#[0-9A-Fa-f]{3,8}$/;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

export function sanitizeProductPdpConfig(input: unknown): ProductPdpConfig | null {
  if (input === null) {
    return null;
  }
  if (!isRecord(input)) {
    return null;
  }

  const config: ProductPdpConfig = {};

  if (Array.isArray(input.customSpecs)) {
    const customSpecs = input.customSpecs
      .filter(
        (row): row is { label: string; value: string } =>
          isRecord(row) &&
          typeof row.label === 'string' &&
          typeof row.value === 'string',
      )
      .map((row) => ({
        label: row.label.trim().slice(0, 100),
        value: row.value.trim().slice(0, 500),
      }))
      .filter((row) => row.label.length > 0 && row.value.length > 0)
      .slice(0, MAX_SPECS);

    if (customSpecs.length > 0) {
      config.customSpecs = customSpecs;
    }
  }

  if (Array.isArray(input.goldColors)) {
    const goldColors = input.goldColors
      .filter((color): color is string => typeof color === 'string')
      .map((color) => color.trim())
      .filter((color) => color.length > 0)
      .slice(0, MAX_GOLD_COLORS);

    if (goldColors.length > 0) {
      config.goldColors = goldColors;
    }
  }

  if (Array.isArray(input.stoneSwatches)) {
    const stoneSwatches = input.stoneSwatches
      .filter(
        (swatch): swatch is { id: string; color: string; label: string } =>
          isRecord(swatch) &&
          typeof swatch.id === 'string' &&
          typeof swatch.color === 'string' &&
          typeof swatch.label === 'string',
      )
      .map((swatch) => ({
        id: swatch.id.trim().slice(0, 40),
        color: swatch.color.trim(),
        label: swatch.label.trim().slice(0, 80),
      }))
      .filter(
        (swatch) =>
          swatch.id.length > 0 &&
          swatch.label.length > 0 &&
          HEX_COLOR_PATTERN.test(swatch.color),
      )
      .slice(0, MAX_STONE_SWATCHES);

    if (stoneSwatches.length > 0) {
      config.stoneSwatches = stoneSwatches;
    }
  }

  if (input.sizeKind === 'ring' || input.sizeKind === 'necklace' || input.sizeKind === 'bracelet') {
    config.sizeKind = input.sizeKind;
  } else if (input.sizeKind === null) {
    config.sizeKind = null;
  }

  if (Array.isArray(input.sizes)) {
    const sizes = input.sizes
      .map((size) => Number(size))
      .filter((size) => Number.isFinite(size) && size > 0 && size < 1000)
      .slice(0, MAX_SIZES);

    if (sizes.length > 0) {
      config.sizes = sizes;
    }
  }

  if (Object.keys(config).length === 0) {
    return null;
  }

  return config;
}

export function parseProductPdpConfig(value: unknown): ProductPdpConfig | null {
  if (value === null || value === undefined) {
    return null;
  }
  return sanitizeProductPdpConfig(value);
}
