'use client';

import { useCallback, useState, type ReactNode } from 'react';
import type { ProductSummary } from '@sadafgold/types';
import {
  PRODUCT_LISTING_CAROUSEL_SLIDES,
  PRODUCT_LISTING_PAGE,
  type ProductListingPageMeta,
} from '@/shared/config/product-listing-demo';
import type {
  ProductListingGoldColorId,
  ProductListingSortOptionId,
} from '@/shared/config/product-listing-filters';
import { ProductListingCard } from '@/widgets/catalog/product-listing-card';
import { ProductListingFilterSheet } from '@/widgets/catalog/product-listing-filter-sheet';
import { ProductListingHeroCarousel } from '@/widgets/catalog/product-listing-hero-carousel';
import { ProductListingSortSheet } from '@/widgets/catalog/product-listing-sort-sheet';
import { ProductListingToolbar } from '@/widgets/catalog/product-listing-toolbar';

interface ProductListingViewProps {
  products: ProductSummary[];
  meta?: ProductListingPageMeta;
  hero?: ReactNode;
  emptyMessage?: string;
  isLoading?: boolean;
  loadingMessage?: string;
}

export function ProductListingView({
  products,
  meta = PRODUCT_LISTING_PAGE,
  hero,
  emptyMessage = 'محصولی یافت نشد.',
  isLoading = false,
  loadingMessage = 'در حال بارگذاری...',
}: ProductListingViewProps) {
  const [sortOpen, setSortOpen] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);
  const [selectedSort, setSelectedSort] = useState<ProductListingSortOptionId | null>(null);
  const [selectedFilters, setSelectedFilters] = useState<Set<string>>(new Set());
  const [selectedGoldColors, setSelectedGoldColors] = useState<Set<ProductListingGoldColorId>>(
    new Set(),
  );

  const toggleFilter = useCallback((id: string) => {
    setSelectedFilters((current) => {
      const next = new Set(current);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }, []);

  const toggleGoldColor = useCallback((id: ProductListingGoldColorId) => {
    setSelectedGoldColors((current) => {
      const next = new Set(current);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }, []);

  const clearAllFilters = useCallback(() => {
    setSelectedFilters(new Set());
    setSelectedGoldColors(new Set());
  }, []);

  return (
    <div className="product-listing-page store-minimal-header">
      <div className="product-listing-inner">
        <header className="product-listing-header">
          <h1 className="product-listing-title">{meta.title}</h1>
          <p className="product-listing-subtitle">{meta.subtitle}</p>
        </header>

        {hero ?? <ProductListingHeroCarousel slides={PRODUCT_LISTING_CAROUSEL_SLIDES} />}

        <ProductListingToolbar
          onSortOpen={() => setSortOpen(true)}
          onFilterOpen={() => setFilterOpen(true)}
        />

        {isLoading ? (
          <p className="product-listing-empty">{loadingMessage}</p>
        ) : products.length === 0 ? (
          <p className="product-listing-empty">{emptyMessage}</p>
        ) : (
          <div className="product-listing-grid">
            {products.map((product) => (
              <ProductListingCard key={product.id} product={product} />
            ))}
          </div>
        )}

      </div>

      <ProductListingSortSheet
        open={sortOpen}
        selected={selectedSort}
        onSelect={setSelectedSort}
        onClose={() => setSortOpen(false)}
      />

      <ProductListingFilterSheet
        open={filterOpen}
        selectedFilters={selectedFilters}
        selectedGoldColors={selectedGoldColors}
        onToggleFilter={toggleFilter}
        onToggleGoldColor={toggleGoldColor}
        onClearAll={clearAllFilters}
        onClose={() => setFilterOpen(false)}
      />
    </div>
  );
}
