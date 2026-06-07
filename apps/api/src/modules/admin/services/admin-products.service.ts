import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ADMIN_PERMISSIONS } from '@talashim/shared/admin-rbac';
import { calculateJewelryPricing } from '@talashim/shared';
import type {
  AdminProductDetailDto,
  AdminProductDto,
  AdminProductImageDto,
  AdminProductVariantDto,
  AdminProductVideoDto,
} from '@talashim/types';
import type { AuthenticatedUser } from '@/common/interfaces/auth-user.interface';
import { optionalLibraryImageUrl, requireLibraryImageUrl } from '@/common/media/require-library-image-url';
import { assertAdminPermission } from '@/common/rbac/assert-admin-permission';
import { tomanBigIntToNumber } from '@/common/finance/toman-amount';
import { PricingEngineService } from '@/modules/pricing/services/pricing-engine.service';
import type {
  AdminProductVideosQueryDto,
  AdminProductsQueryDto,
  CreateAdminProductDto,
  UpdateAdminProductDto,
  UpsertAdminProductVideoDto,
} from '../dto/admin-commerce.dto';
import { AdminProductsRepository } from '../repositories/admin-products.repository';
import { revalidateStorefrontProducts } from '../../../infrastructure/storefront/storefront-cache.util';

type ProductRow = NonNullable<
  Awaited<ReturnType<AdminProductsRepository['findProductById']>>
>;

type ProductListRow = Awaited<
  ReturnType<AdminProductsRepository['listProducts']>
>[0][number];

@Injectable()
export class AdminProductsService {
  constructor(
    private readonly productsRepository: AdminProductsRepository,
    private readonly pricingEngine: PricingEngineService,
  ) {}

  async listProducts(query: AdminProductsQueryDto, actor: AuthenticatedUser) {
    assertAdminPermission(actor.role, ADMIN_PERMISSIONS.products.read);

    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const skip = (page - 1) * limit;

    const [items, total] = await this.productsRepository.listProducts(skip, limit, {
      search: query.search,
      category: query.category,
      featured: query.featured,
      lowStock: query.lowStock,
    });

    return {
      page,
      limit,
      total,
      items: items.map((p) => this.mapProduct(p)),
    };
  }

  async getProductBySlug(slug: string, actor: AuthenticatedUser): Promise<AdminProductDetailDto> {
    assertAdminPermission(actor.role, ADMIN_PERMISSIONS.products.read);

    const product = await this.productsRepository.findProductBySlug(slug);
    if (!product) {
      throw new NotFoundException('Product not found');
    }

    return this.getProduct(product.id, actor);
  }

  async getProduct(id: string, actor: AuthenticatedUser): Promise<AdminProductDetailDto> {
    assertAdminPermission(actor.role, ADMIN_PERMISSIONS.products.read);

    const product = await this.productsRepository.findProductById(id);
    if (!product) {
      throw new NotFoundException('Product not found');
    }

    const base = this.mapProductDetail(product);
    try {
      const live = await this.pricingEngine.getLivePrice('XAU-IRR', product.karat);
      const pricing = calculateJewelryPricing({
        weightGram: Number(product.weightGram),
        livePricePerGramToman: Number(live.pricePerGram),
        karat: product.karat,
        makingFeePercent: product.makingFeePercent,
      });
      return {
        ...base,
        livePriceToman: pricing.livePriceToman,
        finalPriceToman: pricing.finalPriceToman,
      };
    } catch {
      return base;
    }
  }

