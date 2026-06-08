import { formatTomanAmount } from '@sadafgold/shared';

export function formatPrice(priceToman: number | string) {
  return formatTomanAmount(priceToman);
}
