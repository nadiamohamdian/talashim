'use client';

import { useEffect, useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Button, Input, Label, Skeleton } from '@talashim/ui';
import type { AdminProductDto } from '@talashim/types';
import { fetchAdminProduct, fetchAdminProducts } from '@/features/commerce/api/commerce-api';
import { formatToman } from '@/features/commerce/lib/labels';

const MAX_PRODUCTS = 48;

interface BannerProductPickerProps {
  value: string[];
  onChange: (productIds: string[]) => void;
}

export function BannerProductPicker({ value, onChange }: BannerProductPickerProps) {
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<Record<string, AdminProductDto>>({});

  const missingIds = useMemo(
    () => value.filter((id) => !selected[id]),
    [selected, value],
  );

  useEffect(() => {
    if (missingIds.length === 0) {
      return;
    }

    let cancelled = false;

    void Promise.all(missingIds.map((id) => fetchAdminProduct(id).catch(() => null))).then(
      (products) => {
        if (cancelled) {
          return;
        }

        setSelected((current) => {
          const next = { ...current };
          for (const product of products) {
            if (product) {
              next[product.id] = product;
            }
          }
          return next;
        });
      },
    );

    return () => {
      cancelled = true;
    };
  }, [missingIds]);

  const { data, isLoading, isFetching } = useQuery({
    queryKey: ['admin', 'commerce', 'banner-product-picker', search],
    queryFn: () =>
      fetchAdminProducts({
        page: 1,
        search: search.trim() || undefined,
      }),
    enabled: search.trim().length >= 2,
  });

  const selectedProducts = value
    .map((id) => selected[id])
    .filter((product): product is AdminProductDto => product != null);

  const addProduct = (product: AdminProductDto) => {
    if (value.includes(product.id)) {
      return;
    }
    if (value.length >= MAX_PRODUCTS) {
      return;
    }
    setSelected((current) => ({ ...current, [product.id]: product }));
    onChange([...value, product.id]);
  };

  const removeProduct = (productId: string) => {
    onChange(value.filter((id) => id !== productId));
  };

  return (
    <div className="space-y-3 rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface)] p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <Label>محصولات این بنر</Label>
          <p className="mt-1 text-xs text-[var(--muted-foreground)]">
            با کلیک روی بنر، فقط این محصولات در فروشگاه نمایش داده می‌شوند.
          </p>
        </div>
        <span className="text-xs text-[var(--muted-foreground)]">
          {value.length}/{MAX_PRODUCTS}
        </span>
      </div>

      {selectedProducts.length > 0 ? (
        <ul className="space-y-2">
          {selectedProducts.map((product) => (
            <li
              key={product.id}
              className="flex items-center gap-3 rounded-xl border border-[var(--border-subtle)] bg-[var(--card)] p-2.5"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={product.imageUrl}
                alt={product.title}
                className="size-11 shrink-0 rounded-lg object-cover"
              />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-foreground">{product.title}</p>
                <p className="mt-0.5 text-xs text-[var(--muted-foreground)]">
                  {product.sku} · {formatToman(product.priceToman)}
                </p>
              </div>
              <Button
                type="button"
                variant="ghost"
                className="h-8 px-2 text-xs text-[var(--error)]"
                onClick={() => removeProduct(product.id)}
              >
                حذف
              </Button>
            </li>
          ))}
        </ul>
      ) : (
        <p className="rounded-xl border border-dashed border-[var(--border-subtle)] px-4 py-6 text-center text-sm text-[var(--muted-foreground)]">
          هنوز محصولی انتخاب نشده.
        </p>
      )}

      <div>
        <Label>افزودن محصول</Label>
        <Input
          className="mt-1"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="جستجو با عنوان یا SKU (حداقل ۲ کاراکتر)"
        />
      </div>

      {search.trim().length >= 2 ? (
        <div className="max-h-56 space-y-2 overflow-y-auto rounded-xl border border-[var(--border-subtle)] bg-[var(--card)] p-2">
          {isLoading || isFetching ? (
            <Skeleton className="h-14 w-full" />
          ) : data?.items.length ? (
            data.items.map((product) => {
              const isSelected = value.includes(product.id);
              const isDisabled = !isSelected && value.length >= MAX_PRODUCTS;

              return (
                <div
                  key={product.id}
                  className="flex items-center gap-3 rounded-lg px-2 py-2 hover:bg-[var(--surface)]"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={product.imageUrl}
                    alt={product.title}
                    className="size-10 shrink-0 rounded-lg object-cover"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{product.title}</p>
                    <p className="text-xs text-[var(--muted-foreground)]">{product.sku}</p>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    className="h-8 px-3 text-xs"
                    disabled={isSelected || isDisabled}
                    onClick={() => addProduct(product)}
                  >
                    {isSelected ? 'انتخاب شده' : 'افزودن'}
                  </Button>
                </div>
              );
            })
          ) : (
            <p className="px-2 py-4 text-center text-sm text-[var(--muted-foreground)]">
              محصولی یافت نشد.
            </p>
          )}
        </div>
      ) : null}
    </div>
  );
}
