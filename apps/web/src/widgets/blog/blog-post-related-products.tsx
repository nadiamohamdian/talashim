'use client';

import { useRef, type ReactNode } from 'react';
import type { ProductSummary } from '@sadafgold/types';
import {
  BLOG_POST_DEMO_RELATED_PRODUCTS,
  mapProductToBlogRelatedItem,
} from '@/shared/config/blog-post-page';
import { BlogPostRelatedProductCard } from '@/widgets/blog/blog-post-related-product-card';

interface BlogPostRelatedProductsProps {
  products: ProductSummary[];
  title: ReactNode;
}

export function BlogPostRelatedProducts({ products, title }: BlogPostRelatedProductsProps) {
  const trackRef = useRef<HTMLDivElement>(null);

  const items =
    products.length > 0
      ? products.slice(0, 6).map(mapProductToBlogRelatedItem)
      : BLOG_POST_DEMO_RELATED_PRODUCTS;

  const scrollByCard = (direction: 1 | -1) => {
    const track = trackRef.current;
    if (!track) return;
    const card = track.querySelector<HTMLElement>('.blog-post-related-products-item');
    const gap = 24;
    const distance = (card?.offsetWidth ?? track.clientWidth) + gap;
    track.scrollBy({ left: direction * distance * -1, behavior: 'smooth' });
  };

  return (
    <div className="blog-post-products-block">
      <div className="blog-post-products-header">
        {title}
        <div className="blog-post-carousel-nav blog-post-carousel-nav--products" aria-label="ناوبری محصولات">
          <button
            type="button"
            className="blog-post-carousel-nav-btn"
            onClick={() => scrollByCard(1)}
            aria-label="بعدی"
          >
            <span aria-hidden>›</span>
          </button>
          <button
            type="button"
            className="blog-post-carousel-nav-btn"
            onClick={() => scrollByCard(-1)}
            aria-label="قبلی"
          >
            <span aria-hidden>‹</span>
          </button>
        </div>
      </div>

      <div ref={trackRef} className="blog-post-related-products-track" role="list">
        {items.map((product) => (
          <div key={product.id} className="blog-post-related-products-item" role="listitem">
            <BlogPostRelatedProductCard product={product} />
          </div>
        ))}
      </div>
    </div>
  );
}
