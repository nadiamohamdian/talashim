export type CatalogCategorySortField = 'createdAt' | 'priceToman' | 'sales';
export type CatalogCategorySortDirection = 'asc' | 'desc';
export interface CatalogCategorySortOption {
    id: string;
    label: string;
    field: CatalogCategorySortField;
    direction: CatalogCategorySortDirection;
    discountOnly?: boolean;
}
export interface CatalogCategoryFilterOption {
    id: string;
    label: string;
    minPrice?: number;
    maxPrice?: number;
    minWeight?: number;
    maxWeight?: number;
    searchTerms?: string[];
}
export interface CatalogCategoryFilterSection {
    id: string;
    title: string;
    options: CatalogCategoryFilterOption[];
}
export interface CatalogCategoryFilterConfig {
    sortOptions: CatalogCategorySortOption[];
    filterSections: CatalogCategoryFilterSection[];
}
export interface PublicCatalogCategoryPage {
    slug: string;
    title: string;
    subtitle: string | null;
    heroImageUrls: string[];
    filterConfig: CatalogCategoryFilterConfig;
    productCategory: string | null;
    seoTitle: string | null;
    seoDescription: string | null;
}
export interface AdminCatalogCategoryPageDto extends PublicCatalogCategoryPage {
    id: string;
    sortOrder: number;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}
export interface CreateCatalogCategoryPageDto {
    slug: string;
    title: string;
    subtitle?: string | null;
    heroImageUrls?: string[];
    filterConfig: CatalogCategoryFilterConfig;
    productCategory?: string | null;
    sortOrder?: number;
    isActive?: boolean;
    seoTitle?: string | null;
    seoDescription?: string | null;
}
export type UpdateCatalogCategoryPageDto = Partial<CreateCatalogCategoryPageDto>;
//# sourceMappingURL=catalog-category-page.d.ts.map