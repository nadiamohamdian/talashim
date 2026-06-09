import type { Metadata } from 'next';
import { productApi } from '@/lib/api/product.api';
import {
  CATEGORIES_PAGE_DEMO,
  CATEGORIES_PAGE_META,
} from '@/shared/config/categories-page';
import { CategoriesPageView } from '@/widgets/catalog/categories-page-view';

export const metadata: Metadata = {
  title: CATEGORIES_PAGE_META.title,
  description: CATEGORIES_PAGE_META.description,
};

export default async function CategoriesPage() {
  let categories = CATEGORIES_PAGE_DEMO;

  try {
    const liveCategories = await productApi.getCatalogCategories();
    if (liveCategories.length > 0) {
      categories = liveCategories;
    }
  } catch {
    categories = CATEGORIES_PAGE_DEMO;
  }

  return <CategoriesPageView categories={categories} />;
}
