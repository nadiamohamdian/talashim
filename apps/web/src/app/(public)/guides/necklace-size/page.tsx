import type { Metadata } from 'next';
import { Suspense } from 'react';
import { NecklaceSizeGuideView } from '@/widgets/catalog/necklace-size-guide-view';

export const metadata: Metadata = {
  title: 'راهنمای انتخاب سایز گردنبند',
  description: 'راهنمای اندازه‌گیری و انتخاب طول مناسب گردنبند.',
};

export default function NecklaceSizeGuidePage() {
  return (
    <Suspense fallback={null}>
      <NecklaceSizeGuideView />
    </Suspense>
  );
}
