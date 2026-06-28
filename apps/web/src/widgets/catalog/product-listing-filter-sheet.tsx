'use client';

import { useEffect } from 'react';
import type { CatalogCategoryFilterConfig } from '@sadafgold/types';
import {
  PRODUCT_LISTING_FILTER_SECTIONS,
  PRODUCT_LISTING_GOLD_COLOR_OPTIONS,
  PRODUCT_LISTING_GOLD_COLOR_SECTION_TITLE,
} from '@/shared/config/product-listing-filters';
import {
  resolveActiveFilterIds,
  type ProductListingQueryState,
} from '@/shared/lib/product-listing-query';

interface ProductListingFilterSheetProps {
  open: boolean;
  filterConfig?: CatalogCategoryFilterConfig;
  queryState: ProductListingQueryState;
  onToggleFilter: (id: string, checked: boolean) => void;
  onClearAll: () => void;
  onClose: () => void;
}

export function ProductListingFilterSheet({
  open,
  filterConfig,
  queryState,
  onToggleFilter,
  onClearAll,
  onClose,
}: ProductListingFilterSheetProps) {
  useEffect(() => {
    if (!open) {
      return;
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    document.body.style.overflow = 'hidden';
    document.addEventListener('keydown', onKeyDown);

    return () => {
      document.body.style.overflow = '';
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [open, onClose]);

  if (!open) {
    return null;
  }

  const filterSections =
    filterConfig?.filterSections ??
    PRODUCT_LISTING_FILTER_SECTIONS.map((section) => ({
      id: section.id,
      title: section.title,
      options: section.options.map((option) => ({ ...option })),
    }));

  const activeFilterIds = new Set(resolveActiveFilterIds(queryState, filterConfig));

  return (
    <div className="product-listing-sheet-root" role="presentation">
      <button
        type="button"
        className="product-listing-sheet-backdrop"
        aria-label="بستن"
        onClick={onClose}
      />
      <div
        className="product-listing-sheet product-listing-filter-sheet"
        role="dialog"
        aria-modal="true"
        aria-label="فیلتر محصولات"
      >
        {filterSections.map((section) => (
          <section key={section.id} className="product-listing-filter-section">
            <h2 className="product-listing-sheet-title">{section.title}</h2>
            <ul className="product-listing-sheet-options">
              {section.options.map((option) => (
                <li key={option.id}>
                  <label className="product-listing-sheet-option">
                    <span className="product-listing-sheet-option-label">{option.label}</span>
                    <input
                      type="checkbox"
                      className="product-listing-sheet-checkbox"
                      checked={activeFilterIds.has(option.id)}
                      onChange={(event) => onToggleFilter(option.id, event.target.checked)}
                    />
                  </label>
                </li>
              ))}
            </ul>
          </section>
        ))}

        <section className="product-listing-filter-section">
          <h2 className="product-listing-sheet-title">{PRODUCT_LISTING_GOLD_COLOR_SECTION_TITLE}</h2>
          <div className="product-listing-filter-color-chips">
            {PRODUCT_LISTING_GOLD_COLOR_OPTIONS.map((color) => {
              const colorFilterId = `gold-color-${color.id}`;
              const isActive = activeFilterIds.has(colorFilterId);

              return (
                <button
                  key={color.id}
                  type="button"
                  className={`product-listing-filter-color-chip${isActive ? ' is-active' : ''}`}
                  aria-pressed={isActive}
                  onClick={() => onToggleFilter(colorFilterId, !isActive)}
                >
                  {color.label}
                </button>
              );
            })}
          </div>
        </section>

        <button type="button" className="product-listing-filter-clear" onClick={onClearAll}>
          حذف همه فیلترها
        </button>
      </div>
    </div>
  );
}
