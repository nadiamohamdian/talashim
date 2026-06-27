import { Injectable } from '@nestjs/common';
import { ProductCategory, type Prisma } from '@/generated/prisma';
import { PrismaService } from '@/infrastructure/database/prisma.service';

@Injectable()
export class CatalogCategoryPageRepository {
  constructor(private readonly prisma: PrismaService) {}

  findAllActive() {
    return this.prisma.catalogCategoryPage.findMany({
      where: { isActive: true },
      orderBy: [{ sortOrder: 'asc' }, { title: 'asc' }],
    });
  }

  findAll() {
    return this.prisma.catalogCategoryPage.findMany({
      orderBy: [{ sortOrder: 'asc' }, { title: 'asc' }],
    });
  }

  findBySlug(slug: string) {
    return this.prisma.catalogCategoryPage.findUnique({ where: { slug } });
  }

  findById(id: string) {
    return this.prisma.catalogCategoryPage.findUnique({ where: { id } });
  }

  create(data: Prisma.CatalogCategoryPageCreateInput) {
    return this.prisma.catalogCategoryPage.create({ data });
  }

  update(id: string, data: Prisma.CatalogCategoryPageUpdateInput) {
    return this.prisma.catalogCategoryPage.update({ where: { id }, data });
  }

  delete(id: string) {
    return this.prisma.catalogCategoryPage.delete({ where: { id } });
  }

  countBySlug(slug: string, excludeId?: string) {
    return this.prisma.catalogCategoryPage.count({
      where: {
        slug,
        ...(excludeId ? { NOT: { id: excludeId } } : {}),
      },
    });
  }

  resolveProductCategory(raw?: string | null): ProductCategory | null {
    if (!raw?.trim()) {
      return null;
    }

    const normalized = raw.trim().toUpperCase();
    if (Object.values(ProductCategory).includes(normalized as ProductCategory)) {
      return normalized as ProductCategory;
    }

    const map: Record<string, ProductCategory> = {
      RING: ProductCategory.RING,
      RINGS: ProductCategory.RING,
      NECKLACE: ProductCategory.NECKLACE,
      NECKLACES: ProductCategory.NECKLACE,
      BRACELET: ProductCategory.BRACELET,
      BRACELETS: ProductCategory.BRACELET,
      EARRING: ProductCategory.EARRING,
      EARRINGS: ProductCategory.EARRING,
      COIN: ProductCategory.COIN,
      COINS: ProductCategory.COIN,
      WEDDING_RING: ProductCategory.WEDDING_RING,
      'WEDDING-RING': ProductCategory.WEDDING_RING,
      'WEDDING-RINGS': ProductCategory.WEDDING_RING,
    };

    return map[normalized] ?? null;
  }
}
