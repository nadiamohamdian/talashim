import { Injectable, NotFoundException } from '@nestjs/common';
import { ProductCategory, type Product } from '@/generated/prisma';
import { CatalogRepository } from '../repositories/catalog.repository';
import type { CatalogQueryDto } from '../dto/catalog-query.dto';

@Injectable()
export class CatalogService {
  constructor(private readonly catalogRepository: CatalogRepository) {}

  async findFeatured() {
    const products = await this.catalogRepository.findFeatured();
    return products.map((product) => this.toProductSummary(product));
  }

  async findAll(query: CatalogQueryDto) {
    const category = query.category?.toUpperCase() as
      | ProductCategory
      | undefined;
    const products = await this.catalogRepository.findAll(
      query.limit,
      category,
    );
    return products.map((product) => this.toProductSummary(product));
  }

  async findBySlug(slug: string) {
    const product = await this.catalogRepository.findBySlug(slug);

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    return {
      ...this.toProductSummary(product),
      description: product.description,
      seoDescription: product.seoDescription,
    };
  }

  private toProductSummary(
    product: Product & {
      inventoryItem: { quantity: number; reserved: number } | null;
    },
  ) {
    return {
      id: product.id,
      slug: product.slug,
      title: product.title,
      category: product.category.toLowerCase(),
      karat: product.karat,
      weightGram: Number(product.weightGram),
      makingFeePercent: product.makingFeePercent,
      priceToman: product.priceToman,
      imageUrl: product.imageUrl,
      inventory:
        (product.inventoryItem?.quantity ?? 0) -
        (product.inventoryItem?.reserved ?? 0),
      featured: product.featured,
    };
  }
}
