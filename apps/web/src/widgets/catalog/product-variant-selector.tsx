'use client';

import type { ProductVariant } from '@sadafgold/types';

interface ProductVariantSelectorProps {
  variants: ProductVariant[];
  selectedId: string | null;
  onSelect: (variant: ProductVariant) => void;
}

function VariantChip({
  active,
  label,
  sublabel,
  disabled,
  onClick,
}: {
  active: boolean;
  label: string;
  sublabel?: string;
  disabled?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={`min-w-[4.5rem] rounded-xl border px-3 py-2 text-right transition ${
        active
          ? 'border-amber-500 bg-amber-50 text-amber-950 shadow-sm ring-2 ring-amber-200'
          : disabled
            ? 'cursor-not-allowed border-nude-200 bg-nude-50 text-stone-400'
            : 'border-nude-200 bg-white text-stone-700 hover:border-amber-300 hover:bg-amber-50/50'
      }`}
    >
      <span className="block text-sm font-semibold">{label}</span>
      {sublabel ? <span className="block text-[10px] text-muted">{sublabel}</span> : null}
    </button>
  );
}

export function ProductVariantSelector({
  variants,
  selectedId,
  onSelect,
}: ProductVariantSelectorProps) {
  if (variants.length === 0) {
    return null;
  }

  const colors = [...new Set(variants.map((v) => v.color).filter(Boolean))] as string[];
  const sizes = [...new Set(variants.map((v) => v.size).filter(Boolean))] as string[];
  const selected = variants.find((v) => v.id === selectedId) ?? variants[0]!;

  const showColorRow = colors.length > 0;
  const showSizeRow = sizes.length > 0;

  return (
    <div className="space-y-4 border-t border-nude-200 pt-4">
      <p className="text-sm font-semibold text-foreground">انتخاب گزینه</p>

      {showColorRow ? (
        <div>
          <p className="mb-2 text-xs text-muted">رنگ</p>
          <div className="flex flex-wrap gap-2">
            {colors.map((color) => {
              const match = variants.find((v) => v.color === color && v.quantity > 0) ??
                variants.find((v) => v.color === color);
              const isActive = selected.color === color;
              return (
                <VariantChip
                  key={color}
                  active={isActive}
                  label={color}
                  sublabel={match && match.quantity <= 0 ? 'ناموجود' : undefined}
                  disabled={!match || match.quantity <= 0}
                  onClick={() => {
                    if (!match) {
                      return;
                    }
                    const sameSize = variants.find(
                      (v) => v.color === color && v.size === selected.size && v.quantity > 0,
                    );
                    onSelect(sameSize ?? match);
                  }}
                />
              );
            })}
          </div>
        </div>
      ) : null}

      {showSizeRow ? (
        <div>
          <p className="mb-2 text-xs text-muted">سایز</p>
          <div className="flex flex-wrap gap-2">
            {sizes.map((size) => {
              const match =
                variants.find(
                  (v) =>
                    v.size === size &&
                    (selected.color ? v.color === selected.color : true) &&
                    v.quantity > 0,
                ) ??
                variants.find(
                  (v) => v.size === size && (selected.color ? v.color === selected.color : true),
                );
              const isActive = selected.size === size;
              return (
                <VariantChip
                  key={size}
                  active={isActive}
                  label={size}
                  sublabel={match && match.quantity <= 0 ? 'ناموجود' : undefined}
                  disabled={!match || match.quantity <= 0}
                  onClick={() => match && onSelect(match)}
                />
              );
            })}
          </div>
        </div>
      ) : null}

      {!showColorRow && !showSizeRow ? (
        <div className="flex flex-wrap gap-2">
          {variants.map((variant) => (
            <VariantChip
              key={variant.id}
              active={variant.id === selected.id}
              label={variant.sku}
              sublabel={variant.quantity <= 0 ? 'ناموجود' : `${variant.quantity} عدد`}
              disabled={variant.quantity <= 0}
              onClick={() => onSelect(variant)}
            />
          ))}
        </div>
      ) : null}

      <div className="rounded-xl bg-nude-50/80 px-3 py-2 text-xs text-stone-600">
        <span className="font-semibold text-stone-800">SKU انتخاب‌شده: </span>
        <span className="font-mono">{selected.sku}</span>
        {selected.quantity > 0 ? (
          <span className="mr-2 text-emerald-700"> · {selected.quantity} عدد موجود</span>
        ) : (
          <span className="mr-2 text-rose-600"> · ناموجود</span>
        )}
      </div>
    </div>
  );
}

export function resolveDefaultVariant(variants: ProductVariant[]): ProductVariant | null {
  if (variants.length === 0) {
    return null;
  }
  return variants.find((v) => v.isDefault && v.quantity > 0) ?? variants.find((v) => v.quantity > 0) ?? variants[0]!;
}

export function applyVariantToProduct<T extends {
  sku: string;
  weightGram: number;
  makingFeePercent: number;
  priceToman: number;
  imageUrl: string;
  inventory: number;
}>(product: T, variant: ProductVariant | null): T {
  if (!variant) {
    return product;
  }
  return {
    ...product,
    sku: variant.sku,
    color: variant.color ?? product.color,
    weightGram: variant.weightGram ?? product.weightGram,
    makingFeePercent: variant.makingFeePercent ?? product.makingFeePercent,
    priceToman: variant.priceToman > 0 ? variant.priceToman : product.priceToman,
    imageUrl: variant.imageUrl ?? product.imageUrl,
    inventory: variant.quantity,
  };
}
