import type {
  CatalogCategoryFilterConfig,
  CatalogCategoryFilterOption,
  CatalogCategorySortOption,
} from '@sadafgold/types';
import type { ProductSummary } from '@sadafgold/types';

export interface ProductListingQueryState {
  sort: string | null;
  filterIds: string[];
  page: number;
  minPrice?: number;
  maxPrice?: number;
  minWeight?: number;
  maxWeight?: number;
}

export function parseProductListingQuery(params: URLSearchParams): ProductListingQueryState {
  const filters = params.get('filters')?.split(',').map((item) => item.trim()).filter(Boolean) ?? [];
  const minPrice = parseOptionalInt(params.get('minPrice'));
  const maxPrice = parseOptionalInt(params.get('maxPrice'));
  const minWeight = parseOptionalFloat(params.get('minWeight'));
  const maxWeight = parseOptionalFloat(params.get('maxWeight'));

  return {
    sort: params.get('sort'),
    filterIds: filters,
    page: Math.max(1, parseOptionalInt(params.get('page')) ?? 1),
    minPrice,
    maxPrice,
    minWeight,
    maxWeight,
  };
}

export function buildProductListingSearchParams(
  state: ProductListingQueryState,
  baseParams: URLSearchParams,
): URLSearchParams {
  const next = new URLSearchParams(baseParams);

  if (state.sort) {
    next.set('sort', state.sort);
  } else {
    next.delete('sort');
  }

  if (state.filterIds.length > 0) {
    next.set('filters', state.filterIds.join(','));
  } else {
    next.delete('filters');
  }

  if (state.page > 1) {
    next.set('page', String(state.page));
  } else {
    next.delete('page');
  }

  setOptionalNumber(next, 'minPrice', state.minPrice);
  setOptionalNumber(next, 'maxPrice', state.maxPrice);
  setOptionalNumber(next, 'minWeight', state.minWeight);
  setOptionalNumber(next, 'maxWeight', state.maxWeight);

  return next;
}

export function resolveActiveFilterIds(
  state: ProductListingQueryState,
  config?: CatalogCategoryFilterConfig,
): string[] {
  if (!config) {
    return state.filterIds;
  }

  const derived = new Set(state.filterIds);

  for (const section of config.filterSections) {
    for (const option of section.options) {
      const matchesPrice =
        option.minPrice != null || option.maxPrice != null
          ? state.minPrice === option.minPrice && state.maxPrice === option.maxPrice
          : false;
      const matchesWeight =
        option.minWeight != null || option.maxWeight != null
          ? state.minWeight === option.minWeight && state.maxWeight === option.maxWeight
          : false;

      if (matchesPrice || matchesWeight) {
        derived.add(option.id);
      }
    }
  }

  return [...derived];
}

export function applyFilterSelection(
  state: ProductListingQueryState,
  config: CatalogCategoryFilterConfig,
  optionId: string,
  checked: boolean,
): ProductListingQueryState {
  const option = findFilterOption(config, optionId);
  if (!option) {
    return state;
  }

  const nextFilterIds = new Set(state.filterIds);
  let minPrice = state.minPrice;
  let maxPrice = state.maxPrice;
  let minWeight = state.minWeight;
  let maxWeight = state.maxWeight;

  const isPriceOption = option.minPrice != null || option.maxPrice != null;
  const isWeightOption = option.minWeight != null || option.maxWeight != null;

  if (checked) {
    if (isPriceOption) {
      for (const section of config.filterSections) {
        for (const item of section.options) {
          if (item.minPrice != null || item.maxPrice != null) {
            nextFilterIds.delete(item.id);
          }
        }
      }
      minPrice = option.minPrice;
      maxPrice = option.maxPrice;
      nextFilterIds.add(option.id);
    } else if (isWeightOption) {
      for (const section of config.filterSections) {
        for (const item of section.options) {
          if (item.minWeight != null || item.maxWeight != null) {
            nextFilterIds.delete(item.id);
          }
        }
      }
      minWeight = option.minWeight;
      maxWeight = option.maxWeight;
      nextFilterIds.add(option.id);
    } else {
      nextFilterIds.add(option.id);
    }
  } else {
    nextFilterIds.delete(option.id);
    if (isPriceOption) {
      minPrice = undefined;
      maxPrice = undefined;
    }
    if (isWeightOption) {
      minWeight = undefined;
      maxWeight = undefined;
    }
  }

  return {
    ...state,
    page: 1,
    filterIds: [...nextFilterIds],
    minPrice,
    maxPrice,
    minWeight,
    maxWeight,
  };
}

