import { FeatureGate } from '@/features/site/components/feature-gate';
import { WishlistContent } from '@/features/wishlist/components/wishlist-content';

export default function WishlistPage() {
  return (
    <FeatureGate flag="enableWishlist">
      <div className="space-y-6">
        <h1 className="section-heading mx-auto w-fit">علاقه‌مندی‌ها</h1>
        <WishlistContent />
      </div>
    </FeatureGate>
  );
}
