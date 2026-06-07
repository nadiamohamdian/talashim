import { Injectable } from '@nestjs/common';
import { ProductCategory, Prisma, type Product } from '@/generated/prisma';
import { PrismaService } from '@/infrastructure/database/prisma.service';

type CatalogListFilters = {
  category?: ProductCategory;
  search?: string;
  sale?: boolean;
};

@Injectable()
export class CatalogRepository {
  constructor(private readonly prisma: PrismaService) {}

  private buildWhere(filters: CatalogListFilters): Prisma.ProductWhereInput {
    const conditions: Prisma.ProductWhereInput[] = [];
    const search = filters.search?.trim();

    if (filters.category) {
      conditions.push({ category: filters.category });
    }

    if (search) {
      conditions.push({
        OR: [
          { title: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } },
          { sku: { contains: search, mode: 'insensitive' } },
        ],
      });
    }

    if (filters.sale) {
      const now = new Date();
      conditions.push({
        discountPercent: { gt: 0 },
        discountEndsAt: { gt: now },
        OR: [{ discountStartsAt: null }, { discountStartsAt: { lte: now } }],
      });
    }

    return conditions.length > 0 ? { AND: conditions } : {};
  }

  findFeatured() {
    return this.prisma.product.findMany({
      where: { featured: true },
      include: { inventoryItem: true },
      orderBy: { createdAt: 'desc' },
      take: 6,
    });
  }

  findAll(limit = 12, category?: ProductCategory, search?: string, skip = 0, sale = false) {
    const where = this.buildWhere({ category, search, sale });
    return this.prisma.product.findMany({
      where,
      include: { inventoryItem: true },
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip,
    });
  }

  countAll(category?: ProductCategory, search?: string, sale = false) {
    const where = this.buildWhere({ category, search, sale });
    return this.prisma.product.count({ where });
  }

  findById(id: string) {
    return this.prisma.product.findUnique({
      where: { id },
      include: { inventoryItem: true },
    });
  }

  findByIds(ids: string[]) {
    if (ids.length === 0) {
      return Promise.resolve([]);
    }

    return this.prisma.product.findMany({
      where: { id: { in: ids } },
      include: { inventoryItem: true },
    });
  }

  findBySlug(slug: string) {
    return this.prisma.product.findUnique({
      where: { slug },
      include: {
        inventoryItem: true,
        variants: { orderBy: { sortOrder: 'asc' } },
        images: { orderBy: { sortOrder: 'asc' } },
      },
    });
  }

  findBestsellers(limit = 6) {
    return this.prisma.product.findMany({
      include: {
        inventoryItem: true,
        orderItems: { select: { quantity: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
    }).then((products) =>
      [...products]
        .sort((a, b) => {
          const soldA = a.orderItems.reduce((sum, item) => sum + item.quantity, 0);
          const soldB = b.orderItems.reduce((sum, item) => sum + item.quantity, 0);
          return soldB - soldA || b.createdAt.getTime() - a.createdAt.getTime();
        })
        .slice(0, limit)
        .map(({ orderItems: _orderItems, ...product }) => product),
    );
  }

  countByCategory() {
    return this.prisma.product.groupBy({
      by: ['category'],
      _count: { id: true },
      orderBy: { category: 'asc' },
    });
  }
}
