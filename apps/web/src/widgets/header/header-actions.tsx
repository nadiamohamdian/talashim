'use client';

import Link from 'next/link';
import type { ReactNode } from 'react';
import { useCartHydrated } from '@/features/cart/hooks/use-cart-hydrated';
import { useDisplayCart } from '@/features/cart/hooks/use-display-cart';
import { useCartStore } from '@/features/cart/model/cart-store';
import { formatPrice } from '@/shared/lib/format-price';
import { IconCart, IconHeart } from '@/shared/ui/icons';
import { useFeatureFlag } from '@/shared/providers/storefront-settings-provider';
import { UserAccountDropdown } from '@/widgets/account/user-account-dropdown';

function HeaderActionLink({
  href,
  label,
  icon,
  badge,
  sublabel,
  onClick,
}: {
  href?: string;
  label: string;
  icon: ReactNode;
  badge?: number;
  sublabel?: string;
  onClick?: () => void;
}) {
  const content = (
    <>
      <span className="relative inline-flex rounded-lg bg-nude-50 p-2 text-gold-dark">
        {icon}
        {badge != null && badge > 0 ? (
          <span className="absolute -left-1.5 -top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-gold-dark px-1 text-[10px] font-bold text-white">
            {badge}
          </span>
        ) : null}
      </span>
      <span className="hidden flex-col items-start leading-tight lg:flex">
        <span className="text-[11px] text-muted">{label}</span>
        {sublabel ? (
          <span className="max-w-[120px] truncate text-sm font-semibold text-foreground">
            {sublabel}
          </span>
        ) : null}
      </span>
    </>
  );

  const className =
    'inline-flex items-center gap-2.5 rounded-xl px-1.5 py-1 transition hover:bg-nude-50';

  if (onClick) {
    return (
      <button type="button" onClick={onClick} className={className} aria-label={label}>
        {content}
      </button>
    );
  }

  if (!href) return null;

  return (
    <Link href={href} className={className} aria-label={label}>
      {content}
    </Link>
  );
}

export function HeaderActions() {
  const wishlistEnabled = useFeatureFlag('enableWishlist');
  const cartHydrated = useCartHydrated();
  const { count, total } = useDisplayCart();
  const openCart = useCartStore((s) => s.openCart);
  const cartBadge = cartHydrated && count > 0 ? count : undefined;
  const cartSublabel =
    cartHydrated && count > 0 ? `${formatPrice(total)} تومان` : 'سبد خرید';

  return (
    <div className="flex shrink-0 items-center gap-0.5 sm:gap-1">
      <UserAccountDropdown />
      {wishlistEnabled ? (
        <HeaderActionLink
          href="/wishlist"
          label="علاقه‌مندی"
          icon={<IconHeart className="h-5 w-5" />}
        />
      ) : null}
      <HeaderActionLink
        label="سبد خرید"
        sublabel={cartSublabel}
        badge={cartBadge}
        icon={<IconCart className="h-5 w-5" />}
        onClick={openCart}
      />
    </div>
  );
}
