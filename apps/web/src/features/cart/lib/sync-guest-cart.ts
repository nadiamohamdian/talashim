import { ApiClientError } from '@/lib/api/client';
import { orderApi } from '@/lib/api/order.api';
import type { CartLineItem } from '@/features/cart/model/cart-store';

export type GuestCartSyncResult = {
  /** Product IDs that were merged successfully. */
  syncedProductIds: string[];
  /** Stale or missing product IDs — safe to drop from local cart. */
  removedProductIds: string[];
};

export async function syncGuestCartToServer(
  items: readonly CartLineItem[],
): Promise<GuestCartSyncResult> {
  const syncedProductIds: string[] = [];
  const removedProductIds: string[] = [];

  for (const item of items) {
    try {
      await orderApi.upsertCartItem({
        productId: item.id,
        quantity: item.quantity,
      });
      syncedProductIds.push(item.id);
    } catch (error) {
      if (error instanceof ApiClientError && error.status === 404) {
        removedProductIds.push(item.id);
        continue;
      }
      if (error instanceof ApiClientError && error.status === 429) {
        throw error;
      }
      throw error;
    }
  }

  return { syncedProductIds, removedProductIds };
}
