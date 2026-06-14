import type { Metadata } from 'next';
import {
  enrichProductDetailProps,
  PRODUCT_DETAIL_DEMO,
} from '@/shared/config/product-detail-demo';
import { ProductDetailMobile } from '@/widgets/catalog/product-detail-mobile';

export const metadata: Metadata = {
  title: 'انگشتر زنانه لوکس بیضی | طلاشیم',
  description: 'پیش‌نمایش صفحه محصول — Figma node 1752:5974',
};

export default function ProductDemoPage() {
  const props = enrichProductDetailProps(PRODUCT_DETAIL_DEMO, PRODUCT_DETAIL_DEMO);

  return (
    <div className="product-detail-page store-chrome-dark">
      <div className="product-detail-mobile-shell">
        <ProductDetailMobile {...props} />
      </div>
    </div>
  );
}