  async createProduct(dto: CreateAdminProductDto, actor: AuthenticatedUser) {
    assertAdminPermission(actor.role, ADMIN_PERMISSIONS.products.write);

    const existingSku = await this.productsRepository.findProductBySku(dto.sku);
    if (existingSku) {
      throw new ConflictException('SKU already exists');
    }

    await this.assertVariantSkusAvailable(dto.variants ?? [], dto.sku);

    const slug = this.normalizeSlug(dto.slug ?? dto.title);
    const existingSlug = await this.productsRepository.findProductBySlug(slug);
    if (existingSlug) {
      throw new ConflictException('Slug already exists');
    }

    const product = await this.productsRepository.createProduct(
      {
        sku: dto.sku,
        slug,
        title: dto.title,
        description: dto.description,
        seoDescription: dto.seoDescription ?? dto.description.slice(0, 160),
        seoTitle: dto.seoTitle ?? null,
        seoKeywords: dto.seoKeywords ?? null,
        ogImageUrl: optionalLibraryImageUrl(dto.ogImageUrl, 'تصویر OG') ?? null,
        seoCanonicalPath: dto.seoCanonicalPath ?? null,
        seoNoIndex: dto.seoNoIndex ?? false,
        category: dto.category,
        karat: dto.karat,
        weightGram: dto.weightGram,
        makingFeePercent: dto.makingFeePercent,
        priceToman: dto.priceToman,
        imageUrl: requireLibraryImageUrl(dto.imageUrl, 'تصویر اصلی محصول'),
        featured: dto.featured ?? false,
        ...this.resolveDiscountFields(dto.discountPercent, dto.discountStartsAt, dto.discountEndsAt),
      },
      dto.initialQuantity ?? 0,
      actor.id,
      this.extractRelations({
        galleryImages: this.validateGalleryImages(dto.galleryImages ?? []),
        variants: this.validateVariants(dto.variants ?? []),
        videos: this.validateVideos(dto.videos ?? []),
      }),
    );

    await revalidateStorefrontProducts(slug);

    return this.mapProductDetail(product);
  }

  async updateProduct(id: string, dto: UpdateAdminProductDto, actor: AuthenticatedUser) {
    assertAdminPermission(actor.role, ADMIN_PERMISSIONS.products.write);

    const existing = await this.productsRepository.findProductById(id);
    if (!existing) {
      throw new NotFoundException('Product not found');
    }

    if (dto.variants !== undefined) {
      await this.assertVariantSkusAvailable(dto.variants, existing.sku, id);
    }

    const product = await this.productsRepository.updateProduct(
      id,
      {
        title: dto.title,
        description: dto.description,
        seoDescription: dto.seoDescription,
        seoTitle: dto.seoTitle,
        seoKeywords: dto.seoKeywords,
        ogImageUrl:
          dto.ogImageUrl !== undefined
            ? this.resolveOptionalLibraryImageUpdate(
                dto.ogImageUrl,
                existing.ogImageUrl,
                'تصویر OG',
              )
            : undefined,
        seoCanonicalPath: dto.seoCanonicalPath,
        seoNoIndex: dto.seoNoIndex,
        category: dto.category,
        karat: dto.karat,
        weightGram: dto.weightGram,
        makingFeePercent: dto.makingFeePercent,
        priceToman: dto.priceToman,
        imageUrl:
          dto.imageUrl !== undefined
            ? this.resolveProductImageUrl(
                dto.imageUrl,
                existing.imageUrl,
                'تصویر اصلی محصول',
              )
            : undefined,
        featured: dto.featured,
        ...(dto.discountPercent !== undefined ||
        dto.discountStartsAt !== undefined ||
        dto.discountEndsAt !== undefined
          ? this.resolveDiscountFields(
              dto.discountPercent,
              dto.discountStartsAt,
              dto.discountEndsAt,
            )
          : {}),
      },
      dto.galleryImages !== undefined ||
        dto.variants !== undefined ||
        dto.videos !== undefined
        ? this.extractRelations(dto, existing)
        : undefined,
    );

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    await revalidateStorefrontProducts(existing.slug, product.slug);

    return this.mapProductDetail(product);
  }

  async deleteProduct(id: string, actor: AuthenticatedUser) {
    assertAdminPermission(actor.role, ADMIN_PERMISSIONS.products.delete);

    const existing = await this.productsRepository.findProductById(id);
    if (!existing) {
      throw new NotFoundException('Product not found');
    }

    await this.productsRepository.deleteProduct(id);
    await revalidateStorefrontProducts(existing.slug);
    return { ok: true };
  }

