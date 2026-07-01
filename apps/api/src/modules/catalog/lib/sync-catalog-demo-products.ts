import {
  CATALOG_DEMO_PRODUCTS,
  mapCatalogDemoCategoryToPrisma,
  STOREFRONT_PRODUCT_IMAGES,
} from '@sadafgold/shared';
import { ProductCategory, type PrismaClient } from '@/generated/prisma';

const DEFAULT_PRODUCT_IMAGE_URL = STOREFRONT_PRODUCT_IMAGES.default;

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
  SET_AND_HALF_SET: ProductCategory.SET_AND_HALF_SET,
};

export type SyncCatalogDemoProductsResult = {
  synced: number;
  slugs: string[];
};

export async function syncCatalogDemoProducts(
  prisma: PrismaClient,
  options?: { fallbackImageUrl?: string },
): Promise<SyncCatalogDemoProductsResult> {
  const slugs: string[] = [];

  for (const item of CATALOG_DEMO_PRODUCTS) {
    const prismaCategoryKey = mapCatalogDemoCategoryToPrisma(item.category);
    const category = PRISMA_CATEGORY_MAP[prismaCategoryKey];
    const imageUrl =
      item.storefrontImagePath ||
      options?.fallbackImageUrl ||
      DEFAULT_PRODUCT_IMAGE_URL;

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
        imageUrl,
        hoverImageUrl: imageUrl,
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
        imageUrl,
        hoverImageUrl: imageUrl,
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

    slugs.push(item.slug);
  }

  return {
    synced: slugs.length,
    slugs,
  };
}
