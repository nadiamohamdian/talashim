import { Injectable } from '@nestjs/common';
import {
  InventoryMovementType,
  Prisma,
  ProductCategory,
} from '@/generated/prisma';
import { PrismaService } from '@/infrastructure/database/prisma.service';

@Injectable()
export class AdminInventoryRepository {
  constructor(private readonly prisma: PrismaService) {}

  listStock(
    skip: number,
    take: number,
    filters: {
      search?: string;
      category?: ProductCategory;
      lowStockOnly?: boolean;
    },
  ) {
    const where: Prisma.ProductWhereInput = {
      inventoryItem: { isNot: null },
    };

    if (filters.category) {
      where.category = filters.category;
    }
    if (filters.search?.trim()) {
      where.OR = [
        { title: { contains: filters.search.trim(), mode: 'insensitive' } },
        { sku: { contains: filters.search.trim(), mode: 'insensitive' } },
      ];
    }
    if (filters.lowStockOnly) {
      where.inventoryItem = {
        is: {
          quantity: { lte: 5 },
        },
      };
    }

    return this.prisma.$transaction([
      this.prisma.product.findMany({
        where,
        skip,
        take,
        orderBy: { title: 'asc' },
        include: { inventoryItem: true },
      }),
      this.prisma.product.count({ where }),
    ]);
  }

  listMovements(
    skip: number,
    take: number,
    filters: { productId?: string; type?: InventoryMovementType },
  ) {
    const where: Prisma.InventoryMovementWhereInput = {};
    if (filters.productId) {
      where.productId = filters.productId;
    }
    if (filters.type) {
      where.type = filters.type;
    }

    return this.prisma.$transaction([
      this.prisma.inventoryMovement.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: 'desc' },
        include: {
          product: { select: { id: true, title: true, sku: true } },
          actor: { select: { id: true, fullName: true } },
        },
      }),
      this.prisma.inventoryMovement.count({ where }),
    ]);
  }

  adjustStock(
    productId: string,
    quantityDelta: number,
    actorId: string,
    note: string | undefined,
  ) {
    return this.prisma.$transaction(async (tx) => {
      const item = await tx.inventoryItem.findUnique({ where: { productId } });
      if (!item) {
        return null;
      }

      const quantityBefore = item.quantity;
      const quantityAfter = quantityBefore + quantityDelta;
      if (quantityAfter < 0) {
        throw new Error('INSUFFICIENT_STOCK');
      }
      if (quantityAfter < item.reserved) {
        throw new Error('BELOW_RESERVED');
      }

      const updated = await tx.inventoryItem.update({
        where: { productId },
        data: { quantity: quantityAfter },
      });

      await tx.inventoryMovement.create({
        data: {
          productId,
          actorId,
          type: InventoryMovementType.ADJUSTMENT,
          quantityDelta,
          quantityBefore,
          quantityAfter,
          reservedBefore: item.reserved,
          reservedAfter: item.reserved,
          note,
        },
      });

      return updated;
    });
  }
}
