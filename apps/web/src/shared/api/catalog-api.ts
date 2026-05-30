import type { ProductDetails, ProductSummary } from "@gold/types";
import {
  fallbackFeaturedProducts,
  fallbackProductDetails,
} from "@/entities/product/model/types";
import { apiRequest } from "./http";

export async function getFeaturedProducts() {
  try {
    return await apiRequest<ProductSummary[]>("/catalog/featured", {
      revalidate: 120,
    });
  } catch {
    return fallbackFeaturedProducts;
  }
}

export async function getProductBySlug(slug: string) {
  try {
    return await apiRequest<ProductDetails>(`/catalog/${slug}`, {
      revalidate: 120,
    });
  } catch {
    return fallbackProductDetails[slug] ?? fallbackProductDetails["royal-ring"];
  }
}
