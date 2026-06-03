'use client';

import { Button, Input, Label } from '@talashim/ui';

const MAX_VARIANTS = 50;

export type ProductVariantField = {
  sku: string;
  color: string;
  size: string;
  priceToman: string;
  weightGram: string;
  makingFeePercent: string;
  imageUrl: string;
  quantity: string;
  isDefault: boolean;
};

export const emptyVariantField = (): ProductVariantField => ({
  sku: '',
  color: '',
  size: '',
  priceToman: '0',
  weightGram: '',
  makingFeePercent: '',
  imageUrl: '',
  quantity: '0',
  isDefault: false,
});

interface ProductVariantFieldsProps {
  baseSku: string;
  variants: ProductVariantField[];
  onChange: (variants: ProductVariantField[]) => void;
}

function patchVariant(
  variants: ProductVariantField[],
  index: number,
  patch: Partial<ProductVariantField>,
): ProductVariantField[] {
  const current = variants[index];
  if (!current) {
    return variants;
  }
  const next = [...variants];
  next[index] = { ...current, ...patch };
  return next;
}

export function ProductVariantFields({ baseSku, variants, onChange }: ProductVariantFieldsProps) {
  const setDefault = (index: number) => {
    onChange(
      variants.map((variant, i) => ({
        ...variant,
        isDefault: i === index,
      })),
    );
  };

  return (
    <div className="md:col-span-2 space-y-4 border-t border-border pt-6">
      <div className="flex items-start justify-between gap-2">
        <div>
          <Label>واریانت‌ها (رنگ / سایز)</Label>
          <p className="mt-1 text-xs text-stone-500">
            هر ترکیب رنگ و سایز می‌تواند قیمت، وزن، موجودی و تصویر جدا داشته باشد (حداکثر{' '}
            {MAX_VARIANTS}).
          </p>
        </div>
        <Button
          type="button"
          variant="outline"
          className="h-9 shrink-0 px-3 text-xs"
          disabled={variants.length >= MAX_VARIANTS}
          onClick={() => {
            const index = variants.length;
            const suggestedSku = baseSku.trim() ? `${baseSku.trim()}-V${index + 1}` : '';
            const row = emptyVariantField();
            if (suggestedSku) {
              row.sku = suggestedSku;
            }
            if (variants.length === 0) {
              row.isDefault = true;
            }
            onChange([...variants, row]);
          }}
        >
          + واریانت
        </Button>
      </div>

      {variants.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-border px-4 py-6 text-center text-xs text-stone-500">
          بدون واریانت — فقط قیمت پایه محصول اعمال می‌شود.
        </p>
      ) : null}

      <div className="space-y-4">
        {variants.map((variant, index) => (
          <div
            key={`variant-${index}`}
            className="space-y-3 rounded-2xl border border-border bg-stone-50/50 p-4"
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="text-sm font-medium text-stone-800">واریانت {index + 1}</p>
              <div className="flex items-center gap-2">
                <label className="flex items-center gap-1.5 text-xs text-stone-600">
                  <input
                    type="radio"
                    name="default-variant"
                    checked={variant.isDefault}
                    onChange={() => setDefault(index)}
                  />
                  پیش‌فرض
                </label>
                <Button
                  type="button"
                  variant="outline"
                  className="h-8 px-2 text-xs text-rose-600"
                  onClick={() => {
                    const next = variants.filter((_, i) => i !== index);
                    if (next.length > 0 && !next.some((v) => v.isDefault)) {
                      const first = next[0];
                      if (first) {
                        first.isDefault = true;
                      }
                    }
                    onChange(next);
                  }}
                >
                  حذف
                </Button>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <Label className="text-xs">SKU واریانت *</Label>
                <Input
                  className="mt-1"
                  value={variant.sku}
                  placeholder={`${baseSku || 'SKU'}-V${index + 1}`}
                  onChange={(e) => onChange(patchVariant(variants, index, { sku: e.target.value }))}
                />
              </div>
              <div>
                <Label className="text-xs">قیمت (تومان) *</Label>
                <Input
                  className="mt-1"
                  type="number"
                  min={0}
                  value={variant.priceToman}
                  onChange={(e) =>
                    onChange(patchVariant(variants, index, { priceToman: e.target.value }))
                  }
                />
              </div>
              <div>
                <Label className="text-xs">رنگ</Label>
                <Input
                  className="mt-1"
                  value={variant.color}
                  placeholder="زرد، سفید، رزگلد"
                  onChange={(e) => onChange(patchVariant(variants, index, { color: e.target.value }))}
                />
              </div>
              <div>
                <Label className="text-xs">سایز</Label>
                <Input
                  className="mt-1"
                  value={variant.size}
                  placeholder="۵۲، ۱۴، L"
                  onChange={(e) => onChange(patchVariant(variants, index, { size: e.target.value }))}
                />
              </div>
              <div>
                <Label className="text-xs">وزن (گرم) — اختیاری</Label>
                <Input
                  className="mt-1"
                  value={variant.weightGram}
                  placeholder="از محصول پایه"
                  onChange={(e) =>
                    onChange(patchVariant(variants, index, { weightGram: e.target.value }))
                  }
                />
              </div>
              <div>
                <Label className="text-xs">اجرت (٪) — اختیاری</Label>
                <Input
                  className="mt-1"
                  value={variant.makingFeePercent}
                  placeholder="از محصول پایه"
                  onChange={(e) =>
                    onChange(patchVariant(variants, index, { makingFeePercent: e.target.value }))
                  }
                />
              </div>
              <div>
                <Label className="text-xs">موجودی</Label>
                <Input
                  className="mt-1"
                  type="number"
                  min={0}
                  value={variant.quantity}
                  onChange={(e) =>
                    onChange(patchVariant(variants, index, { quantity: e.target.value }))
                  }
                />
              </div>
              <div className="sm:col-span-2">
                <Label className="text-xs">URL تصویر — اختیاری</Label>
                <Input
                  className="mt-1"
                  value={variant.imageUrl}
                  placeholder="https://..."
                  dir="ltr"
                  onChange={(e) =>
                    onChange(patchVariant(variants, index, { imageUrl: e.target.value }))
                  }
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
