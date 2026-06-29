import type { Metadata } from 'next';
import { getPublishedLensVideos } from '@/lib/api/cms.api';
import { mapLensVideoToShowcaseItem } from '@/shared/config/cms-lens-showcase';
import { LENS_ARCHIVE_PAGE_SIZE, LENS_PAGE_META } from '@/shared/config/lens-page';
import { LensPageView } from '@/widgets/lens/lens-page-view';

export const metadata: Metadata = {
  title: LENS_PAGE_META.title,
  description: LENS_PAGE_META.description,
};

export const dynamic = 'force-dynamic';

interface LensPageProps {
  searchParams: Promise<{ page?: string }>;
}

export default async function LensPage({ searchParams }: LensPageProps) {
  const { page: pageParam } = await searchParams;
  const requestedPage = Number.parseInt(pageParam ?? '1', 10);
  const safeRequestedPage = Number.isFinite(requestedPage) && requestedPage > 0 ? requestedPage : 1;

  const allVideos = await getPublishedLensVideos().catch(() => []);
  const allItems = allVideos.map((video, index) => mapLensVideoToShowcaseItem(video, index));

  const totalPages = Math.max(1, Math.ceil(allItems.length / LENS_ARCHIVE_PAGE_SIZE));
  const currentPage = Math.min(safeRequestedPage, totalPages);
  const pageItems =
    allItems.length > 0
      ? allItems.slice(
          (currentPage - 1) * LENS_ARCHIVE_PAGE_SIZE,
          currentPage * LENS_ARCHIVE_PAGE_SIZE,
        )
      : [];

  return (
    <LensPageView items={pageItems} currentPage={currentPage} totalPages={totalPages} />
  );
}
