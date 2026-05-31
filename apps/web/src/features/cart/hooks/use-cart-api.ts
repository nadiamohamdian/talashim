'use client';

export {
  useCart,
  useUpsertCartItemMutation,
  useRemoveCartItemMutation,
} from '@/lib/api/hooks/use-orders';

/** @deprecated Use `useCart` from `@/lib/api` */
export { useCart as useServerCart } from '@/lib/api/hooks/use-orders';
