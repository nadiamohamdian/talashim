import type { Metadata } from 'next';
import { Suspense } from 'react';
import { BraceletSizeGuideView } from '@/widgets/catalog/bracelet-size-guide-view';

export const metadata: Metadata = {
  title: 'راهنمای انتخاب سایز دستبند',
  description: 'راهنمای اندازه‌گیری دور مچ و انتخاب سایز مناسب دستبند.',
};

export default function BraceletSizeGuidePage() {
  return (
    <Suspense fallback={null}>
      <BraceletSizeGuideView />
    </Suspense>
  );
}
