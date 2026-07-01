import { createHash } from 'node:crypto';
import { readFile, unlink } from 'node:fs/promises';
import { join } from 'node:path';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import { Prisma, PrismaClient } from '../src/generated/prisma';
import '../src/load-env';

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error('DATABASE_URL is required');
}

const dryRun = process.argv.includes('--dry-run');
const uploadRoot = join(process.cwd(), 'uploads');

const pool = new Pool({ connectionString });
const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });

function resolveUploadPath(url: string): string | null {
  const match = url.match(/\/media-files\/([^/]+)\/([^/?#]+)/);
  if (!match) {
    return null;
  }
  const [, folder, filename] = match;
  if (!folder || !filename) {
    return null;
  }
  return join(uploadRoot, folder, filename);
}

async function hashFile(path: string): Promise<string> {
  const buffer = await readFile(path);
  return createHash('sha256').update(buffer).digest('hex');
}

function replaceInJsonValue(value: Prisma.JsonValue, oldUrl: string, newUrl: string): Prisma.JsonValue {
  if (typeof value === 'string') {
    return value.split(oldUrl).join(newUrl);
  }
  if (Array.isArray(value)) {
    return value.map((item) => replaceInJsonValue(item, oldUrl, newUrl));
  }
  if (value && typeof value === 'object') {
    const next: Record<string, Prisma.JsonValue> = {};
    for (const [key, item] of Object.entries(value)) {
      next[key] = replaceInJsonValue(item as Prisma.JsonValue, oldUrl, newUrl);
    }
    return next;
  }
  return value;
}

async function replaceMediaUrlReferences(oldUrl: string, newUrl: string): Promise<number> {
  if (oldUrl === newUrl) {
    return 0;
  }

  let updates = 0;

  const products = await prisma.product.findMany({
    where: {
      OR: [{ imageUrl: oldUrl }, { hoverImageUrl: oldUrl }, { ogImageUrl: oldUrl }, { description: { contains: oldUrl } }],
    },
    select: { id: true, imageUrl: true, hoverImageUrl: true, ogImageUrl: true, description: true },
  });

  for (const product of products) {
    await prisma.product.update({
      where: { id: product.id },
      data: {
        imageUrl: product.imageUrl === oldUrl ? newUrl : product.imageUrl,
        hoverImageUrl: product.hoverImageUrl === oldUrl ? newUrl : product.hoverImageUrl,
        ogImageUrl: product.ogImageUrl === oldUrl ? newUrl : product.ogImageUrl,
        description: product.description.includes(oldUrl)
          ? product.description.split(oldUrl).join(newUrl)
          : product.description,
      },
    });
    updates += 1;
  }

  updates += (
    await prisma.productImage.updateMany({
      where: { url: oldUrl },
      data: { url: newUrl },
    })
  ).count;

  updates += (
    await prisma.productVariant.updateMany({
      where: { imageUrl: oldUrl },
      data: { imageUrl: newUrl },
    })
  ).count;

  const videos = await prisma.productVideo.findMany({
    where: { OR: [{ videoUrl: oldUrl }, { thumbnailUrl: oldUrl }] },
    select: { id: true, videoUrl: true, thumbnailUrl: true },
  });
  for (const video of videos) {
    await prisma.productVideo.update({
      where: { id: video.id },
      data: {
        videoUrl: video.videoUrl === oldUrl ? newUrl : video.videoUrl,
        thumbnailUrl: video.thumbnailUrl === oldUrl ? newUrl : video.thumbnailUrl,
      },
    });
    updates += 1;
  }

  updates += (
    await prisma.blogPost.updateMany({
      where: { coverImageUrl: oldUrl },
      data: { coverImageUrl: newUrl },
    })
  ).count;

  const blogPosts = await prisma.blogPost.findMany({
    where: { content: { contains: oldUrl } },
    select: { id: true, content: true },
  });
  for (const post of blogPosts) {
    await prisma.blogPost.update({
      where: { id: post.id },
      data: { content: post.content.split(oldUrl).join(newUrl) },
    });
    updates += 1;
  }

  updates += (
    await prisma.cmsBanner.updateMany({
      where: { imageUrl: oldUrl },
      data: { imageUrl: newUrl },
    })
  ).count;

  const lensVideos = await prisma.cmsLensVideo.findMany({
    where: {
      OR: [{ videoUrl: oldUrl }, { thumbnailUrl: oldUrl }, { heroImageUrl: oldUrl }],
    },
    select: { id: true, videoUrl: true, thumbnailUrl: true, heroImageUrl: true, hotspots: true },
  });
  for (const lensVideo of lensVideos) {
    await prisma.cmsLensVideo.update({
      where: { id: lensVideo.id },
      data: {
        videoUrl: lensVideo.videoUrl === oldUrl ? newUrl : lensVideo.videoUrl,
        thumbnailUrl: lensVideo.thumbnailUrl === oldUrl ? newUrl : lensVideo.thumbnailUrl,
        heroImageUrl: lensVideo.heroImageUrl === oldUrl ? newUrl : lensVideo.heroImageUrl,
        hotspots: lensVideo.hotspots
          ? replaceInJsonValue(lensVideo.hotspots as Prisma.JsonValue, oldUrl, newUrl)
          : lensVideo.hotspots,
      },
    });
    updates += 1;
  }

  updates += (
    await prisma.cmsSeoSettings.updateMany({
      where: { defaultOgImageUrl: oldUrl },
      data: { defaultOgImageUrl: newUrl },
    })
  ).count;

  const categoryPages = await prisma.catalogCategoryPage.findMany({
    where: { heroImageUrls: { has: oldUrl } },
    select: { id: true, heroImageUrls: true },
  });
  for (const page of categoryPages) {
    await prisma.catalogCategoryPage.update({
      where: { id: page.id },
      data: {
        heroImageUrls: page.heroImageUrls.map((url) => (url === oldUrl ? newUrl : url)),
      },
    });
    updates += 1;
  }

  const homepage = await prisma.cmsHomepage.findUnique({ where: { id: 'default' } });
  if (homepage) {
    const hero = replaceInJsonValue(homepage.hero as Prisma.JsonValue, oldUrl, newUrl);
    const sections = replaceInJsonValue(homepage.sections as Prisma.JsonValue, oldUrl, newUrl);
    if (
      JSON.stringify(hero) !== JSON.stringify(homepage.hero) ||
      JSON.stringify(sections) !== JSON.stringify(homepage.sections)
    ) {
      await prisma.cmsHomepage.update({
        where: { id: 'default' },
        data: { hero, sections },
      });
      updates += 1;
    }
  }

  const aboutPage = await prisma.cmsAboutPage.findUnique({ where: { id: 'default' } });
  if (aboutPage) {
    const meta = replaceInJsonValue(aboutPage.meta as Prisma.JsonValue, oldUrl, newUrl);
    const copy = replaceInJsonValue(aboutPage.copy as Prisma.JsonValue, oldUrl, newUrl);
    const values = replaceInJsonValue(aboutPage.values as Prisma.JsonValue, oldUrl, newUrl);
    if (
      JSON.stringify(meta) !== JSON.stringify(aboutPage.meta) ||
      JSON.stringify(copy) !== JSON.stringify(aboutPage.copy) ||
      JSON.stringify(values) !== JSON.stringify(aboutPage.values) ||
      aboutPage.decorImageUrl === oldUrl
    ) {
      await prisma.cmsAboutPage.update({
        where: { id: 'default' },
        data: {
          meta,
          copy,
          values,
          decorImageUrl: aboutPage.decorImageUrl === oldUrl ? newUrl : aboutPage.decorImageUrl,
        },
      });
      updates += 1;
    }
  }

  const staticPages = await prisma.cmsStaticPage.findMany({
    where: { content: { contains: oldUrl } },
    select: { id: true, content: true },
  });
  for (const page of staticPages) {
    await prisma.cmsStaticPage.update({
      where: { id: page.id },
      data: { content: page.content.split(oldUrl).join(newUrl) },
    });
    updates += 1;
  }

  return updates;
}

async function main() {
  const assets = await prisma.mediaAsset.findMany({
    orderBy: { createdAt: 'asc' },
  });

  console.log(`[cleanup] loaded ${assets.length} media assets`);
  console.log(`[cleanup] mode: ${dryRun ? 'DRY RUN' : 'APPLY'}`);

  const byHash = new Map<string, typeof assets>();
  const missingFiles: typeof assets = [];

  for (const asset of assets) {
    const path = resolveUploadPath(asset.url);
    if (!path) {
      missingFiles.push(asset);
      continue;
    }

    try {
      const hash = await hashFile(path);
      const group = byHash.get(hash) ?? [];
      group.push(asset);
      byHash.set(hash, group);
    } catch {
      missingFiles.push(asset);
    }
  }

  let removed = 0;
  let referencesUpdated = 0;

  const deletedIds = new Set<string>();

  for (const [hash, group] of byHash.entries()) {
    if (group.length < 2) {
      continue;
    }

    const [keeper, ...duplicates] = group;
    console.log(
      `[cleanup] duplicate group ${hash.slice(0, 12)}… keep ${keeper.id} (${keeper.filename}), remove ${duplicates.length}`,
    );

    for (const duplicate of duplicates) {
      const refUpdates = dryRun ? 0 : await replaceMediaUrlReferences(duplicate.url, keeper.url);
      referencesUpdated += refUpdates;

      if (dryRun) {
        console.log(`  - would delete ${duplicate.id} ${duplicate.url}`);
        removed += 1;
        continue;
      }

      const path = resolveUploadPath(duplicate.url);
      if (path) {
        try {
          await unlink(path);
        } catch {
          // already missing
        }
      }

      await prisma.mediaAsset.delete({ where: { id: duplicate.id } });
      deletedIds.add(duplicate.id);
      console.log(`  - deleted ${duplicate.id}`);
      removed += 1;
    }
  }

  const remainingAssets = assets.filter((asset) => !deletedIds.has(asset.id));
  const byUrl = new Map<string, typeof remainingAssets>();
  for (const asset of remainingAssets) {
    const group = byUrl.get(asset.url) ?? [];
    group.push(asset);
    byUrl.set(asset.url, group);
  }

  for (const [url, group] of byUrl.entries()) {
    if (group.length < 2) {
      continue;
    }

    const [keeper, ...duplicates] = group.sort(
      (a, b) => a.createdAt.getTime() - b.createdAt.getTime(),
    );

    console.log(`[cleanup] duplicate URL ${url} — keep ${keeper.id}, remove ${duplicates.length}`);

    for (const duplicate of duplicates) {
      if (dryRun) {
        console.log(`  - would delete ${duplicate.id}`);
        removed += 1;
        continue;
      }

      const path = resolveUploadPath(duplicate.url);
      if (path) {
        try {
          await unlink(path);
        } catch {
          // ignore
        }
      }

      await prisma.mediaAsset.delete({ where: { id: duplicate.id } });
      deletedIds.add(duplicate.id);
      removed += 1;
    }
  }

  if (missingFiles.length > 0) {
    console.log(`[cleanup] ${missingFiles.length} assets with missing/unreadable files (left untouched)`);
  }

  console.log(`[cleanup] removed duplicates: ${removed}`);
  console.log(`[cleanup] reference updates: ${referencesUpdated}`);
}

main()
  .catch((error) => {
    console.error('[cleanup] failed', error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
