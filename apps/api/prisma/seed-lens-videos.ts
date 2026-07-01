import { CmsBannerStatus, type PrismaClient } from '../src/generated/prisma';
import type { SeedMediaUrls } from './seed-media';

const LENS_EDITORIAL_HOTSPOTS = [
  {
    id: 'hotspot-ring',
    top: '131px',
    left: '17px',
    chipTop: '26px',
    chipLeft: '55px',
    chipTranslateX: '-12%',
    chipTranslateY: 'calc(-100% - 8px)',
  },
  {
    id: 'hotspot-earring',
    top: '94px',
    left: '265px',
    chipTop: '90px',
    chipLeft: '438px',
    chipTranslateX: '-88%',
    chipTranslateY: 'calc(-100% - 8px)',
  },
  {
    id: 'hotspot-bracelet',
    top: '30px',
    left: '204px',
    chipTop: '229px',
    chipLeft: '29px',
    chipTopMobile: '93.2%',
    chipLeftMobile: '6.95%',
    chipTranslateX: '-20%',
    chipTranslateY: 'calc(-100% - 8px)',
  },
] as const;

const LENS_SLIDES = [
  {
    id: 'seed-lens-1',
    title: 'کالکشن گوشواره',
    sortOrder: 0,
    heroImageUrl: null as string | null,
    thumbnailUrl: null as string | null,
  },
  {
    id: 'seed-lens-2',
    title: 'ست عروسی',
    sortOrder: 1,
    heroImageUrl: null,
    thumbnailUrl: null,
  },
  {
    id: 'seed-lens-3',
    title: 'طلای روز',
    sortOrder: 2,
    heroImageUrl: null,
    thumbnailUrl: null,
  },
] as const;

export async function seedLensVideos(
  prisma: PrismaClient,
  seedMedia: SeedMediaUrls,
): Promise<void> {
  const products = await prisma.product.findMany({
    orderBy: { createdAt: 'asc' },
    take: 3,
    select: { id: true },
  });

  if (products.length === 0) {
    console.warn('  [LENS] skipped — no published products for lens video links');
    return;
  }

  for (const slide of LENS_SLIDES) {
    await prisma.$transaction(async (tx) => {
      const video = await tx.cmsLensVideo.upsert({
        where: { id: slide.id },
        update: {
          title: slide.title,
          videoUrl: seedMedia.lensVideo,
          heroImageUrl: seedMedia.general,
          thumbnailUrl: seedMedia.general,
          hotspots: [...LENS_EDITORIAL_HOTSPOTS],
          sortOrder: slide.sortOrder,
          status: CmsBannerStatus.PUBLISHED,
        },
        create: {
          id: slide.id,
          title: slide.title,
          videoUrl: seedMedia.lensVideo,
          heroImageUrl: seedMedia.general,
          thumbnailUrl: seedMedia.general,
          hotspots: [...LENS_EDITORIAL_HOTSPOTS],
          sortOrder: slide.sortOrder,
          status: CmsBannerStatus.PUBLISHED,
        },
      });

      await tx.cmsLensVideoProduct.deleteMany({ where: { lensVideoId: video.id } });
      await tx.cmsLensVideoProduct.createMany({
        data: products.map((product, index) => ({
          lensVideoId: video.id,
          productId: product.id,
          sortOrder: index,
        })),
      });
    });

    console.info(`  [LENS] ${slide.id} — ${slide.title}`);
  }
}
