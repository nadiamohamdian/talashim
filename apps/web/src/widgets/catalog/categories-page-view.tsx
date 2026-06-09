import Link from 'next/link';
import type { CatalogCategory } from '@/lib/api/product.api';
import { CATEGORIES_PAGE_META } from '@/shared/config/categories-page';
import { toPersianDigits } from '@/shared/lib/to-persian-digits';

interface CategoriesPageViewProps {
  categories: CatalogCategory[];
}

export function CategoriesPageView({ categories }: CategoriesPageViewProps) {
  return (
    <div className="categories-page store-chrome-light store-minimal-header">
      <div className="categories-page-inner">
        <header className="categories-page-header">
          <p className="categories-eyebrow">{CATEGORIES_PAGE_META.eyebrow}</p>
          <h1 className="categories-title" aria-label={CATEGORIES_PAGE_META.title}>
            {CATEGORIES_PAGE_META.title}
          </h1>
          <p className="categories-description">{CATEGORIES_PAGE_META.description}</p>
        </header>

        {!categories.length ? (
          <p className="categories-empty">دسته‌بندی‌ای یافت نشد.</p>
        ) : (
          <ul className="categories-grid">
            {categories.map((category) => (
              <li key={category.slug} className="categories-grid-item">
                <Link href={`/categories/${category.slug}`} className="categories-card">
                  <span className="categories-card-label">{category.label}</span>
                  <span className="categories-card-count">
                    {toPersianDigits(category.productCount)} محصول
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
