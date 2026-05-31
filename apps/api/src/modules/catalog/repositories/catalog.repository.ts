import { Injectable } from '@nestjs/common';
import { ProductCategory } from '@/generated/prisma';
import { PrismaService } from '@/infrastructure/database/prisma.service';

@Injectable()
export class CatalogRepository {
  constructor(private readonly prisma: PrismaService) {}

  findFeatured() {
    return this.prisma.product.findMany({
      where: { featured: true },
      include: { inventoryItem: true },
      orderBy: { createdAt: 'desc' },
      take: 6,
    });
  }

  findAll(limit = 12, category?: ProductCategory, search?: string, skip = 0) {
    return this.prisma.product.findMany({
      where: {
        category,
        OR: search
          ? [
              { title: { contains: search, mode: 'insensitive' } },
              { description: { contains: search, mode: 'insensitive' } },
              { sku: { contains: search, mode: 'insensitive' } },
            ]
          : undefined,
      },
      include: { inventoryItem: true },
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip,
    });
  }

  countAll(category?: ProductCategory, search?: string) {
    return this.prisma.product.count({
      where: {
        category,
        OR: search
          ? [
              { title: { contains: search, mode: 'insensitive' } },
              { description: { contains: search, mode: 'insensitive' } },
              { sku: { contains: search, mode: 'insensitive' } },
            ]
          : undefined,
      },
    });
  }

  findById(id: string) {
    return this.prisma.product.findUnique({
      where: { id },
      include: { inventoryItem: true },
    });
  }

  findBySlug(slug: string) {
    return this.prisma.product.findUnique({
      where: { slug },
      include: { inventoryItem: true },
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
