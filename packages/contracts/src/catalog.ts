export type ProductCategory = "ring" | "necklace" | "bracelet" | "coin";

export interface ProductSummary {
  id: string;
  slug: string;
  title: string;
  category: ProductCategory;
  karat: number;
  weightGram: number;
  makingFeePercent: number;
  priceToman: number;
  imageUrl: string;
  inventory: number;
  featured?: boolean;
}

export interface ProductDetails extends ProductSummary {
  description: string;
  seoDescription: string;
}
