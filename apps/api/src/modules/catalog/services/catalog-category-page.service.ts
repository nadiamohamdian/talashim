import { Injectable, NotFoundException } from '@nestjs/common';
import {
  DEFAULT_CATALOG_CATEGORY_SEEDS,
  buildDefaultCatalogCategoryFilterConfig,
} from '@sadafgold/shared';
import type { PublicCatalogCategoryPage } from '@sadafgold/types';
import type { CatalogCategoryPage, Prisma } from '@/generated/prisma';
import { CatalogCategoryPageRepository } from '../repositories/catalog-category-page.repository';
import {
  parseCatalogCategoryFilterConfig,
  slugifyCatalogCategory,
} from '../lib/catalog-category-page.util';

@Injectable()
export class CatalogCategoryPageService {
  constructor(private readonly repository: CatalogCategoryPageRepository) {}

  async ensureDefaults(): Promise<void> {
    for (const seed of DEFAULT_CATALOG_CATEGORY_SEEDS) {
      const existing = await this.repository.findBySlug(seed.slug);
      if (existing) {
        continue;
      }

      await this.repository.create({
        slug: seed.slug,
        title: seed.title,
        subtitle: seed.subtitle,
        productCategory: seed.productCategory ?? undefined,
        heroImageUrls: [],
        filterConfig: buildDefaultCatalogCategoryFilterConfig(
          seed.slug,
        ) as unknown as Prisma.InputJsonValue,
        sortOrder: seed.sortOrder,
        isActive: true,
      });
    }
  }

  async listPublic(): Promise<PublicCatalogCategoryPage[]> {
    await this.ensureDefaults();
    const rows = await this.repository.findAllActive();
    return rows.map((row) => this.toPublicDto(row));
  }

  async findPublicBySlug(slug: string): Promise<PublicCatalogCategoryPage> {
    await this.ensureDefaults();
    const normalized = slugifyCatalogCategory(slug);
    const row = await this.repository.findBySlug(normalized);
    if (!row || !row.isActive) {
      throw new NotFoundException('دسته‌بندی یافت نشد');
    }
    return this.toPublicDto(row);
  }

  private toPublicDto(row: CatalogCategoryPage): PublicCatalogCategoryPage {
    return {
      slug: row.slug,
      title: row.title,
      subtitle: row.subtitle,
      heroImageUrls: row.heroImageUrls,
      filterConfig: parseCatalogCategoryFilterConfig(row.filterConfig, row.slug),
      productCategory: row.productCategory,
      seoTitle: row.seoTitle,
      seoDescription: row.seoDescription,
    };
  }
}
