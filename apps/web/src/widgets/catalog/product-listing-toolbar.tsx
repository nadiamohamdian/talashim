'use client';

interface ProductListingToolbarProps {
  onSortOpen: () => void;
  onFilterOpen: () => void;
}

export function ProductListingToolbar({ onSortOpen, onFilterOpen }: ProductListingToolbarProps) {
  return (
    <div className="product-listing-toolbar">
      <div className="product-listing-toolbar-inner">
        <button type="button" className="product-listing-toolbar-action" onClick={onFilterOpen}>
          فیلتر
        </button>
        <span className="product-listing-toolbar-divider" aria-hidden />
        <button type="button" className="product-listing-toolbar-action" onClick={onSortOpen}>
          مرتب‌سازی
        </button>
      </div>
    </div>
  );
}
