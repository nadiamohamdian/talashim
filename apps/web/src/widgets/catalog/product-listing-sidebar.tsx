'use client';

import type { CatalogCategoryFilterConfig } from '@sadafgold/types';
import {
  getSortOptions,
  resolveActiveFilterIds,
  type ProductListingQueryState,
} from '@/shared/lib/product-listing-query';
import { DEFAULT_CATALOG_CATEGORY_SORT_OPTIONS } from '@sadafgold/shared';
import { PRODUCT_LISTING_FILTER_SECTIONS } from '@/shared/config/product-listing-filters';

interface ProductListingSidebarProps {
  filterConfig?: CatalogCategoryFilterConfig;
  queryState: ProductListingQueryState;
  onSortChange: (sortId: string) => void;
  onToggleFilter: (optionId: string, checked: boolean) => void;
  onClearFilters: () => void;
}

export function ProductListingSidebar({
  filterConfig,
  queryState,
  onSortChange,
  onToggleFilter,
  onClearFilters,
}: ProductListingSidebarProps) {
  const sortOptions = getSortOptions(filterConfig, DEFAULT_CATALOG_CATEGORY_SORT_OPTIONS);
  const filterSections =
    filterConfig?.filterSections ??
    PRODUCT_LISTING_FILTER_SECTIONS.map((section) => ({
      id: section.id,
      title: section.title,
      options: section.options.map((option) => ({ ...option })),
    }));

  const activeFilterIds = new Set(
    resolveActiveFilterIds(queryState, filterConfig),
  );

  return (
    <aside className="product-listing-sidebar" aria-label="فیلتر و مرتب‌سازی محصولات">
      <section className="product-listing-sidebar-section">
        <h2 className="product-listing-sidebar-title">مرتب سازی براساس</h2>
        <ul className="product-listing-sidebar-options">
          {sortOptions.map((option) => (
            <li key={option.id}>
              <label className="product-listing-sidebar-option">
                <input
                  type="radio"
                  name="product-listing-sort"
                  className="product-listing-sidebar-checkbox"
                  checked={queryState.sort === option.id}
                  onChange={() => onSortChange(option.id)}
                />
                <span>{option.label}</span>
              </label>
            </li>
          ))}
        </ul>
      </section>

      {filterSections.map((section) => (
        <section key={section.id} className="product-listing-sidebar-section">
          <h2 className="product-listing-sidebar-title">{section.title}</h2>
          <ul className="product-listing-sidebar-options">
            {section.options.map((option) => (
              <li key={option.id}>
                <label className="product-listing-sidebar-option">
                  <input
                    type="checkbox"
                    className="product-listing-sidebar-checkbox"
                    checked={activeFilterIds.has(option.id)}
                    onChange={(event) => onToggleFilter(option.id, event.target.checked)}
                  />
                  <span>{option.label}</span>
                </label>
              </li>
            ))}
          </ul>
        </section>
      ))}

      <button type="button" className="product-listing-filter-clear" onClick={onClearFilters}>
        حذف همه فیلترها
      </button>
    </aside>
  );
}
