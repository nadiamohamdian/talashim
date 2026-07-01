import { Injectable, NotFoundException } from '@nestjs/common';
import {
  applyDiscountToPrice,
  calculateJewelryPricing,
  formatTomanAmountWithUnit,
  isProductDiscountActive,
  CATALOG_CATEGORY_SLUG_MAP,
  normalizeStorefrontProductCategory,
} from '@sadafgold/shared';
import type { ProductPricing } from '@sadafgold/types';
import { ProductCategory, type Product } from '@/generated/prisma';
import { CacheService } from '@/infrastructure/cache/cache.service';
import { PricingEngineService } from '@/modules/pricing/services/pricing-engine.service';
import { CatalogRepository, type CatalogSort } from '../repositories/catalog.repository';
import type { CatalogQueryDto } from '../dto/catalog-query.dto';
import { parseProductPdpConfig } from '@/modules/admin/lib/product-pdp-config.util';

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

type ResolvedCatalogSort = {
  field: 'createdAt' | 'priceToman' | 'sales';
  direction: 'asc' | 'desc';
  discountOnly?: boolean;
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

  async findNewArrivals(limit = 12) {
    const products = await this.catalogRepository.findNewArrivals(limit);
    return Promise.all(products.map((product) => this.toProductSummary(product)));
  }

  async findCategories() {
    const rows = await this.catalogRepository.countByCategory();
    const labels: Record<string, string> = {
      RING: 'انگشتر',
      NECKLACE: 'گردنبند',
      BRACELET: 'دستبند',
      EARRING: 'گوشواره',
      COIN: 'سکه',
      WEDDING_RING: 'حلقه ازدواج',
      CHILDREN: 'کودکانه',
    };
    return rows.map((row) => ({
      slug: this.categoryToPublicSlug(row.category),
      label: labels[row.category] ?? row.category,
      productCount: row._count.id,
    }));
  }

  async findAll(query: CatalogQueryDto) {
    const category = this.resolveCategory(query.category);
    const limit = query.limit ?? 12;
    const page = query.page ?? 1;
    const skip = (page - 1) * limit;
    const search = query.search?.trim() || undefined;
    const onSale = query.sale === true || query.sort === 'discounts';
    const hasPriceFilter = query.minPrice != null || query.maxPrice != null;
    const hasWeightFilter = query.minWeight != null || query.maxWeight != null;
    const weight = { minWeight: query.minWeight, maxWeight: query.maxWeight };
    const sort = this.resolveSort(query.sort);
    const wantsPaginated =
      query.page !== undefined || Boolean(search) || hasPriceFilter || hasWeightFilter || Boolean(query.sort);

    const needsInMemoryProcessing =
      onSale || hasPriceFilter || sort?.field === 'sales' || sort?.discountOnly;

    if (needsInMemoryProcessing) {
      const products =
        sort?.field === 'sales'
          ? await this.catalogRepository.findAllForSalesSort(
              category,
              search,
              onSale,
              weight,
              300,
            )
          : await this.catalogRepository.findAll(
              300,
              category,
              search,
              0,
              onSale,
              weight,
              sort?.discountOnly ? { field: 'createdAt', direction: 'desc' } : this.toRepositorySort(sort),
            );

      let summaries = await Promise.all(
        products.map((product) => this.toProductSummary(product)),
      );

      if (onSale || sort?.discountOnly) {
        summaries = summaries.filter((item) => isProductDiscountActive(item));
        summaries.sort((a, b) => {
          const discountDelta = (b.discountPercent ?? 0) - (a.discountPercent ?? 0);
          if (discountDelta !== 0) {
            return discountDelta;
          }
          return a.title.localeCompare(b.title, 'fa');
        });
      }

      if (hasPriceFilter) {
        summaries = summaries.filter((item) =>
          this.matchesPriceFilter(item.priceToman, query.minPrice, query.maxPrice),
        );
      }

      if (sort && sort.field === 'priceToman') {
        summaries.sort((a, b) =>
          sort.direction === 'asc'
            ? a.priceToman - b.priceToman
            : b.priceToman - a.priceToman,
        );
      }

      if (wantsPaginated) {
        return {
          page,
          limit,
          total: summaries.length,
          items: summaries.slice(skip, skip + limit),
        };
      }

      return summaries.slice(0, limit);
    }

    if (wantsPaginated) {
      const [products, total] = await Promise.all([
        this.catalogRepository.findAll(limit, category, search, skip, false, weight, this.toRepositorySort(sort)),
        this.catalogRepository.countAll(category, search, false, weight),
      ]);
      const items = await Promise.all(
        products.map((product) => this.toProductSummary(product)),
      );
      return { page, limit, total, items };
    }

    const products = await this.catalogRepository.findAll(
      limit,
      category,
      search,
      0,
      false,
      weight,
      this.toRepositorySort(sort),
    );
    return Promise.all(products.map((product) => this.toProductSummary(product)));
  }

  private toRepositorySort(sort?: ResolvedCatalogSort): CatalogSort | undefined {
    if (!sort || sort.field === 'sales') {
      return undefined;
    }

    return { field: sort.field, direction: sort.direction };
  }

  private resolveSort(raw?: string): ResolvedCatalogSort | undefined {
    switch (raw) {
      case 'best-selling':
        return { field: 'sales', direction: 'desc' };
      case 'discounts':
        return { field: 'createdAt', direction: 'desc', discountOnly: true };
      case 'price-desc':
        return { field: 'priceToman', direction: 'desc' };
      case 'price-asc':
        return { field: 'priceToman', direction: 'asc' };
      case 'new-collection':
        return { field: 'createdAt', direction: 'desc' };
      default:
        return undefined;
    }
  }

  private categoryToPublicSlug(category: ProductCategory): string {
    switch (category) {
      case ProductCategory.WEDDING_RING:
        return 'wedding-rings';
      case ProductCategory.CHILDREN:
        return 'kids';
      default:
        return category.toLowerCase();
    }
  }

  private resolveCategory(raw?: string): ProductCategory | undefined {
    if (!raw?.trim()) {
      return undefined;
    }

    const slug = raw.trim().toLowerCase();
    const canonical = CATALOG_CATEGORY_SLUG_MAP[slug] ?? normalizeStorefrontProductCategory(slug);

    const map: Record<string, ProductCategory> = {
      ring: ProductCategory.RING,
      necklace: ProductCategory.NECKLACE,
      bracelet: ProductCategory.BRACELET,
      earring: ProductCategory.EARRING,
      coin: ProductCategory.COIN,
      wedding_ring: ProductCategory.WEDDING_RING,
      children: ProductCategory.CHILDREN,
      kids: ProductCategory.CHILDREN,
    };

    const fromSlug = map[canonical];
    if (fromSlug) {
      return fromSlug;
    }

    const upper = raw.trim().toUpperCase();
    if (upper in ProductCategory) {
      return ProductCategory[upper as keyof typeof ProductCategory];
    }

    return undefined;
  }

  private matchesPriceFilter(
    priceToman: number,
    minPrice?: number,
    maxPrice?: number,
  ): boolean {
    if (minPrice != null && priceToman < minPrice) {
      return false;
    }
    if (maxPrice != null && priceToman > maxPrice) {
      return false;
    }
    return true;
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

    const galleryUrls =
      product.images.length > 0
        ? product.images.map((image) => image.url)
        : [product.imageUrl];

    const pdpConfig = parseProductPdpConfig(product.pdpConfig);
    const computedSpecs = this.buildSpecifications(product, summary.pricing);

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
      specifications: this.mergeSpecifications(computedSpecs, pdpConfig),
      pdpConfig,
      galleryUrls,
      videos: (product.videos ?? []).map((video) => ({
        id: video.id,
        title: video.title,
        videoUrl: video.videoUrl,
        thumbnailUrl: video.thumbnailUrl,
        sortOrder: video.sortOrder,
      })),
      variants: (product.variants ?? []).map((variant) => ({
        id: variant.id,
        sku: variant.sku,
        color: variant.color,
        size: variant.size,
        stone: variant.stone,
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
        ? formatTomanAmountWithUnit(pricing.livePriceToman)
        : '—',
      'ارزش خام طلا': pricing
        ? formatTomanAmountWithUnit(
            Math.round(Number(product.weightGram) * pricing.livePriceToman),
          )
        : '—',
      'مبلغ اجرت': pricing?.wageFixedToman
        ? formatTomanAmountWithUnit(pricing.wageFixedToman)
        : '—',
    };
  }

  private mergeSpecifications(
    computed: Record<string, string>,
    pdpConfig: ReturnType<typeof parseProductPdpConfig>,
  ): Record<string, string> {
    const customSpecs = pdpConfig?.customSpecs ?? [];
    if (customSpecs.length === 0) {
      return computed;
    }

    const merged: Record<string, string> = {};
    for (const row of customSpecs) {
      merged[row.label] = row.value;
    }
    for (const [label, value] of Object.entries(computed)) {
      if (!(label in merged)) {
        merged[label] = value;
      }
    }
    return merged;
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
      hoverImageUrl: product.hoverImageUrl,
      inventory:
        (product.inventoryItem?.quantity ?? 0) -
        (product.inventoryItem?.reserved ?? 0),
      featured: product.featured,
      pricing,
    };
  }
}
