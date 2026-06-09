import Link from 'next/link';
import type { ProductSummary } from '@sadafgold/types';
import { formatPrice } from '@/shared/lib/format-price';
import { toPersianDigits } from '@/shared/lib/to-persian-digits';
import { StoreImage } from '@/shared/ui/store-image';

interface ProductListingCardProps {
  product: ProductSummary;
}

export function ProductListingCard({ product }: ProductListingCardProps) {
  return (
    <article className="product-listing-card">
      <Link href={`/products/${product.slug}`} className="product-listing-card-link">
        <div className="product-listing-card-media">
          <StoreImage
            src={product.imageUrl}
            alt={product.title}
            fill
            className="product-listing-card-image"
            sizes="170px"
          />
        </div>
        <h3 className="product-listing-card-title">{product.title}</h3>
        <p className="product-listing-card-price">
          {formatPrice(product.priceToman)} تومان
        </p>
        <p className="product-listing-card-weight">
          {toPersianDigits(product.weightGram)} گرم
        </p>
      </Link>
    </article>
  );
}
