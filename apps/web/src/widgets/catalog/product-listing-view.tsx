'use client';

import Link from 'next/link';
import { useCallback, useState, type PropsWithChildren } from 'react';
import type { ProductSummary } from '@sadafgold/types';
import {
  PRODUCT_LISTING_CAROUSEL_SLIDES,
  PRODUCT_LISTING_PAGE,
  type ProductListingPageMeta,
} from '@/shared/config/product-listing-meta';
import type {
  ProductListingGoldColorId,
  ProductListingSortOptionId,
} from '@/shared/config/product-listing-filters';
import { ProductListingCard } from '@/widgets/catalog/product-listing-card';
import { ProductListingFilterSheet } from '@/widgets/catalog/product-listing-filter-sheet';
import { ProductListingHeroCarousel } from '@/widgets/catalog/product-listing-hero-carousel';
import { ProductListingSortSheet } from '@/widgets/catalog/product-listing-sort-sheet';
import { ProductListingToolbar } from '@/widgets/catalog/product-listing-toolbar';

interface ProductListingViewProps extends PropsWithChildren {
  products: ProductSummary[];
  meta?: ProductListingPageMeta;
  showDefaultHero?: boolean;
  emptyMessage?: string;
  isLoading?: boolean;
  loadingMessage?: string;
}

export function ProductListingView({
  products,
  meta = PRODUCT_LISTING_PAGE,
  children,
  showDefaultHero = true,
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
    <div className="product-listing-page store-chrome-light store-minimal-header">
      <div className="product-listing-inner">
        <header className="product-listing-header">
          {meta.breadcrumbs && meta.breadcrumbs.length > 0 ? (
            <nav className="product-listing-breadcrumbs" aria-label="مسیر دسته‌بندی">
              {meta.breadcrumbs.map((crumb, index) => {
                const isLast = index === meta.breadcrumbs!.length - 1;
                const className = isLast
                  ? 'product-listing-breadcrumb product-listing-breadcrumb--current'
                  : 'product-listing-breadcrumb';

                if (crumb.href && !isLast) {
                  return (
                    <Link key={`${crumb.label}-${index}`} href={crumb.href} className={className}>
                      {crumb.label}
                    </Link>
                  );
                }

                return (
                  <span key={`${crumb.label}-${index}`} className={className}>
                    {crumb.label}
                  </span>
                );
              })}
            </nav>
          ) : (
            <h1 className="product-listing-title">{meta.title}</h1>
          )}
          {meta.subtitle ? <p className="product-listing-subtitle">{meta.subtitle}</p> : null}
        </header>

        {children ??
          (showDefaultHero ? (
            <ProductListingHeroCarousel slides={PRODUCT_LISTING_CAROUSEL_SLIDES} />
          ) : null)}

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
