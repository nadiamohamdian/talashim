'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useCartStore } from '@/features/cart/model/cart-store';

/** Legacy drawer — redirects to the full cart page (Figma 1752:6737). */
export function CartPanel() {
  const isOpen = useCartStore((s) => s.isOpen);
  const closeCart = useCartStore((s) => s.closeCart);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    closeCart();

    if (pathname !== '/cart') {
      router.push('/cart');
    }
  }, [isOpen, closeCart, pathname, router]);

  return null;
}
