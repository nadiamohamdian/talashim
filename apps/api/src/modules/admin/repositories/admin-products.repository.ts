import { Injectable } from '@nestjs/common';
import { DEMO_PRODUCT_SKU_PREFIX, DEMO_PRODUCT_SLUG_PREFIX } from '@talashim/shared';
import { InventoryMovementType, Prisma, ProductCategory } from '@/generated/prisma';
import { PrismaService } from '@/infrastructure/database/prisma.service';

const productRelationsInclude = {
  inventoryItem: true,
  images: { orderBy: { sortOrder: 'asc' as const } },
  variants: { orderBy: { sortOrder: 'asc' as const } },
  videos: { orderBy: { sortOrder: 'asc' as const } },
};

export type ProductGalleryInput = { url: string; alt?: string; sortOrder?: number };
export type ProductVariantInput = {
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
};
export type ProductVideoInput = {
  title: string;
  videoUrl: string;
  thumbnailUrl?: string;
  sortOrder?: number;
};

@Injectable()
export class AdminProductsRepository {
  constructor(private readonly prisma: PrismaService) {}

  listProducts(
    skip: number,
    take: number,
    filters: {
      search?: string;
      category?: ProductCategory;
      featured?: boolean;
      lowStock?: boolean;
      demoOnly?: boolean;
    },
  ) {
    const where: Prisma.ProductWhereInput = {};

    if (filters.category) {
      where.category = filters.category;
    }
    if (filters.featured !== undefined) {
      where.featured = filters.featured;
    }

    const andClauses: Prisma.ProductWhereInput[] = [];

    if (filters.demoOnly) {
      andClauses.push({
        OR: [
          { sku: { startsWith: DEMO_PRODUCT_SKU_PREFIX, mode: 'insensitive' } },
          { slug: { startsWith: DEMO_PRODUCT_SLUG_PREFIX, mode: 'insensitive' } },
        ],
      });
    }

    if (filters.search?.trim()) {
      andClauses.push({
        OR: [
          { title: { contains: filters.search.trim(), mode: 'insensitive' } },
          { sku: { contains: filters.search.trim(), mode: 'insensitive' } },
          { slug: { contains: filters.search.trim(), mode: 'insensitive' } },
        ],
      });
    }

    if (andClauses.length > 0) {
      where.AND = andClauses;
    }

    if (filters.lowStock) {
      where.inventoryItem = {
        is: { quantity: { lte: 5 } },
      };
    }

    return this.prisma.$transaction([
      this.prisma.product.findMany({
        where,
        skip,
        take,
        orderBy: { updatedAt: 'desc' },
        include: { inventoryItem: true },
      }),
      this.prisma.product.count({ where }),
    ]);
  }

  findProductById(id: string) {
    return this.prisma.product.findUnique({
      where: { id },
      include: productRelationsInclude,
    });
  }

  findProductBySku(sku: string) {
    return this.prisma.product.findUnique({ where: { sku } });
  }

  findVariantBySku(sku: string) {
    return this.prisma.productVariant.findUnique({ where: { sku } });
  }

  findProductBySlug(slug: string) {
    return this.prisma.product.findUnique({
      where: { slug },
      include: productRelationsInclude,
    });
  }

  createProduct(
    data: Prisma.ProductCreateInput,
    initialQuantity: number,
    actorId: string | null,
    relations?: {
      galleryImages?: ProductGalleryInput[];
      variants?: ProductVariantInput[];
      videos?: ProductVideoInput[];
    },
  ) {
    return this.prisma.$transaction(async (tx) => {
      const product = await tx.product.create({ data });

      const inventory = await tx.inventoryItem.create({
        data: {
          productId: product.id,
          quantity: initialQuantity,
          reserved: 0,
        },
      });

      if (initialQuantity > 0) {
        await tx.inventoryMovement.create({
          data: {
            productId: product.id,
            actorId,
            type: InventoryMovementType.INITIAL,
            quantityDelta: initialQuantity,
            quantityBefore: 0,
            quantityAfter: initialQuantity,
            note: 'Initial stock on product create',
          },
        });
      }

      await this.syncProductRelations(tx, product.id, relations);

      const full = await tx.product.findUnique({
        where: { id: product.id },
        include: productRelationsInclude,
      });

      return { ...full!, inventoryItem: inventory };
    });
  }

