import { Injectable, NotFoundException } from '@nestjs/common';
import {
  applyDiscountToPrice,
  calculateJewelryPricing,
  isProductDiscountActive,
} from '@sadafgold/shared';
import type { ProductPricing } from '@sadafgold/types';
import { ProductCategory, type Product } from '@/generated/prisma';
import { CacheService } from '@/infrastructure/cache/cache.service';
import { PricingEngineService } from '@/modules/pricing/services/pricing-engine.service';
import { CatalogRepository } from '../repositories/catalog.repository';
import type { CatalogQueryDto } from '../dto/catalog-query.dto';

type ProductWithInventory = Product & {
  inventoryItem: { quantity: number; reserved: number } | null;
  variants?: Array<{
    id: string;
    sku: string;
    color: string | null;
    size: string | null;
    priceToman: bigint;
    weightGram: { toString(): string } | null;
    makingFeePercent: number | null;
    imageUrl: string | null;
    quantity: number;
    isDefault: boolean;
  }>;
};

@Injectable()
export class CatalogService {
  constructor(
    private readonly catalogRepository: CatalogRepository,
    private readonly cacheService: CacheService,
    private readonly pricingEngine: PricingEngineService,
  ) {}

  async findFeatured() {
    const products = await this.catalogRepository.findFeatured();
    return Promise.all(products.map((product) => this.toProductSummary(product)));
  }

  async findBestsellers(limit = 6) {
    const products = await this.catalogRepository.findBestsellers(limit);
    return Promise.all(products.map((product) => this.toProductSummary(product)));
  }

  async findCategories() {
    const rows = await this.catalogRepository.countByCategory();
    const labels: Record<string, string> = {
      RING: 'انگشتر',
      NECKLACE: 'گردنبند',
      BRACELET: 'دستبند',
      COIN: 'سکه',
    };
    return rows.map((row) => ({
      slug: row.category.toLowerCase(),
      label: labels[row.category] ?? row.category,
      productCount: row._count.id,
    }));
  }

  async findAll(query: CatalogQueryDto) {
    const category = query.category?.toUpperCase() as ProductCategory | undefined;
    const limit = query.limit ?? 12;
    const page = query.page ?? 1;
    const skip = (page - 1) * limit;
    const search = query.search?.trim() || undefined;
    const onSale = query.sale === true;

    if (onSale) {
      const products = await this.catalogRepository.findAll(200, category, search, 0, true);
      const summaries = await Promise.all(
        products.map((product) => this.toProductSummary(product)),
      );
      const activeSaleItems = summaries.filter((item) => isProductDiscountActive(item));

      if (query.page !== undefined || search) {
        return {
          page,
          limit,
          total: activeSaleItems.length,
          items: activeSaleItems.slice(skip, skip + limit),
        };
      }

      return activeSaleItems.slice(0, limit);
    }

    if (query.page !== undefined || search) {
      const [products, total] = await Promise.all([
        this.catalogRepository.findAll(limit, category, search, skip, false),
        this.catalogRepository.countAll(category, search, false),
      ]);
      const items = await Promise.all(
        products.map((product) => this.toProductSummary(product)),
      );
      return { page, limit, total, items };
    }

    const products = await this.catalogRepository.findAll(limit, category, search, 0, false);
    return Promise.all(products.map((product) => this.toProductSummary(product)));
  }

  async findByIds(ids: string[]) {
    const uniqueIds = [...new Set(ids.filter(Boolean))];
    if (uniqueIds.length === 0) {
      return [];
    }

    const products = await this.catalogRepository.findByIds(uniqueIds);
    const byId = new Map(products.map((product) => [product.id, product]));
    const summaries = [];

    for (const id of uniqueIds) {
      const product = byId.get(id);
      if (!product) {
        continue;
      }
      summaries.push(await this.toProductSummary(product as ProductWithInventory));
    }

    return summaries;
  }

  async findBySlug(slug: string) {
    const product = await this.catalogRepository.findBySlug(slug);

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    const summary = await this.toProductSummary(product);

    return {
      ...summary,
      description: product.description,
      seoDescription: product.seoDescription,
      seoTitle: product.seoTitle ?? undefined,
      seoKeywords: product.seoKeywords ?? undefined,
      ogImageUrl: product.ogImageUrl ?? undefined,
      seoCanonicalPath: product.seoCanonicalPath ?? undefined,
      seoNoIndex: product.seoNoIndex,
      color: 'طلایی',
      specifications: this.buildSpecifications(product, summary.pricing),
      variants: (product.variants ?? []).map((variant) => ({
        id: variant.id,
        sku: variant.sku,
        color: variant.color,
        size: variant.size,
        priceToman: Number(variant.priceToman),
        weightGram: variant.weightGram != null ? Number(variant.weightGram) : null,
        makingFeePercent: variant.makingFeePercent,
        imageUrl: variant.imageUrl,
        quantity: variant.quantity,
        isDefault: variant.isDefault,
      })),
    };
  }

  private buildSpecifications(
    product: Product,
    pricing?: ProductPricing,
  ): Record<string, string> {
    return {
      وزن: `${Number(product.weightGram)} گرم`,
      اجرت: `${product.makingFeePercent} درصد`,
      رنگ: 'طلایی',
      عیار: `${product.karat} عیار`,
      'قیمت هر گرم (لحظه‌ای)': pricing
        ? `${pricing.livePriceToman.toLocaleString('fa-IR')} تومان`
        : '—',
      'ارزش خام طلا': pricing
        ? `${Math.round(Number(product.weightGram) * pricing.livePriceToman).toLocaleString('fa-IR')} تومان`
        : '—',
      'مبلغ اجرت': pricing?.wageFixedToman
        ? `${pricing.wageFixedToman.toLocaleString('fa-IR')} تومان`
        : '—',
    };
  }

  private async resolvePricing(product: ProductWithInventory): Promise<ProductPricing> {
    const live = await this.pricingEngine.getLivePrice('XAU-IRR', product.karat);
    return calculateJewelryPricing({
      weightGram: Number(product.weightGram),
      livePricePerGramToman: Number(live.pricePerGram),
      karat: product.karat,
      makingFeePercent: product.makingFeePercent,
    });
  }

  private async toProductSummary(product: ProductWithInventory) {
    const pricing = await this.resolvePricing(product);
    const discountMeta = {
      discountPercent: product.discountPercent,
      discountStartsAt: product.discountStartsAt?.toISOString() ?? null,
      discountEndsAt: product.discountEndsAt?.toISOString() ?? null,
    };

    let priceToman = pricing.finalPriceToman;
    let compareAtPriceToman: number | null = null;

    if (isProductDiscountActive(discountMeta) && product.discountPercent != null) {
      compareAtPriceToman = priceToman;
      priceToman = applyDiscountToPrice(priceToman, product.discountPercent);
    }

    return {
      id: product.id,
      sku: product.sku,
      slug: product.slug,
      title: product.title,
      category: product.category.toLowerCase(),
      karat: product.karat,
      weightGram: Number(product.weightGram),
      makingFeePercent: product.makingFeePercent,
      priceToman,
      compareAtPriceToman,
      discountPercent: product.discountPercent,
      discountStartsAt: discountMeta.discountStartsAt,
      discountEndsAt: discountMeta.discountEndsAt,
      imageUrl: product.imageUrl,
      inventory:
        (product.inventoryItem?.quantity ?? 0) -
        (product.inventoryItem?.reserved ?? 0),
      featured: product.featured,
      pricing,
    };
  }
}
