import type { BlogPostDetails, BlogPostSummary } from "@gold/types";
import {
  fallbackBlogDetails,
  fallbackBlogPosts,
} from "@/entities/blog/model/types";
import { apiRequest } from "./http";

export async function getBlogPosts() {
  try {
    return await apiRequest<BlogPostSummary[]>("/blog", {
      revalidate: 300,
    });
  } catch {
    return fallbackBlogPosts;
  }
}

export async function getBlogPostBySlug(slug: string) {
  try {
    return await apiRequest<BlogPostDetails>(`/blog/${slug}`, {
      revalidate: 300,
    });
  } catch {
    return fallbackBlogDetails[slug] ?? fallbackBlogDetails["how-to-buy-gold-online"];
  }
}
