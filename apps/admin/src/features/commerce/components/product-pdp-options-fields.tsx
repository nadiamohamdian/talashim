'use client';

import { Button, Input, Label } from '@talashim/ui';
import type { ProductPdpConfig, ProductPdpSizeKind } from '@sadafgold/types';
import {
  PRESET_GOLD_COLORS,
  PRESET_SIZE_KIND_LABELS,
  PRESET_SIZE_OPTIONS,
  PRESET_STONE_SWATCHES,
} from '@sadafgold/shared';
import type { ProductVariantField } from './product-variant-fields';
import { emptyVariantField } from './product-variant-fields';

export type ProductPdpSpecField = {
  label: string;
  value: string;
};

export type ProductPdpOptionsForm = {
  enableGoldColors: boolean;
  goldColors: string[];
  enableStoneColors: boolean;
  stoneSwatchIds: string[];
  enableSizeRuler: boolean;
  sizeKind: ProductPdpSizeKind;
  sizes: number[];
  customSpecs: ProductPdpSpecField[];
};

export const emptyPdpOptionsForm = (): ProductPdpOptionsForm => ({
  enableGoldColors: false,
  goldColors: [],
  enableStoneColors: false,
  stoneSwatchIds: [],
  enableSizeRuler: false,
  sizeKind: 'ring',
  sizes: [],
  customSpecs: [],
});

function toggleListItem<T>(items: T[], item: T): T[] {
  return items.includes(item) ? items.filter((value) => value !== item) : [...items, item];
}

function resolveSizeKind(value: unknown): ProductPdpSizeKind {
  return value === 'ring' || value === 'necklace' || value === 'bracelet' ? value : 'ring';
}

const FALLBACK_GOLD_COLORS = ['طلایی', 'رزگلد', 'سفید'] as const;
const FALLBACK_STONE_SWATCHES = [
  { id: 'pink', color: '#F2D4D9', label: 'صورتی' },
  { id: 'purple', color: '#D8CCE8', label: 'بنفش' },
  { id: 'blue', color: '#C8D9ED', label: 'آبی' },
  { id: 'gray', color: '#D9D9D9', label: 'خاکستری' },
] as const;

const FALLBACK_SIZE_OPTIONS: Record<ProductPdpSizeKind, number[]> = {
  ring: [50, 51, 52, 53, 54, 55, 56, 57, 58, 59, 60, 61, 62, 63],
  necklace: [40, 42, 45, 48, 50, 55],
  bracelet: [16, 17, 18, 19, 20, 21],
};

function goldColorPresets(): readonly string[] {
  return Array.isArray(PRESET_GOLD_COLORS) && PRESET_GOLD_COLORS.length > 0
    ? PRESET_GOLD_COLORS
    : FALLBACK_GOLD_COLORS;
}

function stoneSwatchPresets() {
  return Array.isArray(PRESET_STONE_SWATCHES) && PRESET_STONE_SWATCHES.length > 0
    ? PRESET_STONE_SWATCHES
    : FALLBACK_STONE_SWATCHES;
}

function sizeOptionsFor(kind: ProductPdpSizeKind): number[] {
  const presetSizes = PRESET_SIZE_OPTIONS?.[kind];
  if (Array.isArray(presetSizes) && presetSizes.length > 0) {
    return [...presetSizes];
  }
  return [...FALLBACK_SIZE_OPTIONS[kind]];
}

export function pdpConfigToForm(config: ProductPdpConfig | null | undefined): ProductPdpOptionsForm {
  if (!config) {
    return emptyPdpOptionsForm();
  }

  return {
    enableGoldColors: (config.goldColors?.length ?? 0) > 0,
    goldColors: config.goldColors ?? [],
    enableStoneColors: (config.stoneSwatches?.length ?? 0) > 0,
    stoneSwatchIds: (config.stoneSwatches ?? []).map((swatch) => swatch.id),
    enableSizeRuler: Boolean(config.sizeKind && (config.sizes?.length ?? 0) > 0),
    sizeKind: resolveSizeKind(config.sizeKind),
    sizes: config.sizes ?? [],
    customSpecs: (config.customSpecs ?? []).map((row) => ({
      label: row.label,
      value: row.value,
    })),
  };
}

export function pdpFormToConfig(form: ProductPdpOptionsForm): ProductPdpConfig | null {
  const config: ProductPdpConfig = {};

  if (form.customSpecs.length > 0) {
    config.customSpecs = form.customSpecs
      .map((row) => ({
        label: row.label.trim(),
        value: row.value.trim(),
      }))
      .filter((row) => row.label.length > 0 && row.value.length > 0);
  }

  if (form.enableGoldColors && form.goldColors.length > 0) {
    config.goldColors = form.goldColors;
  }

  if (form.enableStoneColors && form.stoneSwatchIds.length > 0) {
    config.stoneSwatches = stoneSwatchPresets().filter((swatch) =>
      form.stoneSwatchIds.includes(swatch.id),
    );
  }

  if (form.enableSizeRuler && form.sizes.length > 0) {
    config.sizeKind = form.sizeKind;
    config.sizes = form.sizes;
  }

  return Object.keys(config).length > 0 ? config : null;
}

