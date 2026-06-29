import type { PrismaClient } from '../src/generated/prisma';
import type { SeedMediaUrls } from './seed-media';
import { syncCatalogDemoProducts } from '../src/modules/catalog/lib/sync-catalog-demo-products';

export async function seedCatalogDemoProducts(
  prisma: PrismaClient,
  _seedMedia: SeedMediaUrls,
): Promise<void> {
  const result = await syncCatalogDemoProducts(prisma);

  console.info(`  Seeded ${result.synced} catalog demo products (SKU prefix DEMO-)`);
}
