'use client';

import { useEffect } from 'react';
import {
  PRODUCT_LISTING_FILTER_SECTIONS,
  PRODUCT_LISTING_GOLD_COLOR_OPTIONS,
  PRODUCT_LISTING_GOLD_COLOR_SECTION_TITLE,
  type ProductListingGoldColorId,
} from '@/shared/config/product-listing-filters';

interface ProductListingFilterSheetProps {
  open: boolean;
  selectedFilters: ReadonlySet<string>;
  selectedGoldColors: ReadonlySet<ProductListingGoldColorId>;
  onToggleFilter: (id: string) => void;
  onToggleGoldColor: (id: ProductListingGoldColorId) => void;
  onClearAll: () => void;
  onClose: () => void;
}

export function ProductListingFilterSheet({
  open,
  selectedFilters,
  selectedGoldColors,
  onToggleFilter,
  onToggleGoldColor,
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
        {PRODUCT_LISTING_FILTER_SECTIONS.map((section) => (
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
                      checked={selectedFilters.has(option.id)}
                      onChange={() => onToggleFilter(option.id)}
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
              const isActive = selectedGoldColors.has(color.id);

              return (
                <button
                  key={color.id}
                  type="button"
                  className={
                    isActive
                      ? 'product-listing-filter-color-chip is-active'
                      : 'product-listing-filter-color-chip'
                  }
                  onClick={() => onToggleGoldColor(color.id)}
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
