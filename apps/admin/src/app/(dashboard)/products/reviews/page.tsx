import { Suspense } from 'react';
import { ProductReviewsPanel } from '@/features/commerce/components/product-reviews-panel';

export default function Page() {
  return (
    <Suspense fallback={null}>
      <ProductReviewsPanel />
    </Suspense>
  );
}
