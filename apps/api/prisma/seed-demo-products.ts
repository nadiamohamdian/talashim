import type { PrismaClient } from '../src/generated/prisma';
import type { SeedMediaUrls } from './seed-media';
import { syncCatalogDemoProducts } from '../src/modules/catalog/lib/sync-catalog-demo-products';

export async function seedCatalogDemoProducts(
  prisma: PrismaClient,
  seedMedia: SeedMediaUrls,
): Promise<void> {
  const result = await syncCatalogDemoProducts(prisma, {
    fallbackImageUrl: seedMedia.product,
  });

  console.info(`  Seeded ${result.synced} catalog demo products (SKU prefix DEMO-)`);
}
