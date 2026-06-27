import type {
  BlogPostDetails,
  BlogPostSummary,
  PaginatedResponse,
  ProductDetails,
  ProductSummary,
  PublicCatalogCategoryPage,
} from '@sadafgold/types';
import { normalizeCatalogListResponse, normalizeCatalogPaginatedResponse } from '@/shared/lib/catalog-list-response';
import { enrichProductDetails, withLivePricingList } from '@/shared/lib/live-gold-pricing';
import {
  getBlogPostBySlug as getBlogPostBySlugFromBlogApi,
  getBlogPosts as getBlogPostsFromBlogApi,
  getFaqPosts as getFaqPostsFromBlogApi,
} from '@/shared/api/blog-api';
import {
  apiGet,
  serverFetchCatalogDetail,
  serverFetchCatalogList,
  serverFetchPaginatedCatalog,
} from '@/lib/api/client';
import type { ProductListParams, ProductSearchParams } from '@/lib/api/query-keys';

export interface CatalogCategory {
  slug: string;
  label: string;
  productCount: number;
}

export const productApi = {
  /** Client-side catalog list (authenticated/public). */
  list(params: ProductListParams = {}, signal?: AbortSignal): Promise<ProductSummary[]> {
    return apiGet<ProductSummary[]>('/catalog', {
      params: {
        limit: params.limit ?? 24,
        category: params.category,
        sale: params.sale ? '1' : undefined,
        minPrice: params.minPrice,
        maxPrice: params.maxPrice,
      },
      signal,
      abortKey: `products:list:${JSON.stringify(params)}`,
    });
  },

  search(
    params: ProductSearchParams,
    signal?: AbortSignal,
  ): Promise<PaginatedResponse<ProductSummary>> {
    return apiGet<PaginatedResponse<ProductSummary>>('/catalog', {
      params: {
        search: params.query,
        page: params.page ?? 1,
        limit: params.limit ?? 24,
        category: params.category,
      },
      signal,
      abortKey: `products:search:${params.query}:${params.page ?? 1}:${params.category ?? ''}`,
    });
  },

  getFeatured(signal?: AbortSignal): Promise<ProductSummary[]> {
    return apiGet<ProductSummary[]>('/catalog/featured', {
      signal,
      abortKey: 'products:featured',
    });
  },

  getBestsellers(signal?: AbortSignal): Promise<ProductSummary[]> {
    return apiGet<ProductSummary[]>('/catalog/bestsellers', {
      signal,
      abortKey: 'products:bestsellers',
    });
  },

  getCategories(signal?: AbortSignal): Promise<CatalogCategory[]> {
    return apiGet<CatalogCategory[]>('/catalog/categories', {
      signal,
      abortKey: 'products:categories',
    });
  },

  getBySlug(slug: string, signal?: AbortSignal): Promise<ProductDetails> {
    return apiGet<ProductDetails>(`/catalog/${slug}`, {
      signal,
      abortKey: `products:detail:${slug}`,
    });
  },

  /** Server-side helpers with ISR + live pricing enrichment. */
  async getFeaturedProducts(): Promise<ProductSummary[]> {
    const products = await serverFetchCatalogList<ProductSummary[]>('/catalog/featured', {
      revalidate: 60,
    });
    return withLivePricingList(products);
  },

  async getBestsellerProducts(): Promise<ProductSummary[]> {
    const products = await serverFetchCatalogList<ProductSummary[]>('/catalog/bestsellers', {
      revalidate: 120,
    });
    return withLivePricingList(products);
  },

  async getCatalogCategories(): Promise<CatalogCategory[]> {
    return serverFetchCatalogList<CatalogCategory[]>('/catalog/categories', {
      revalidate: 300,
    });
  },

  async getCatalogCategoryPage(slug: string): Promise<PublicCatalogCategoryPage | null> {
    try {
      return await serverFetchCatalogList<PublicCatalogCategoryPage>(
        `/catalog/categories/pages/${encodeURIComponent(slug)}`,
        { revalidate: 120, tags: [`catalog:category-page:${slug}`] },
      );
    } catch {
      return null;
    }
  },

  async getProductsPaginated(
    options: {
      page?: number;
      limit?: number;
      category?: string;
      sale?: boolean;
      minPrice?: number;
      maxPrice?: number;
      minWeight?: number;
      maxWeight?: number;
      sort?: string;
    } = {},
  ): Promise<PaginatedResponse<ProductSummary>> {
    const page = options.page ?? 1;
    const limit = options.limit ?? 9;
    const params = new URLSearchParams({
      page: String(page),
      limit: String(limit),
    });

    if (options.category) params.set('category', options.category);
    if (options.sale) params.set('sale', '1');
    if (options.minPrice != null) params.set('minPrice', String(options.minPrice));
    if (options.maxPrice != null) params.set('maxPrice', String(options.maxPrice));
    if (options.minWeight != null) params.set('minWeight', String(options.minWeight));
    if (options.maxWeight != null) params.set('maxWeight', String(options.maxWeight));
    if (options.sort) params.set('sort', options.sort);

    const path = `/catalog?${params}`;
    const raw = await serverFetchCatalogList<unknown>(path, {
      cache: 'no-store',
      tags: ['catalog:products'],
    });
    const result = normalizeCatalogPaginatedResponse(raw, page, limit);
    return {
      ...result,
      items: await withLivePricingList(result.items),
    };
  },

  async getProducts(
    limit = 24,
    category?: string,
    sale = false,
    priceFilter: { minPrice?: number; maxPrice?: number } = {},
  ): Promise<ProductSummary[]> {
    const params = new URLSearchParams({ limit: String(limit) });
    if (category) params.set('category', category);
    if (sale) params.set('sale', '1');
    if (priceFilter.minPrice != null) params.set('minPrice', String(priceFilter.minPrice));
    if (priceFilter.maxPrice != null) params.set('maxPrice', String(priceFilter.maxPrice));
    const path = `/catalog?${params}`;
    const hasPriceFilter = priceFilter.minPrice != null || priceFilter.maxPrice != null;
    const hasCategory = Boolean(category);
    const raw = await serverFetchCatalogList<unknown[]>(path, {
      cache: sale || hasPriceFilter || hasCategory ? 'no-store' : undefined,
      revalidate: sale || hasPriceFilter || hasCategory ? undefined : 60,
      tags: sale ? ['catalog:sale'] : ['catalog:products'],
    });
    const products = normalizeCatalogListResponse(raw);
    return withLivePricingList(products);
  },

  async getSaleProducts(limit = 48): Promise<ProductSummary[]> {
    const params = new URLSearchParams({ limit: String(limit), sale: '1' });
    const path = `/catalog?${params}`;
    const products = await serverFetchCatalogList<ProductSummary[]>(path, {
      cache: 'no-store',
      tags: ['catalog:sale'],
    });
    return withLivePricingList(products);
  },

  async searchProducts(
    query: string,
    page = 1,
    limit = 24,
    category?: string,
  ): Promise<PaginatedResponse<ProductSummary>> {
    const params = new URLSearchParams({
      search: query,
      page: String(page),
      limit: String(limit),
    });
    if (category) {
      params.set('category', category);
    }
    const result = await serverFetchPaginatedCatalog<ProductSummary>(
      `/catalog?${params}`,
      { revalidate: 30 },
      { page, limit },
    );
    return { ...result, items: await withLivePricingList(result.items) };
  },

  async getProductBySlug(slug: string): Promise<ProductDetails | null> {
    const product = await serverFetchCatalogDetail<ProductDetails>(`/catalog/${slug}`, {
      revalidate: 60,
      tags: [`catalog:product:${slug}`, 'catalog:products'],
    });
    if (!product) {
      return null;
    }
    return enrichProductDetails(product);
  },

  async getBlogPosts(): Promise<BlogPostSummary[]> {
    return getBlogPostsFromBlogApi();
  },

  async getFaqPosts(): Promise<BlogPostSummary[]> {
    return getFaqPostsFromBlogApi();
  },

  async getBlogPostBySlug(slug: string): Promise<BlogPostDetails | null> {
    return getBlogPostBySlugFromBlogApi(slug);
  },
};

export const {
  list: listProducts,
  search: searchProductsClient,
  getFeatured,
  getBestsellers,
  getCategories,
  getBySlug,
  getFeaturedProducts,
  getBestsellerProducts,
  getCatalogCategories,
  getCatalogCategoryPage,
  getProductsPaginated,
  getProducts,
  getSaleProducts,
  searchProducts,
  getProductBySlug,
  getBlogPosts,
  getFaqPosts,
  getBlogPostBySlug,
} = productApi;
