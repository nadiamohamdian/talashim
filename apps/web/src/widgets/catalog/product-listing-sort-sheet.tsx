'use client';

import { useEffect } from 'react';
import {
  PRODUCT_LISTING_SORT_OPTIONS,
  type ProductListingSortOptionId,
} from '@/shared/config/product-listing-filters';

interface ProductListingSortSheetProps {
  open: boolean;
  selected: ProductListingSortOptionId | null;
  onSelect: (id: ProductListingSortOptionId) => void;
  onClose: () => void;
}

export function ProductListingSortSheet({
  open,
  selected,
  onSelect,
  onClose,
}: ProductListingSortSheetProps) {
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
        className="product-listing-sheet product-listing-sort-sheet"
        role="dialog"
        aria-modal="true"
        aria-labelledby="product-listing-sort-title"
      >
        <h2 id="product-listing-sort-title" className="product-listing-sheet-title">
          مرتب سازی براساس
        </h2>

        <ul className="product-listing-sheet-options">
          {PRODUCT_LISTING_SORT_OPTIONS.map((option) => {
            const isChecked = selected === option.id;

            return (
              <li key={option.id}>
                <label className="product-listing-sheet-option">
                  <span className="product-listing-sheet-option-label">{option.label}</span>
                  <input
                    type="radio"
                    name="product-listing-sort"
                    className="product-listing-sheet-checkbox"
                    checked={isChecked}
                    onChange={() => {
                      onSelect(option.id);
                      onClose();
                    }}
                  />
                </label>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
