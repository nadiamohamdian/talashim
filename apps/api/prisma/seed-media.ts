import { mkdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import type { PrismaClient } from '../src/generated/prisma';
import { getApiEnv } from '../src/config/env';

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

  return urls as SeedMediaUrls;
}
