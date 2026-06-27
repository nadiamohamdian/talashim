import { z } from 'zod';
import type { CatalogCategoryFilterConfig } from '@sadafgold/types';
import { buildDefaultCatalogCategoryFilterConfig } from '@sadafgold/shared';

const sortOptionSchema = z.object({
  id: z.string().min(1).max(64),
  label: z.string().min(1).max(120),
  field: z.enum(['createdAt', 'priceToman', 'sales']),
  direction: z.enum(['asc', 'desc']),
  discountOnly: z.boolean().optional(),
});

const filterOptionSchema = z.object({
  id: z.string().min(1).max(64),
  label: z.string().min(1).max(120),
  minPrice: z.number().int().min(0).optional(),
  maxPrice: z.number().int().min(0).optional(),
  minWeight: z.number().min(0).optional(),
  maxWeight: z.number().min(0).optional(),
  searchTerms: z.array(z.string().min(1).max(64)).max(12).optional(),
});

const filterSectionSchema = z.object({
  id: z.string().min(1).max(64),
  title: z.string().min(1).max(120),
  options: z.array(filterOptionSchema).min(1).max(24),
});

const filterConfigSchema = z.object({
  sortOptions: z.array(sortOptionSchema).min(1).max(12),
  filterSections: z.array(filterSectionSchema).max(12),
});

export function parseCatalogCategoryFilterConfig(
  value: unknown,
  slug: string,
): CatalogCategoryFilterConfig {
  const parsed = filterConfigSchema.safeParse(value);
  if (parsed.success) {
    return parsed.data;
  }
  return buildDefaultCatalogCategoryFilterConfig(slug);
}

export function validateCatalogCategoryFilterConfig(value: unknown): CatalogCategoryFilterConfig {
  return filterConfigSchema.parse(value);
}

export function slugifyCatalogCategory(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[\s_]+/g, '-')
    .replace(/[^a-z0-9\u0600-\u06FF-]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}
