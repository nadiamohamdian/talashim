import {
  CATALOG_DEMO_PRODUCTS,
  mapCatalogDemoCategoryToPrisma,
} from '@sadafgold/shared';
import { ProductCategory, type PrismaClient } from '../src/generated/prisma';
import type { SeedMediaUrls } from './seed-media';

const PRISMA_CATEGORY_MAP: Record<
  ReturnType<typeof mapCatalogDemoCategoryToPrisma>,
  ProductCategory
> = {
  RING: ProductCategory.RING,
  NECKLACE: ProductCategory.NECKLACE,
  BRACELET: ProductCategory.BRACELET,
  EARRING: ProductCategory.EARRING,
  COIN: ProductCategory.COIN,
  WEDDING_RING: ProductCategory.WEDDING_RING,
};

export async function seedCatalogDemoProducts(
  prisma: PrismaClient,
  seedMedia: SeedMediaUrls,
): Promise<void> {
  for (const item of CATALOG_DEMO_PRODUCTS) {
    const prismaCategoryKey = mapCatalogDemoCategoryToPrisma(item.category);
    const category = PRISMA_CATEGORY_MAP[prismaCategoryKey];

    const product = await prisma.product.upsert({
      where: { slug: item.slug },
      update: {
        sku: item.sku,
        title: item.title,
        description: item.description,
        seoDescription: item.seoDescription,
        category,
        karat: item.karat,
        weightGram: item.weightGram.toFixed(2),
        makingFeePercent: item.makingFeePercent,
        priceToman: BigInt(item.priceToman),
        imageUrl: seedMedia.product,
        hoverImageUrl: seedMedia.product,
        featured: item.featured,
      },
      create: {
        sku: item.sku,
        slug: item.slug,
        title: item.title,
        description: item.description,
        seoDescription: item.seoDescription,
        category,
        karat: item.karat,
        weightGram: item.weightGram.toFixed(2),
        makingFeePercent: item.makingFeePercent,
        priceToman: BigInt(item.priceToman),
        imageUrl: seedMedia.product,
        hoverImageUrl: seedMedia.product,
        featured: item.featured,
      },
    });

    await prisma.inventoryItem.upsert({
      where: { productId: product.id },
      update: { quantity: item.inventory },
      create: {
        productId: product.id,
        quantity: item.inventory,
      },
    });
  }

  console.info(`  Seeded ${CATALOG_DEMO_PRODUCTS.length} catalog demo products (SKU prefix DEMO-)`);
}