  async listVideos(query: AdminProductVideosQueryDto, actor: AuthenticatedUser) {
    assertAdminPermission(actor.role, ADMIN_PERMISSIONS.products.videos);

    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const skip = (page - 1) * limit;

    const [items, total] = await this.productsRepository.listVideos(skip, limit, {
      search: query.search,
      productId: query.productId,
    });

    return {
      page,
      limit,
      total,
      items: items.map((v) => this.mapVideo(v)),
    };
  }

  async createVideo(dto: UpsertAdminProductVideoDto, actor: AuthenticatedUser) {
    assertAdminPermission(actor.role, ADMIN_PERMISSIONS.products.videos);

    if (dto.productId) {
      const product = await this.productsRepository.findProductById(dto.productId);
      if (!product) {
        throw new NotFoundException('Product not found');
      }
    }

    const video = await this.productsRepository.createVideo({
      title: dto.title,
      videoUrl: dto.videoUrl,
      thumbnailUrl: dto.thumbnailUrl,
      sortOrder: dto.sortOrder ?? 0,
      product: dto.productId ? { connect: { id: dto.productId } } : undefined,
    });

    return this.mapVideo(video);
  }

  async updateVideo(id: string, dto: UpsertAdminProductVideoDto, actor: AuthenticatedUser) {
    assertAdminPermission(actor.role, ADMIN_PERMISSIONS.products.videos);

    const existing = await this.productsRepository.findVideoById(id);
    if (!existing) {
      throw new NotFoundException('Video not found');
    }

    const video = await this.productsRepository.updateVideo(id, {
      title: dto.title,
      videoUrl: dto.videoUrl,
      thumbnailUrl: dto.thumbnailUrl,
      sortOrder: dto.sortOrder,
      product: dto.productId
        ? { connect: { id: dto.productId } }
        : dto.productId === ''
          ? { disconnect: true }
          : undefined,
    });

    return this.mapVideo(video);
  }

  async deleteVideo(id: string, actor: AuthenticatedUser) {
    assertAdminPermission(actor.role, ADMIN_PERMISSIONS.products.videos);

    const existing = await this.productsRepository.findVideoById(id);
    if (!existing) {
      throw new NotFoundException('Video not found');
    }

    await this.productsRepository.deleteVideo(id);
    return { ok: true };
  }

