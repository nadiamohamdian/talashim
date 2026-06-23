'use client';

import {
  NECKLACE_SIZE_CHART_ROWS,
  NECKLACE_SIZE_CHART_ROWS_DESKTOP,
  NECKLACE_SIZE_GUIDE_FOOTNOTE,
  NECKLACE_SIZE_GUIDE_INFO,
  NECKLACE_SIZE_GUIDE_LEAD_DESKTOP,
  NECKLACE_SIZE_GUIDE_TIPS,
} from '@/shared/config/necklace-size-guide';
import { toPersianDigits } from '@/shared/lib/to-persian-digits';
import { JewelrySizeGuideView } from '@/widgets/catalog/jewelry-size-guide-view';

function mapNecklaceChartRows(rows: typeof NECKLACE_SIZE_CHART_ROWS) {
  return rows.map((row) => ({
    primary: toPersianDigits(row.lengthLabel),
    secondary: row.placement,
  }));
}

export function NecklaceSizeGuideView() {
  return (
    <JewelrySizeGuideView
      variant="necklace"
      title="راهنمای انتخاب سایز گردنبند"
      lead="نخ یا متر را روی گردن قرار دهید، طول دلخواه خود را مشخص کنید و نزدیک‌ترین سایز را انتخاب کنید."
      leadDesktop={NECKLACE_SIZE_GUIDE_LEAD_DESKTOP}
      chartHeaders={['طول گردنبند', 'موقعیت روی گردن']}
      chartRows={mapNecklaceChartRows(NECKLACE_SIZE_CHART_ROWS)}
      chartRowsDesktop={mapNecklaceChartRows(NECKLACE_SIZE_CHART_ROWS_DESKTOP)}
      tips={NECKLACE_SIZE_GUIDE_TIPS}
      tipsJustify
      infoBlock={NECKLACE_SIZE_GUIDE_INFO}
      footnote={NECKLACE_SIZE_GUIDE_FOOTNOTE}
    />
  );
}
