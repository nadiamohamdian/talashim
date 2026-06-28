import { formatPrice } from '@/shared/lib/format-price';

interface CheckoutOrderSummaryProps {
  subtotalToman: number;
  discountToman: number;
  taxToman: number;
  shippingToman: number;
  title?: string;
  className?: string;
  showTitle?: boolean;
}

export function CheckoutOrderSummary({
  subtotalToman,
  discountToman,
  taxToman,
  shippingToman,
  title = 'جزئیات سفارش',
  className = '',
  showTitle = true,
}: CheckoutOrderSummaryProps) {
  return (
    <section className={`checkout-summary${className ? ` ${className}` : ''}`}>
      {showTitle ? <h2 className="checkout-section-title">{title}</h2> : null}
      <div className="checkout-summary-box">
        <div className="checkout-summary-row">
          <span className="checkout-summary-label">جمع کل:</span>
          <span className="checkout-summary-value">{formatPrice(subtotalToman)} تومان</span>
        </div>
        <div className="checkout-summary-row">
          <span className="checkout-summary-label">تخفیف:</span>
          <span className="checkout-summary-value">
            {discountToman > 0 ? `${formatPrice(discountToman)} تومان` : '۰ تومان'}
          </span>
        </div>
        <div className="checkout-summary-row">
          <span className="checkout-summary-label">مالیات:</span>
          <span className="checkout-summary-value">{formatPrice(taxToman)} تومان</span>
        </div>
        <div className="checkout-summary-row">
          <span className="checkout-summary-label">هزینه ارسال:</span>
          <span className="checkout-summary-value">{formatPrice(shippingToman)} تومان</span>
        </div>
      </div>
    </section>
  );
}
