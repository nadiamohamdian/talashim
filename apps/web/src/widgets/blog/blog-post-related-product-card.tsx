import Link from 'next/link';
import type { BlogPostRelatedProductItem } from '@/shared/config/blog-post-page';
import { formatPrice } from '@/shared/lib/format-price';
import { toPersianDigits } from '@/shared/lib/to-persian-digits';

interface BlogPostRelatedProductCardProps {
  product: BlogPostRelatedProductItem;
}

function formatWeight(weightGram: number): string {
  const value = weightGram < 1 ? weightGram.toFixed(2) : String(weightGram);
  return toPersianDigits(value);
}

export function BlogPostRelatedProductCard({ product }: BlogPostRelatedProductCardProps) {
  return (
    <article className="blog-post-product-card">
      <Link href={`/products/${product.slug}`} className="blog-post-product-card-link">
        <div className="blog-post-product-card-media">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={product.imageUrl}
            alt={product.title}
            className="blog-post-product-card-image"
            loading="lazy"
            decoding="async"
          />
        </div>
        <h3 className="blog-post-product-card-title">{product.title}</h3>
        <p className="blog-post-product-card-price">{formatPrice(product.priceToman)} تومان</p>
        <p className="blog-post-product-card-weight">{formatWeight(product.weightGram)} گرم</p>
      </Link>
    </article>
  );
}
