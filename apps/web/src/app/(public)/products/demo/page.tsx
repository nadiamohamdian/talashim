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
      <div className="product-detail-mobile-shell lg:hidden">
        <ProductDetailMobile {...props} />
      </div>

      <div className="product-detail-page-desktop hidden space-y-4 p-6 lg:block">
        <p className="text-sm text-muted">
          نمای موبایل این صفحه برای پیش‌نمایش Figma است. عرض پنجره را کمتر از ۱۰۲۴px کنید یا از
          DevTools موبایل استفاده کنید.
        </p>
        <ProductDetailMobile {...props} />
      </div>
    </div>
  );
}