export function applySortSelection(
  state: ProductListingQueryState,
  sortId: string,
): ProductListingQueryState {
  return {
    ...state,
    page: 1,
    sort: sortId,
  };
}

export function clearProductListingFilters(
  state: ProductListingQueryState,
): ProductListingQueryState {
  return {
    ...state,
    page: 1,
    filterIds: [],
    minPrice: undefined,
    maxPrice: undefined,
    minWeight: undefined,
    maxWeight: undefined,
  };
}

export function filterProductsBySearchTerms(
  products: ProductSummary[],
  config: CatalogCategoryFilterConfig | undefined,
  filterIds: string[],
): ProductSummary[] {
  if (!config || filterIds.length === 0) {
    return products;
  }

  const termGroups = filterIds
    .map((id) => findFilterOption(config, id))
    .filter((option): option is CatalogCategoryFilterOption => Boolean(option))
    .filter((option) => option.searchTerms && option.searchTerms.length > 0)
    .map((option) => option.searchTerms ?? []);

  if (termGroups.length === 0) {
    return products;
  }

  return products.filter((product) =>
    termGroups.every((terms) =>
      terms.some((term) => product.title.toLowerCase().includes(term.toLowerCase())),
    ),
  );
}

function findFilterOption(
  config: CatalogCategoryFilterConfig,
  optionId: string,
): CatalogCategoryFilterOption | undefined {
  for (const section of config.filterSections) {
    const option = section.options.find((item) => item.id === optionId);
    if (option) {
      return option;
    }
  }
  return undefined;
}

function parseOptionalInt(value: string | null): number | undefined {
  if (!value) {
    return undefined;
  }
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) ? parsed : undefined;
}

function parseOptionalFloat(value: string | null): number | undefined {
  if (!value) {
    return undefined;
  }
  const parsed = Number.parseFloat(value);
  return Number.isFinite(parsed) ? parsed : undefined;
}

function setOptionalNumber(
  params: URLSearchParams,
  key: string,
  value: number | undefined,
): void {
  if (value == null) {
    params.delete(key);
    return;
  }
  params.set(key, String(value));
}

export function getSortOptions(
  config?: CatalogCategoryFilterConfig,
  fallback: CatalogCategorySortOption[] = [],
): CatalogCategorySortOption[] {
  if (config?.sortOptions?.length) {
    return config.sortOptions;
  }
  return fallback;
}

export function getFilterSections(config?: CatalogCategoryFilterConfig) {
  return config?.filterSections ?? [];
}

export function hasActiveListingQuery(
  state: ProductListingQueryState,
  priceFilter: { minPrice?: number; maxPrice?: number } = {},
): boolean {
  return (
    Boolean(state.sort) ||
    state.filterIds.length > 0 ||
    state.page > 1 ||
    state.minPrice != null ||
    state.maxPrice != null ||
    state.minWeight != null ||
    state.maxWeight != null ||
    priceFilter.minPrice != null ||
    priceFilter.maxPrice != null
  );
}

export function getEffectivePriceFilter(
  state: ProductListingQueryState,
  priceFilter: { minPrice?: number; maxPrice?: number } = {},
): { minPrice?: number; maxPrice?: number } {
  return {
    minPrice: state.minPrice ?? priceFilter.minPrice,
    maxPrice: state.maxPrice ?? priceFilter.maxPrice,
  };
}

export function filterProductsByWeight<T extends Pick<ProductSummary, 'weightGram'>>(
  products: T[],
  minWeight?: number,
  maxWeight?: number,
): T[] {
  if (minWeight == null && maxWeight == null) {
    return products;
  }

  return products.filter((product) => {
    const weight = product.weightGram ?? 0;
    if (minWeight != null && weight < minWeight) {
      return false;
    }
    if (maxWeight != null && weight > maxWeight) {
      return false;
    }
    return true;
  });
}
