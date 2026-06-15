import type { ProductSummary } from '@sadafgold/types';
import {
  BLOG_POST_DEMO_RELATED_PRODUCTS,
  mapProductToBlogRelatedItem,
} from '@/shared/config/blog-post-page';
import { BlogPostRelatedProductCard } from '@/widgets/blog/blog-post-related-product-card';

interface BlogPostRelatedProductsProps {
  products: ProductSummary[];
}

export function BlogPostRelatedProducts({ products }: BlogPostRelatedProductsProps) {
  const items =
    products.length > 0
      ? products.slice(0, 6).map(mapProductToBlogRelatedItem)
      : BLOG_POST_DEMO_RELATED_PRODUCTS;

  return (
    <div className="blog-post-related-products-track" role="list">
      {items.map((product) => (
        <div key={product.id} className="blog-post-related-products-item" role="listitem">
          <BlogPostRelatedProductCard product={product} />
        </div>
      ))}
    </div>
  );
}
