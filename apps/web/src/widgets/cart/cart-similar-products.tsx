import Link from 'next/link';
import type { ProductSummary } from '@sadafgold/types';
import { formatPrice } from '@/shared/lib/format-price';
import { toPersianDigits } from '@/shared/lib/to-persian-digits';
import { StoreImage } from '@/shared/ui/store-image';

interface CartSimilarProductsProps {
  products: ProductSummary[];
}

export function CartSimilarProducts({ products }: CartSimilarProductsProps) {
  if (products.length === 0) {
    return null;
  }

  return (
    <section className="cart-similar" aria-labelledby="cart-similar-title">
      <h2 id="cart-similar-title" className="cart-similar-title">
        محصولات مشابه
      </h2>
      <div className="cart-similar-track">
        {products.map((product) => (
          <article key={product.id} className="cart-similar-card">
            <Link href={`/products/${product.slug}`} className="cart-similar-card-link">
              <div className="cart-similar-card-media">
                <StoreImage
                  src={product.imageUrl}
                  alt={product.title}
                  fill
                  className="cart-similar-card-image"
                  sizes="148px"
                />
              </div>
              <h3 className="cart-similar-card-title">{product.title}</h3>
              <p className="cart-similar-card-price">
                {formatPrice(product.priceToman)} تومان
              </p>
              <p className="cart-similar-card-weight">
                {toPersianDigits(product.weightGram)} گرم
              </p>
            </Link>
          </article>
        ))}
      </div>
    </section>
  );
}
