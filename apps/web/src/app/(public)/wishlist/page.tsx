import { FeatureGate } from '@/features/site/components/feature-gate';
import { WishlistContent } from '@/features/wishlist/components/wishlist-content';
import { AccountShell } from '@/widgets/account/account-shell';

export default function WishlistPage() {
  return (
    <FeatureGate flag="enableWishlist">
      <AccountShell title="علاقه‌مندی‌ها" returnPath="/wishlist">
        <WishlistContent />
      </AccountShell>
    </FeatureGate>
  );
}