  private normalizeSlug(input: string) {
    return input
      .trim()
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9\u0600-\u06FF-]/g, '')
      .replace(/-+/g, '-')
      .slice(0, 120);
  }

  private extractRelations(
    dto: {
      galleryImages?: CreateAdminProductDto['galleryImages'];
      variants?: CreateAdminProductDto['variants'];
      videos?: CreateAdminProductDto['videos'];
    },
    existing?: ProductRow,
  ) {
    const relations: {
      galleryImages?: { url: string; alt?: string; sortOrder?: number }[];
      variants?: {
        sku: string;
        color?: string;
        size?: string;
        priceToman: number;
        weightGram?: number;
        makingFeePercent?: number;
        imageUrl?: string;
        quantity?: number;
        sortOrder?: number;
        isDefault?: boolean;
      }[];
      videos?: {
        title: string;
        videoUrl: string;
        thumbnailUrl?: string;
        sortOrder?: number;
      }[];
    } = {};

    if (dto.galleryImages !== undefined) {
      relations.galleryImages = this.validateGalleryImages(
        dto.galleryImages,
        new Set(existing?.images.map((image) => image.url.trim()) ?? []),
      );
    }
    if (dto.variants !== undefined) {
      relations.variants = this.validateVariants(
        dto.variants,
        new Map(
          existing?.variants.map((variant) => [
            variant.sku.trim().toLowerCase(),
            variant.imageUrl?.trim() ?? '',
          ]) ?? [],
        ),
      );
    }
    if (dto.videos !== undefined) {
      relations.videos = this.mapVideoInputs(dto.videos);
    }

    return relations;
  }

  private validateGalleryImages(
    images: NonNullable<CreateAdminProductDto['galleryImages']>,
    existingUrls: Set<string> = new Set(),
  ) {
    return images.map((image, index) => {
      const trimmed = image.url.trim();
      return {
        url: existingUrls.has(trimmed)
          ? trimmed
          : requireLibraryImageUrl(trimmed, `تصویر گالری ${index + 1}`),
        alt: image.alt,
        sortOrder: image.sortOrder ?? index,
      };
    });
  }

  private validateVariants(
    variants: NonNullable<CreateAdminProductDto['variants']>,
    existingVariantImages: Map<string, string> = new Map(),
  ) {
    return variants.map((variant, index) => {
      const existingImageUrl = existingVariantImages.get(variant.sku.trim().toLowerCase()) ?? '';
      const nextImageUrl = variant.imageUrl?.trim() ?? '';

      return {
        sku: variant.sku,
        color: variant.color,
        size: variant.size,
        priceToman: variant.priceToman,
        weightGram: variant.weightGram,
        makingFeePercent: variant.makingFeePercent,
        imageUrl: nextImageUrl
          ? nextImageUrl === existingImageUrl
            ? existingImageUrl
            : requireLibraryImageUrl(nextImageUrl, `تصویر variant ${index + 1}`)
          : undefined,
        quantity: variant.quantity ?? 0,
        sortOrder: variant.sortOrder ?? index,
        isDefault: variant.isDefault ?? false,
      };
    });
  }

  private validateVideos(videos: NonNullable<CreateAdminProductDto['videos']>) {
    return videos.map((video, index) => ({
      title: video.title,
      videoUrl: video.videoUrl,
      thumbnailUrl: video.thumbnailUrl
        ? requireLibraryImageUrl(video.thumbnailUrl, `تصویر بندانگشتی ویدیو ${index + 1}`)
        : undefined,
      sortOrder: video.sortOrder ?? index,
    }));
  }

  private mapVideoInputs(videos: NonNullable<CreateAdminProductDto['videos']>) {
    return this.validateVideos(videos);
  }

  private resolveProductImageUrl(
    nextUrl: string,
    existingUrl: string | null | undefined,
    fieldLabel: string,
  ): string {
    const trimmed = nextUrl.trim();
    if (existingUrl && trimmed === existingUrl.trim()) {
      return existingUrl;
    }
    return requireLibraryImageUrl(trimmed, fieldLabel);
  }

  private resolveOptionalLibraryImageUpdate(
    nextUrl: string | null | undefined,
    existingUrl: string | null | undefined,
    fieldLabel: string,
  ): string | null | undefined {
    if (nextUrl === undefined) {
      return undefined;
    }
    if (nextUrl === null || !nextUrl.trim()) {
      return null;
    }
    const trimmed = nextUrl.trim();
    if (existingUrl && trimmed === existingUrl.trim()) {
      return existingUrl;
    }
    return optionalLibraryImageUrl(trimmed, fieldLabel) ?? null;
  }

  private async assertVariantSkusAvailable(
    variants: NonNullable<CreateAdminProductDto['variants']>,
    parentSku: string,
    productId?: string,
  ) {
    const seen = new Set<string>();
    for (const variant of variants) {
      const sku = variant.sku.trim();
      if (seen.has(sku)) {
        throw new BadRequestException(`Duplicate variant SKU: ${sku}`);
      }
      seen.add(sku);
      if (sku.toLowerCase() === parentSku.trim().toLowerCase()) {
        throw new BadRequestException('Variant SKU must differ from product SKU');
      }
      const existing = await this.productsRepository.findVariantBySku(sku);
      if (existing && existing.productId !== productId) {
        throw new ConflictException(`Variant SKU already exists: ${sku}`);
      }
    }
  }

  private mapProductDetail(product: ProductRow): AdminProductDetailDto {
    const base = this.mapProduct(product);
    return {
      ...base,
      discountPercent: product.discountPercent,
      discountStartsAt: product.discountStartsAt?.toISOString() ?? null,
      discountEndsAt: product.discountEndsAt?.toISOString() ?? null,
      galleryImages: product.images.map((image) => this.mapImage(image)),
      variants: product.variants.map((variant) => this.mapVariant(variant)),
      videos: product.videos.map((video) => this.mapEmbeddedVideo(video)),
    };
  }

  private mapImage(image: ProductRow['images'][number]): AdminProductImageDto {
    return {
      id: image.id,
      url: image.url,
      alt: image.alt,
      sortOrder: image.sortOrder,
    };
  }

  private mapVariant(variant: ProductRow['variants'][number]): AdminProductVariantDto {
    return {
      id: variant.id,
      sku: variant.sku,
      color: variant.color,
      size: variant.size,
      priceToman: tomanBigIntToNumber(variant.priceToman),
      weightGram: variant.weightGram?.toString() ?? null,
      makingFeePercent: variant.makingFeePercent,
      imageUrl: variant.imageUrl,
      quantity: variant.quantity,
      sortOrder: variant.sortOrder,
      isDefault: variant.isDefault,
    };
  }

  private mapEmbeddedVideo(video: ProductRow['videos'][number]): AdminProductVideoDto {
    return {
      id: video.id,
      productId: video.productId,
      productTitle: null,
      title: video.title,
      videoUrl: video.videoUrl,
      thumbnailUrl: video.thumbnailUrl,
      sortOrder: video.sortOrder,
      createdAt: video.createdAt.toISOString(),
      updatedAt: video.updatedAt.toISOString(),
    };
  }

  private mapProduct(product: ProductRow | ProductListRow): AdminProductDto {
    const inv = product.inventoryItem;
    return {
      id: product.id,
      sku: product.sku,
      slug: product.slug,
      title: product.title,
      description: product.description,
      seoDescription: product.seoDescription,
      seoTitle: product.seoTitle,
      seoKeywords: product.seoKeywords,
      ogImageUrl: product.ogImageUrl,
      seoCanonicalPath: product.seoCanonicalPath,
      seoNoIndex: product.seoNoIndex,
      category: product.category,
      karat: product.karat,
      weightGram: product.weightGram.toString(),
      makingFeePercent: product.makingFeePercent,
      priceToman: tomanBigIntToNumber(product.priceToman),
      imageUrl: product.imageUrl,
      featured: product.featured,
      inventory: inv
        ? {
            quantity: inv.quantity,
            reserved: inv.reserved,
            available: inv.quantity - inv.reserved,
          }
        : null,
      createdAt: product.createdAt.toISOString(),
      updatedAt: product.updatedAt.toISOString(),
    };
  }

  private mapVideo(
    video: Awaited<ReturnType<AdminProductsRepository['createVideo']>>,
  ): AdminProductVideoDto {
    return {
      id: video.id,
      productId: video.productId,
      productTitle: video.product?.title ?? null,
      title: video.title,
      videoUrl: video.videoUrl,
      thumbnailUrl: video.thumbnailUrl,
      sortOrder: video.sortOrder,
      createdAt: video.createdAt.toISOString(),
      updatedAt: video.updatedAt.toISOString(),
    };
  }

  private resolveDiscountFields(
    discountPercent?: number,
    discountStartsAt?: string,
    discountEndsAt?: string,
  ): {
    discountPercent: number | null;
    discountStartsAt: Date | null;
    discountEndsAt: Date | null;
  } {
    const percent = discountPercent ?? 0;
    if (percent <= 0) {
      return {
        discountPercent: null,
        discountStartsAt: null,
        discountEndsAt: null,
      };
    }

    const now = new Date();
    let startsAt = discountStartsAt ? new Date(discountStartsAt) : now;
    if (Number.isNaN(startsAt.getTime())) {
      startsAt = now;
    }

    let endsAt = discountEndsAt ? new Date(discountEndsAt) : new Date(now);
    if (!discountEndsAt || Number.isNaN(endsAt.getTime())) {
      endsAt = new Date(now);
      endsAt.setDate(endsAt.getDate() + 30);
    }

    if (endsAt <= startsAt) {
      endsAt = new Date(startsAt);
      endsAt.setDate(endsAt.getDate() + 30);
    }

    return {
      discountPercent: percent,
      discountStartsAt: startsAt,
      discountEndsAt: endsAt,
    };
  }
}
