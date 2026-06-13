import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import type { PrismaClient } from '../src/generated/prisma';
import { getApiEnv } from '../src/config/env';
import {
  CMS_HERO_MEDIA_FILE,
  CMS_HERO_MEDIA_FOLDER,
} from '../src/modules/admin/cms/cms-defaults';

const PLACEHOLDER_SVG = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="800" height="600" viewBox="0 0 800 600">
  <defs>
    <linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#f5e6c8"/>
      <stop offset="100%" style="stop-color:#c9a227"/>
    </linearGradient>
  </defs>
  <rect fill="#f8f6f3" width="800" height="600"/>
  <circle cx="400" cy="260" r="100" fill="none" stroke="url(#g)" stroke-width="6"/>
  <circle cx="400" cy="260" r="72" fill="none" stroke="url(#g)" stroke-width="4" opacity="0.6"/>
  <text x="400" y="430" text-anchor="middle" font-family="Georgia, serif" font-size="26" fill="#8b7355">تلاشیم</text>
</svg>`;

export type SeedMediaUrls = {
  product: string;
  blog: string;
  banner: string;
  general: string;
  receipt: string;
};

export async function ensureSeedMediaAssets(prisma: PrismaClient): Promise<SeedMediaUrls> {
  const env = getApiEnv();
  const base = `http://localhost:${env.API_PORT}/${env.API_PREFIX}/v${env.API_VERSION}/media-files`;
  const buffer = Buffer.from(PLACEHOLDER_SVG, 'utf-8');

  const specs: Array<{
    id: string;
    folder: string;
    filename: string;
    key: keyof SeedMediaUrls;
    registerInLibrary?: boolean;
  }> = [
    { id: 'seed-media-products', folder: 'products', filename: 'seed-placeholder.svg', key: 'product' },
    { id: 'seed-media-blog', folder: 'blog', filename: 'seed-placeholder.svg', key: 'blog' },
    { id: 'seed-media-banners', folder: 'banners', filename: 'seed-placeholder.svg', key: 'banner' },
    { id: 'seed-media-general', folder: 'general', filename: 'seed-placeholder.svg', key: 'general' },
    {
      id: 'seed-media-receipts',
      folder: 'payment-receipts',
      filename: 'seed-receipt-placeholder.svg',
      key: 'receipt' as const,
      registerInLibrary: false,
    },
  ];

  const urls: Partial<SeedMediaUrls> = {};

  for (const spec of specs) {
    const dir = join(process.cwd(), 'uploads', spec.folder);
    await mkdir(dir, { recursive: true });
    await writeFile(join(dir, spec.filename), buffer);

    const url = `${base}/${spec.folder}/${spec.filename}`;
    urls[spec.key] = url;

    if (spec.registerInLibrary !== false) {
      await prisma.mediaAsset.upsert({
        where: { id: spec.id },
        update: { url, sizeBytes: buffer.length },
        create: {
          id: spec.id,
          filename: spec.filename,
          url,
          mimeType: 'image/svg+xml',
          sizeBytes: buffer.length,
          folder: spec.folder,
          alt: 'تصویر نمونه توسعه',
        },
      });
    }
  }

  const heroDir = join(process.cwd(), 'uploads', CMS_HERO_MEDIA_FOLDER);
  await mkdir(heroDir, { recursive: true });
  const heroPath = join(heroDir, CMS_HERO_MEDIA_FILE);
  let heroSize = 0;
  try {
    const heroBuffer = await readFile(heroPath);
    heroSize = heroBuffer.length;
  } catch {
    await writeFile(heroPath, buffer);
    heroSize = buffer.length;
  }

  const heroUrl = `${base}/${CMS_HERO_MEDIA_FOLDER}/${CMS_HERO_MEDIA_FILE}`;
  await prisma.mediaAsset.upsert({
    where: { id: 'seed-media-hero-mobile' },
    update: { url: heroUrl, sizeBytes: heroSize, mimeType: 'image/png' },
    create: {
      id: 'seed-media-hero-mobile',
      filename: CMS_HERO_MEDIA_FILE,
      url: heroUrl,
      mimeType: 'image/png',
      sizeBytes: heroSize,
      folder: CMS_HERO_MEDIA_FOLDER,
      alt: 'تصویر هیرو موبایل',
    },
  });

  return urls as SeedMediaUrls;
}
