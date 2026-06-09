'use client';

import type { CartLineItem } from '@/features/cart/model/cart-store';
import { formatPrice } from '@/shared/lib/format-price';
import { toPersianDigits } from '@/shared/lib/to-persian-digits';
import {
  CART_DEFAULT_IMAGE,
  CART_DEFAULT_VARIANT_LABEL,
} from '@/shared/config/cart-page';
import { StoreImage } from '@/shared/ui/store-image';

interface CartLineItemRowProps {
  item: CartLineItem;
  swatchColor?: string;
  onRemove: (id: string) => void;
  onQuantityChange: (id: string, quantity: number) => void;
}

export function CartLineItemRow({
  item,
  swatchColor: swatchColorProp,
  onRemove,
  onQuantityChange,
}: CartLineItemRowProps) {
  const lineTotal = item.priceToman * item.quantity;
  const variantLabel = item.variantLabel ?? CART_DEFAULT_VARIANT_LABEL;
  const swatchColor = item.variantSwatchColor ?? swatchColorProp ?? '#ffffff';

  return (
    <article className="cart-line-item">
      <button
        type="button"
        className="cart-line-remove"
        aria-label={`حذف ${item.title}`}
        onClick={() => onRemove(item.id)}
      >
        <span className="cart-line-remove-icon" aria-hidden />
      </button>

      <div className="cart-line-body">
        <div className="cart-line-head">
          <h3 className="cart-line-title">{item.title}</h3>
          <div className="cart-line-meta">
            <span className="cart-line-price">{formatPrice(item.priceToman)} تومان</span>
            <span className="cart-line-meta-divider" aria-hidden />
            {item.weightGram != null ? (
              <span className="cart-line-weight">{toPersianDigits(item.weightGram)} گرم</span>
            ) : null}
          </div>
        </div>

        <div className="cart-line-foot">
          <span className="cart-line-total">{formatPrice(lineTotal)} تومان</span>

          <div className="cart-line-qty" role="group" aria-label="تعداد">
            <button
              type="button"
              className="cart-line-qty-btn"
              aria-label="کاهش تعداد"
              onClick={() => onQuantityChange(item.id, item.quantity - 1)}
            >
              -
            </button>
            <span className="cart-line-qty-value">{toPersianDigits(item.quantity)}</span>
            <button
              type="button"
              className="cart-line-qty-btn"
              aria-label="افزایش تعداد"
              onClick={() => onQuantityChange(item.id, item.quantity + 1)}
            >
              +
            </button>
          </div>

          <div className="cart-line-variant">
            <span className="cart-line-variant-label">{variantLabel}</span>
            <span
              className="cart-line-variant-swatch"
              style={{ backgroundColor: swatchColor }}
              aria-hidden
            />
          </div>
        </div>
      </div>

      <div className="cart-line-media">
        <StoreImage
          src={item.imageUrl ?? CART_DEFAULT_IMAGE}
          alt={item.title}
          fill
          className="cart-line-image"
          sizes="100px"
        />
      </div>
    </article>
  );
}
