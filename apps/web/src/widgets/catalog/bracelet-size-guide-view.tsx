'use client';

import {
  BRACELET_SIZE_CHART_ROWS,
  BRACELET_SIZE_GUIDE_INFO,
  BRACELET_SIZE_GUIDE_TIPS,
} from '@/shared/config/bracelet-size-guide';
import { toPersianDigits } from '@/shared/lib/to-persian-digits';
import { JewelrySizeGuideView } from '@/widgets/catalog/jewelry-size-guide-view';

export function BraceletSizeGuideView() {
  return (
    <JewelrySizeGuideView
      variant="bracelet"
      title="راهنمای انتخاب سایز دستبند"
      lead="نخ یا متر را روی دست قرار دهید، طول دلخواه خود را مشخص کنید و نزدیک‌ترین سایز را انتخاب کنید."
      chartHeaders={['طول دستبند', 'موقعیت روی دست']}
      chartRows={BRACELET_SIZE_CHART_ROWS.map((row) => ({
        primary: toPersianDigits(row.lengthLabel),
        secondary: row.placement,
      }))}
      tips={BRACELET_SIZE_GUIDE_TIPS}
      tipsJustify
      infoBlock={BRACELET_SIZE_GUIDE_INFO}
    />
  );
}