  updateProduct(
    id: string,
    data: Prisma.ProductUpdateInput,
    relations?: {
      galleryImages?: ProductGalleryInput[];
      variants?: ProductVariantInput[];
      videos?: ProductVideoInput[];
    },
  ) {
    return this.prisma.$transaction(async (tx) => {
      await tx.product.update({ where: { id }, data });
      if (relations) {
        await this.syncProductRelations(tx, id, relations);
      }
      return tx.product.findUnique({
        where: { id },
        include: productRelationsInclude,
      });
    });
  }

  private async syncProductRelations(
    tx: Prisma.TransactionClient,
    productId: string,
    relations?: {
      galleryImages?: ProductGalleryInput[];
      variants?: ProductVariantInput[];
      videos?: ProductVideoInput[];
    },
  ) {
    if (!relations) {
      return;
    }

    if (relations.galleryImages !== undefined) {
      await tx.productImage.deleteMany({ where: { productId } });
      if (relations.galleryImages.length > 0) {
        await tx.productImage.createMany({
          data: relations.galleryImages.map((image, index) => ({
            productId,
            url: image.url,
            alt: image.alt ?? '',
            sortOrder: image.sortOrder ?? index,
          })),
        });
      }
    }

    if (relations.variants !== undefined) {
      await tx.productVariant.deleteMany({ where: { productId } });
      for (const [index, variant] of relations.variants.entries()) {
        await tx.productVariant.create({
          data: {
            productId,
            sku: variant.sku,
            color: variant.color ?? null,
            size: variant.size ?? null,
            priceToman: variant.priceToman,
            weightGram: variant.weightGram ?? null,
            makingFeePercent: variant.makingFeePercent ?? null,
            imageUrl: variant.imageUrl ?? null,
            quantity: variant.quantity ?? 0,
            sortOrder: variant.sortOrder ?? index,
            isDefault: variant.isDefault ?? false,
          },
        });
      }
    }

    if (relations.videos !== undefined) {
      await tx.productVideo.deleteMany({ where: { productId } });
      if (relations.videos.length > 0) {
        for (const [index, video] of relations.videos.entries()) {
          await tx.productVideo.create({
            data: {
              productId,
              title: video.title,
              videoUrl: video.videoUrl,
              thumbnailUrl: video.thumbnailUrl ?? null,
              sortOrder: video.sortOrder ?? index,
            },
          });
        }
      }
    }
  }

  deleteProduct(id: string) {
    return this.prisma.product.delete({ where: { id } });
  }

  listVideos(skip: number, take: number, filters: { search?: string; productId?: string }) {
    const where: Prisma.ProductVideoWhereInput = {};
    if (filters.productId) {
      where.productId = filters.productId;
    }
    if (filters.search?.trim()) {
      where.OR = [
        { title: { contains: filters.search.trim(), mode: 'insensitive' } },
        { product: { title: { contains: filters.search.trim(), mode: 'insensitive' } } },
      ];
    }

    return this.prisma.$transaction([
      this.prisma.productVideo.findMany({
        where,
        skip,
        take,
        orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }],
        include: { product: { select: { id: true, title: true } } },
      }),
      this.prisma.productVideo.count({ where }),
    ]);
  }

  createVideo(data: Prisma.ProductVideoCreateInput) {
    return this.prisma.productVideo.create({
      data,
      include: { product: { select: { id: true, title: true } } },
    });
  }

  findVideoById(id: string) {
    return this.prisma.productVideo.findUnique({
      where: { id },
      include: { product: { select: { id: true, title: true } } },
    });
  }

  updateVideo(id: string, data: Prisma.ProductVideoUpdateInput) {
    return this.prisma.productVideo.update({
      where: { id },
      data,
      include: { product: { select: { id: true, title: true } } },
    });
  }

  deleteVideo(id: string) {
    return this.prisma.productVideo.delete({ where: { id } });
  }
}
