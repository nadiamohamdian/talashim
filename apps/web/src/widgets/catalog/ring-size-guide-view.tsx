'use client';

import {
  RING_SIZE_CHART_ROWS,
  RING_SIZE_GUIDE_FOOTNOTE,
  RING_SIZE_GUIDE_LEAD_DESKTOP,
  RING_SIZE_GUIDE_TIPS,
} from '@/shared/config/ring-size-guide';
import { toPersianDigits } from '@/shared/lib/to-persian-digits';
import { RingSizeGuideDiagram } from '@/widgets/catalog/jewelry-size-guide-diagrams';
import { JewelrySizeGuideView } from '@/widgets/catalog/jewelry-size-guide-view';

export function RingSizeGuideView() {
  return (
    <JewelrySizeGuideView
      variant="ring"
      title="راهنمای انتخاب سایز انگشتر"
      lead="اگر انگشتری دارید که اندازه شماست، آن را روی دایره‌های زیر قرار دهید. دایره‌ای را انتخاب کنید که لبه داخلی انگشتر دقیقاً با آن منطبق باشد."
      leadDesktop={RING_SIZE_GUIDE_LEAD_DESKTOP}
      chartSectionTitle="انتخاب سایز انگشتر"
      footnote={RING_SIZE_GUIDE_FOOTNOTE}
      chartHeaders={['دور انگشت', 'سایز انگشتر']}
      chartRows={RING_SIZE_CHART_ROWS.map((row) => ({
        primary: `${toPersianDigits(row.circumferenceMm)} میلی‌متر`,
        secondary: toPersianDigits(row.ringSize),
      }))}
      tips={RING_SIZE_GUIDE_TIPS}
      tipsJustify
      diagram={<RingSizeGuideDiagram />}
    />
  );
}
