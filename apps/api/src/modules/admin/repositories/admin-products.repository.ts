import { Injectable } from '@nestjs/common';
import {
  InventoryMovementType,
  Prisma,
  ProductCategory,
} from '@/generated/prisma';
import { PrismaService } from '@/infrastructure/database/prisma.service';

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
    },
  ) {
    const where: Prisma.ProductWhereInput = {};

    if (filters.category) {
      where.category = filters.category;
    }
    if (filters.featured !== undefined) {
      where.featured = filters.featured;
    }
    if (filters.search?.trim()) {
      where.OR = [
        { title: { contains: filters.search.trim(), mode: 'insensitive' } },
        { sku: { contains: filters.search.trim(), mode: 'insensitive' } },
        { slug: { contains: filters.search.trim(), mode: 'insensitive' } },
      ];
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
      include: { inventoryItem: true },
    });
  }

  findProductBySku(sku: string) {
    return this.prisma.product.findUnique({ where: { sku } });
  }

  findProductBySlug(slug: string) {
    return this.prisma.product.findUnique({
      where: { slug },
      include: { inventoryItem: true },
    });
  }

  createProduct(
    data: Prisma.ProductCreateInput,
    initialQuantity: number,
    actorId: string | null,
  ) {
    return this.prisma.$transaction(async (tx) => {
      const product = await tx.product.create({
        data,
        include: { inventoryItem: true },
      });

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

      return { ...product, inventoryItem: inventory };
    });
  }

  updateProduct(id: string, data: Prisma.ProductUpdateInput) {
    return this.prisma.product.update({
      where: { id },
      data,
      include: { inventoryItem: true },
    });
  }

  deleteProduct(id: string) {
    return this.prisma.product.delete({ where: { id } });
  }

  listVideos(
    skip: number,
    take: number,
    filters: { search?: string; productId?: string },
  ) {
    const where: Prisma.ProductVideoWhereInput = {};
    if (filters.productId) {
      where.productId = filters.productId;
    }
    if (filters.search?.trim()) {
      where.OR = [
        { title: { contains: filters.search.trim(), mode: 'insensitive' } },
        {
          product: {
            title: { contains: filters.search.trim(), mode: 'insensitive' },
          },
        },
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
