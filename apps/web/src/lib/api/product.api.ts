import type {
  BlogPostDetails,
  BlogPostSummary,
  PaginatedResponse,
  ProductDetails,
  ProductSummary,
} from '@sadafgold/types';
import { enrichProductDetails, withLivePricingList } from '@/shared/lib/live-gold-pricing';
import {
  apiGet,
  serverFetch,
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
      },
      signal,
      abortKey: `products:search:${params.query}:${params.page ?? 1}`,
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

  async getProducts(limit = 24, category?: string, sale = false): Promise<ProductSummary[]> {
    const params = new URLSearchParams({ limit: String(limit) });
    if (category) params.set('category', category);
    if (sale) params.set('sale', '1');
    const path = `/catalog?${params}`;
    const products = await serverFetchCatalogList<ProductSummary[]>(path, {
      revalidate: 60,
    });
    return withLivePricingList(products);
  },

  async searchProducts(
    query: string,
    page = 1,
    limit = 24,
  ): Promise<PaginatedResponse<ProductSummary>> {
    const params = new URLSearchParams({
      search: query,
      page: String(page),
      limit: String(limit),
    });
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
    });
    if (!product) {
      return null;
    }
    return enrichProductDetails(product);
  },

  async getBlogPosts(): Promise<BlogPostSummary[]> {
    return serverFetchCatalogList<BlogPostSummary[]>('/blog', { revalidate: 300 });
  },

  async getFaqPosts(): Promise<BlogPostSummary[]> {
    return serverFetchCatalogList<BlogPostSummary[]>('/blog?category=faq&limit=20', {
      tags: ['content:faq'],
      cache: 'no-store',
    });
  },

  async getBlogPostBySlug(slug: string): Promise<BlogPostDetails> {
    return serverFetch<BlogPostDetails>(`/blog/${slug}`, { revalidate: 300 });
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
  getProducts,
  searchProducts,
  getProductBySlug,
  getBlogPosts,
  getFaqPosts,
  getBlogPostBySlug,
} = productApi;
