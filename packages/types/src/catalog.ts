/** Commercial product line — drives pricing rules, PDP template, and filters. */
export type ProductType =
  | 'melted_gold'
  | 'gold_jewelry'
  | 'coins'
  | 'investment_gold'
  | 'wholesale';

/** Browse taxonomy (navigation / SEO landing pages). */
export type ProductCategorySlug =
  | 'rings'
  | 'necklaces'
  | 'bracelets'
  | 'earrings'
  | 'coins'
  | 'bars'
  | 'melted'
  | 'investment'
  | 'wholesale';

/** Legacy API category enum (migrate → ProductCategorySlug). */
export type ProductCategory = 'ring' | 'necklace' | 'bracelet' | 'coin';

export type ProductStatus = 'draft' | 'active' | 'archived' | 'out_of_stock';

export interface ProductSeoMetadata {
  title: string;
  description: string;
  keywords?: string[];
  ogImageUrl?: string;
  canonicalPath?: string;
  noIndex?: boolean;
}

export interface ProductImage {
  id: string;
  url: string;
  alt: string;
  width?: number;
  height?: number;
  sortOrder: number;
}

export interface ProductGallery {
  primaryImageUrl: string;
  images: ProductImage[];
}

export interface ProductPricing {
  livePriceToman: number;
  wagePercent: number;
  wageFixedToman?: number;
  taxPercent: number;
  finalPriceToman: number;
  pricedAt: string;
}

export interface ProductInventory {
  quantity: number;
  reserved: number;
  available: number;
  lowStockThreshold?: number;
}

/** Current REST API list shape (backward compatible). */
export interface ProductSummary {
  id: string;
  sku: string;
  slug: string;
  title: string;
  category: ProductCategory;
  karat: number;
  weightGram: number;
  makingFeePercent: number;
  priceToman: number;
  compareAtPriceToman?: number | null;
  discountPercent?: number | null;
  discountStartsAt?: string | null;
  discountEndsAt?: string | null;
  imageUrl: string;
  inventory: number;
  featured?: boolean;
  pricing?: ProductPricing;
}

export interface ProductDetails extends ProductSummary {
  description: string;
  seoDescription: string;
  color?: string;
  specifications?: Record<string, string>;
}

/** Target storefront catalog model (full IA — align API in P1). */
export interface StorefrontProductSummary {
  id: string;
  sku: string;
  slug: string;
  title: string;
  shortDescription: string;
  productType: ProductType;
  category: ProductCategorySlug;
  purity: number;
  weightGram: number;
  finalPriceToman: number;
  imageUrl: string;
  inventory: ProductInventory;
  status: ProductStatus;
  tags: string[];
  featured?: boolean;
  createdAt: string;
}

export interface StorefrontProductDetails extends StorefrontProductSummary {
  fullDescription: string;
  gallery: ProductGallery;
  pricing: ProductPricing;
  seo: ProductSeoMetadata;
}
