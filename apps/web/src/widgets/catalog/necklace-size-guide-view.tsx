'use client';

import {
  NECKLACE_SIZE_CHART_ROWS,
  NECKLACE_SIZE_GUIDE_INFO,
  NECKLACE_SIZE_GUIDE_TIPS,
} from '@/shared/config/necklace-size-guide';
import { toPersianDigits } from '@/shared/lib/to-persian-digits';
import { JewelrySizeGuideView } from '@/widgets/catalog/jewelry-size-guide-view';

export function NecklaceSizeGuideView() {
  return (
    <JewelrySizeGuideView
      variant="necklace"
      title="راهنمای انتخاب سایز گردنبند"
      lead="نخ یا متر را روی گردن قرار دهید، طول دلخواه خود را مشخص کنید و نزدیک‌ترین سایز را انتخاب کنید."
      chartHeaders={['طول گردنبند', 'موقعیت روی گردن']}
      chartRows={NECKLACE_SIZE_CHART_ROWS.map((row) => ({
        primary: toPersianDigits(row.lengthLabel),
        secondary: row.placement,
      }))}
      tips={NECKLACE_SIZE_GUIDE_TIPS}
      tipsJustify
      infoBlock={NECKLACE_SIZE_GUIDE_INFO}
    />
  );
}
