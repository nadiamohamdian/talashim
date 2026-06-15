import Link from 'next/link';
import type { ProductSummary } from '@sadafgold/types';
import { formatPrice } from '@/shared/lib/format-price';
import { toPersianDigits } from '@/shared/lib/to-persian-digits';
import { StoreProductCardMedia } from '@/shared/ui/store-product-card-media';

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
          <article key={product.id} className="store-product-card cart-similar-card">
            <Link href={`/products/${product.slug}`} className="cart-similar-card-link">
              <StoreProductCardMedia
                imageUrl={product.imageUrl}
                hoverImageUrl={product.hoverImageUrl}
                alt={product.title}
                sizes="148px"
              />
              <h3 className="store-product-card-title cart-similar-card-title">{product.title}</h3>
              <p className="store-product-card-price cart-similar-card-price">
                {formatPrice(product.priceToman)} تومان
              </p>
              <p className="store-product-card-weight cart-similar-card-weight">
                {toPersianDigits(product.weightGram)} گرم
              </p>
            </Link>
          </article>
        ))}
      </div>
    </section>
  );
}
