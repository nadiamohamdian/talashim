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

  findAll(limit = 12, category?: ProductCategory) {
    return this.prisma.product.findMany({
      where: {
        category,
      },
      include: { inventoryItem: true },
      orderBy: { createdAt: 'desc' },
      take: limit,
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
}
