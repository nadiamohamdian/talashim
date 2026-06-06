import { Suspense } from 'react';
import { MediaLibraryPanel } from '@/features/cms/components/media-library-panel';
import { Skeleton } from '@sadafgold/ui';

export default function Page() {
  return (
    <Suspense fallback={<Skeleton className="h-64 w-full rounded-[var(--radius-xl)]" />}>
      <MediaLibraryPanel />
    </Suspense>
  );
}
