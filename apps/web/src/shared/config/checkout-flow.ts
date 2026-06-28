export type CheckoutStep = 1 | 2 | 3;

export const CHECKOUT_STEPS: Array<{ step: CheckoutStep; label: string }> = [
  { step: 1, label: 'اطلاعات ارسال' },
  { step: 2, label: 'پرداخت' },
  { step: 3, label: 'تائید سفارش' },
];

export interface DeliverySlot {
  id: string;
  dayLabel: string;
  monthLabel: string;
  dayNumber: string;
  timeRange: string;
  feeToman: number;
}

export const CHECKOUT_DELIVERY_SLOTS: DeliverySlot[] = [
  {
    id: 'sat-21-khordad',
    dayLabel: 'شنبه',
    monthLabel: 'خرداد',
    dayNumber: '21',
    timeRange: '10 الی 17',
    feeToman: 130_000,
  },
  {
    id: 'mon-23-khordad',
    dayLabel: 'دوشنبه',
    monthLabel: 'خرداد',
    dayNumber: '23',
    timeRange: '16 الی 20',
    feeToman: 100_000,
  },
  {
    id: 'thu-1-tir',
    dayLabel: 'پنج‌شنبه',
    monthLabel: 'تیر',
    dayNumber: '1',
    timeRange: '11 الی 15',
    feeToman: 90_000,
  },
  {
    id: 'sat-21-khordad-2',
    dayLabel: 'شنبه',
    monthLabel: 'خرداد',
    dayNumber: '21',
    timeRange: '10 الی 17',
    feeToman: 130_000,
  },
];

export const CHECKOUT_PROVINCES = [
  { value: 'تهران', label: 'تهران' },
  { value: 'اصفهان', label: 'اصفهان' },
  { value: 'فارس', label: 'فارس' },
  { value: 'خراسان رضوی', label: 'خراسان رضوی' },
] as const;

export const CHECKOUT_CITIES: Record<string, Array<{ value: string; label: string }>> = {
  تهران: [{ value: 'تهران', label: 'تهران' }],
  اصفهان: [{ value: 'اصفهان', label: 'اصفهان' }],
  فارس: [{ value: 'شیراز', label: 'شیراز' }],
  'خراسان رضوی': [{ value: 'مشهد', label: 'مشهد' }],
};

export const CHECKOUT_DEFAULT_SWATCH_COLORS = ['#fdcef3', '#b7deff', '#b88fff'] as const;

export type OrderTrackingStage =
  | 'placed'
  | 'confirmed'
  | 'packaging'
  | 'in_transit'
  | 'shipped'
  | 'delivered';

export interface OrderTrackingStep {
  id: OrderTrackingStage;
  label: string;
}

export const ORDER_TRACKING_STEPS: OrderTrackingStep[] = [
  { id: 'placed', label: 'ثبت سفارش' },
  { id: 'confirmed', label: 'تائید سفارش' },
  { id: 'packaging', label: 'بسته‌بندی' },
  { id: 'in_transit', label: 'درحال ارسال' },
  { id: 'shipped', label: 'ارسال' },
  { id: 'delivered', label: 'تحویل شده' },
];

export function getCompletedTrackingIndex(status: OrderTrackingStage): number {
  const index = ORDER_TRACKING_STEPS.findIndex((step) => step.id === status);
  return index >= 0 ? index : 0;
}