interface ProductPdpOptionsFieldsProps {
  baseSku: string;
  basePriceToman: string;
  options: ProductPdpOptionsForm;
  onChange: (options: ProductPdpOptionsForm) => void;
  onGenerateVariants?: (variants: ProductVariantField[]) => void;
}

export function ProductPdpOptionsFields({
  baseSku,
  basePriceToman,
  options,
  onChange,
  onGenerateVariants,
}: ProductPdpOptionsFieldsProps) {
  const safeSizeKind = resolveSizeKind(options.sizeKind);
  const goldColors = goldColorPresets();
  const stoneSwatches = stoneSwatchPresets();

  const patch = (patchValue: Partial<ProductPdpOptionsForm>) => {
    const next = { ...options, ...patchValue };
    next.sizeKind = resolveSizeKind(next.sizeKind);
    onChange(next);
  };

  const toggleGoldColor = (color: string) => {
    patch({ goldColors: toggleListItem(options.goldColors, color) });
  };

  const toggleStoneSwatch = (id: string) => {
    patch({ stoneSwatchIds: toggleListItem(options.stoneSwatchIds, id) });
  };

  const toggleSize = (size: number) => {
    patch({ sizes: toggleListItem(options.sizes, size) });
  };

  const applyPresetSizes = (kind: ProductPdpSizeKind) => {
    patch({
      sizeKind: kind,
      sizes: [...sizeOptionsFor(kind)],
    });
  };

  const addSpecRow = () => {
    patch({ customSpecs: [...options.customSpecs, { label: '', value: '' }] });
  };

  const updateSpecRow = (index: number, field: 'label' | 'value', value: string) => {
    const next = [...options.customSpecs];
    const current = next[index];
    if (!current) {
      return;
    }
    next[index] = { ...current, [field]: value };
    patch({ customSpecs: next });
  };

  const removeSpecRow = (index: number) => {
    patch({ customSpecs: options.customSpecs.filter((_, i) => i !== index) });
  };

  const handleGenerateVariants = () => {
    if (!onGenerateVariants) {
      return;
    }

    const colors =
      options.enableGoldColors && options.goldColors.length > 0 ? options.goldColors : [undefined];
    const sizes =
      options.enableSizeRuler && options.sizes.length > 0
        ? options.sizes.map(String)
        : [undefined];

    const combinations: Array<{ color?: string; size?: string }> = [];
    for (const color of colors) {
      for (const size of sizes) {
        combinations.push({ color, size });
      }
    }

    const generated = combinations.map((combo, index) => {
      const row = emptyVariantField();
      const suffix = [combo.color, combo.size].filter(Boolean).join('-') || `V${index + 1}`;
      row.sku = baseSku.trim() ? `${baseSku.trim()}-${suffix}` : '';
      row.color = combo.color ?? '';
      row.size = combo.size ?? '';
      row.priceToman = basePriceToman;
      row.isDefault = index === 0;
      return row;
    });

    onGenerateVariants(generated);
  };

  const canGenerateVariants =
    (options.enableGoldColors && options.goldColors.length > 0) ||
    (options.enableSizeRuler && options.sizes.length > 0);

  return (
    <div className="space-y-4" data-span="full">
      <div className="space-y-3 rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-muted)] p-4">
        <div className="flex items-center justify-between gap-2">
          <p className="text-sm font-medium text-foreground">مشخصات سفارشی</p>
          <Button type="button" variant="outline" className="h-8 px-2 text-xs" onClick={addSpecRow}>
            + ردیف
          </Button>
        </div>
        {options.customSpecs.length === 0 ? (
          <p className="text-xs text-muted">مثال: نوع سنگ، نوع قفل، مالیات</p>
        ) : null}
        <div className="space-y-2">
          {options.customSpecs.map((row, index) => (
            <div key={`spec-${index}`} className="grid gap-2 sm:grid-cols-[1fr_1fr_auto]">
              <Input
                placeholder="عنوان (مثلاً نوع سنگ)"
                value={row.label}
                onChange={(e) => updateSpecRow(index, 'label', e.target.value)}
              />
              <Input
                placeholder="مقدار (مثلاً زیرکن اتمی)"
                value={row.value}
                onChange={(e) => updateSpecRow(index, 'value', e.target.value)}
              />
              <Button
                type="button"
                variant="outline"
                className="h-10 px-2 text-xs text-[var(--error)]"
                onClick={() => removeSpecRow(index)}
              >
                حذف
              </Button>
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-3 rounded-[var(--radius-xl)] border border-border bg-[var(--surface)]/80 p-4">
        <label className="flex items-center gap-2 text-sm font-medium text-foreground">
          <input
            type="checkbox"
            checked={options.enableGoldColors}
            onChange={(e) =>
              patch({
                enableGoldColors: e.target.checked,
                goldColors: e.target.checked ? [...goldColors] : [],
              })
            }
          />
          نمایش انتخاب رنگ طلا
        </label>
        {options.enableGoldColors ? (
          <div className="flex flex-wrap gap-2">
            {goldColors.map((color) => {
              const active = options.goldColors.includes(color);
              return (
                <button
                  key={color}
                  type="button"
                  className={`rounded-full border px-3 py-1.5 text-xs transition ${
                    active
                      ? 'border-[var(--primary)] bg-[var(--primary)]/10 text-foreground'
                      : 'border-border text-muted'
                  }`}
                  onClick={() => toggleGoldColor(color)}
                >
                  {color}
                </button>
              );
            })}
          </div>
        ) : null}
      </div>

      <div className="space-y-3 rounded-[var(--radius-xl)] border border-border bg-[var(--surface)]/80 p-4">
        <label className="flex items-center gap-2 text-sm font-medium text-foreground">
          <input
            type="checkbox"
            checked={options.enableStoneColors}
            onChange={(e) =>
              patch({
                enableStoneColors: e.target.checked,
                stoneSwatchIds: e.target.checked
                  ? stoneSwatches.map((swatch) => swatch.id)
                  : [],
              })
            }
          />
          نمایش انتخاب رنگ سنگ
        </label>
        {options.enableStoneColors ? (
          <div className="flex flex-wrap gap-2">
            {stoneSwatches.map((swatch) => {
              const active = options.stoneSwatchIds.includes(swatch.id);
              return (
                <button
                  key={swatch.id}
                  type="button"
                  title={swatch.label}
                  className={`h-9 w-9 rounded-full border-2 transition ${
                    active ? 'border-[var(--primary)] ring-2 ring-[var(--primary)]/30' : 'border-border'
                  }`}
                  style={{ backgroundColor: swatch.color }}
                  onClick={() => toggleStoneSwatch(swatch.id)}
                  aria-label={swatch.label}
                  aria-pressed={active}
                />
              );
            })}
          </div>
        ) : null}
      </div>

      <div className="space-y-3 rounded-[var(--radius-xl)] border border-border bg-[var(--surface)]/80 p-4">
        <label className="flex items-center gap-2 text-sm font-medium text-foreground">
          <input
            type="checkbox"
            checked={options.enableSizeRuler}
            onChange={(e) => {
              const enabled = e.target.checked;
              patch({
                enableSizeRuler: enabled,
                sizeKind: safeSizeKind,
                sizes: enabled ? sizeOptionsFor(safeSizeKind) : [],
              });
            }}
          />
          نمایش خط‌کش سایز
        </label>
        {options.enableSizeRuler ? (
          <div className="space-y-3">
            <div className="flex flex-wrap gap-2">
              {(Object.keys(PRESET_SIZE_KIND_LABELS) as ProductPdpSizeKind[]).map((kind) => (
                <button
                  key={kind}
                  type="button"
                  className={`rounded-full border px-3 py-1.5 text-xs transition ${
                    safeSizeKind === kind
                      ? 'border-[var(--primary)] bg-[var(--primary)]/10 text-foreground'
                      : 'border-border text-muted'
                  }`}
                  onClick={() => applyPresetSizes(kind)}
                >
                  {PRESET_SIZE_KIND_LABELS[kind]}
                </button>
              ))}
            </div>
            <div className="flex flex-wrap gap-1.5">
              {sizeOptionsFor(safeSizeKind).map((size) => {
                const active = options.sizes.includes(size);
                return (
                  <button
                    key={size}
                    type="button"
                    className={`min-w-9 rounded-md border px-2 py-1 text-xs transition ${
                      active
                        ? 'border-[var(--primary)] bg-[var(--primary)]/10 text-foreground'
                        : 'border-border text-muted'
                    }`}
                    onClick={() => toggleSize(size)}
                  >
                    {size}
                  </button>
                );
              })}
            </div>
          </div>
        ) : null}
      </div>

      {canGenerateVariants && onGenerateVariants ? (
        <Button
          type="button"
          variant="outline"
          className="h-9 px-3 text-xs"
          onClick={handleGenerateVariants}
        >
          ساخت واریانت‌ها از گزینه‌های انتخاب‌شده
        </Button>
      ) : null}
    </div>
  );
}
