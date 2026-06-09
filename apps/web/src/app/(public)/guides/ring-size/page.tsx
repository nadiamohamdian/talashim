import type { Metadata } from 'next';
import { Suspense } from 'react';
import { RingSizeGuideView } from '@/widgets/catalog/ring-size-guide-view';

export const metadata: Metadata = {
  title: 'راهنمای انتخاب سایز انگشتر',
  description:
    'راهنمای اندازه‌گیری و انتخاب سایز انگشتر — جدول تبدیل دور انگشت به سایز استاندارد.',
};

export default function RingSizeGuidePage() {
  return (
    <Suspense fallback={null}>
      <RingSizeGuideView />
    </Suspense>
  );
}
