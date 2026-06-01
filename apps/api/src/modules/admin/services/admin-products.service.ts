import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ADMIN_PERMISSIONS } from '@sadafgold/shared/admin-rbac';
import { calculateJewelryPricing } from '@sadafgold/shared';
import type {
  AdminProductDetailDto,
  AdminProductDto,
  AdminProductVideoDto,
} from '@sadafgold/types';
import type { AuthenticatedUser } from '@/common/interfaces/auth-user.interface';
import { assertAdminPermission } from '@/common/rbac/assert-admin-permission';
import { PricingEngineService } from '@/modules/pricing/services/pricing-engine.service';
import type {
  AdminProductVideosQueryDto,
  AdminProductsQueryDto,
  CreateAdminProductDto,
  UpdateAdminProductDto,
  UpsertAdminProductVideoDto,
} from '../dto/admin-commerce.dto';
import { AdminProductsRepository } from '../repositories/admin-products.repository';

type ProductRow = NonNullable<
  Awaited<ReturnType<AdminProductsRepository['findProductById']>>
>;

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

    const [items, total] = await this.productsRepository.listProducts(
      skip,
      limit,
      {
        search: query.search,
        category: query.category,
        featured: query.featured,
        lowStock: query.lowStock,
      },
    );

    return {
      page,
      limit,
      total,
      items: items.map((p) => this.mapProduct(p)),
    };
  }

  async getProductBySlug(
    slug: string,
    actor: AuthenticatedUser,
  ): Promise<AdminProductDetailDto> {
    assertAdminPermission(actor.role, ADMIN_PERMISSIONS.products.read);

    const product = await this.productsRepository.findProductBySlug(slug);
    if (!product) {
      throw new NotFoundException('Product not found');
    }

    return this.getProduct(product.id, actor);
  }

  async getProduct(
    id: string,
    actor: AuthenticatedUser,
  ): Promise<AdminProductDetailDto> {
    assertAdminPermission(actor.role, ADMIN_PERMISSIONS.products.read);

    const product = await this.productsRepository.findProductById(id);
    if (!product) {
      throw new NotFoundException('Product not found');
    }

    const base = this.mapProduct(product);
    try {
      const live = await this.pricingEngine.getLivePrice(
        'XAU-IRR',
        product.karat,
      );
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
        category: dto.category,
        karat: dto.karat,
        weightGram: dto.weightGram,
        makingFeePercent: dto.makingFeePercent,
        priceToman: dto.priceToman,
        imageUrl: dto.imageUrl,
        featured: dto.featured ?? false,
      },
      dto.initialQuantity ?? 0,
      actor.id,
    );

    return this.mapProduct(product);
  }

  async updateProduct(
    id: string,
    dto: UpdateAdminProductDto,
    actor: AuthenticatedUser,
  ) {
    assertAdminPermission(actor.role, ADMIN_PERMISSIONS.products.write);

    const existing = await this.productsRepository.findProductById(id);
    if (!existing) {
      throw new NotFoundException('Product not found');
    }

    const product = await this.productsRepository.updateProduct(id, {
      title: dto.title,
      description: dto.description,
      seoDescription: dto.seoDescription,
      category: dto.category,
      karat: dto.karat,
      weightGram: dto.weightGram,
      makingFeePercent: dto.makingFeePercent,
      priceToman: dto.priceToman,
      imageUrl: dto.imageUrl,
      featured: dto.featured,
    });

    return this.mapProduct(product);
  }

  async deleteProduct(id: string, actor: AuthenticatedUser) {
    assertAdminPermission(actor.role, ADMIN_PERMISSIONS.products.delete);

    const existing = await this.productsRepository.findProductById(id);
    if (!existing) {
      throw new NotFoundException('Product not found');
    }

    await this.productsRepository.deleteProduct(id);
    return { ok: true };
  }

  async listVideos(
    query: AdminProductVideosQueryDto,
    actor: AuthenticatedUser,
  ) {
    assertAdminPermission(actor.role, ADMIN_PERMISSIONS.products.videos);

    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const skip = (page - 1) * limit;

    const [items, total] = await this.productsRepository.listVideos(
      skip,
      limit,
      {
        search: query.search,
        productId: query.productId,
      },
    );

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
      const product = await this.productsRepository.findProductById(
        dto.productId,
      );
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

  async updateVideo(
    id: string,
    dto: UpsertAdminProductVideoDto,
    actor: AuthenticatedUser,
  ) {
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

  private mapProduct(product: ProductRow): AdminProductDto {
    const inv = product.inventoryItem;
    return {
      id: product.id,
      sku: product.sku,
      slug: product.slug,
      title: product.title,
      description: product.description,
      seoDescription: product.seoDescription,
      category: product.category,
      karat: product.karat,
      weightGram: product.weightGram.toString(),
      makingFeePercent: product.makingFeePercent,
      priceToman: product.priceToman,
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
}
