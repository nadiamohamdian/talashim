import {
  DEFAULT_SHIPPING_FEE_TOMAN,
  SHIPPING_INSURANCE_PERCENT,
} from './constants/commerce';

export function calculateShippingFeeToman(
  subtotalToman: number,
  freeShippingMinToman: number,
): number {
  if (subtotalToman >= freeShippingMinToman) {
    return 0;
  }
  return DEFAULT_SHIPPING_FEE_TOMAN;
}

export function calculateInsuranceFeeToman(
  subtotalToman: number,
  isInsured: boolean,
  insurancePercent: number = SHIPPING_INSURANCE_PERCENT,
): number {
  if (!isInsured) {
    return 0;
  }
  return Math.round((subtotalToman * insurancePercent) / 100);
}

/** Shipping fee implied by stored order totals (shipping is not persisted separately). */
export function deriveShippingFeeToman(order: {
  subtotalToman: number;
  taxToman: number;
  insuranceFeeToman: number;
  totalToman: number;
}): number {
  return Math.max(
    0,
    order.totalToman - order.subtotalToman - order.taxToman - order.insuranceFeeToman,
  );
}
