'use client';

import {
  CHECKOUT_DELIVERY_SLOTS,
  type DeliverySlot,
} from '@/shared/config/checkout-flow';
import { formatPrice } from '@/shared/lib/format-price';
import { toPersianDigits } from '@/shared/lib/to-persian-digits';

interface CheckoutDeliverySlotsProps {
  selectedId: string;
  onSelect: (slot: DeliverySlot) => void;
}

export function CheckoutDeliverySlots({
  selectedId,
  onSelect,
}: CheckoutDeliverySlotsProps) {
  return (
    <div className="checkout-delivery-track" role="listbox" aria-label="انتخاب زمان ارسال">
      {CHECKOUT_DELIVERY_SLOTS.map((slot) => {
        const selected = slot.id === selectedId;

        return (
          <button
            key={slot.id}
            type="button"
            role="option"
            aria-selected={selected}
            className={`checkout-delivery-card${selected ? ' checkout-delivery-card--selected' : ''}`}
            onClick={() => onSelect(slot)}
          >
            <span className="checkout-delivery-date-badge">
              <span className="checkout-delivery-date-num">{toPersianDigits(slot.dayNumber)}</span>
              <span className="checkout-delivery-date-month">{slot.monthLabel}</span>
            </span>
            <span className="checkout-delivery-day">{slot.dayLabel}</span>
            <span className="checkout-delivery-time">{slot.timeRange}</span>
            <span className="checkout-delivery-fee">{formatPrice(slot.feeToman)} تومان</span>
          </button>
        );
      })}
    </div>
  );
}
