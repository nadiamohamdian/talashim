import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { resolveCatalogCategorySlug } from '@/shared/lib/catalog-category';

interface CategoryPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  const { slug } = await params;
  return { title: `دسته ${slug}` };
}

/** Legacy /categories/:slug URLs → /products?category=:slug */
export default async function CategoryPage({ params }: CategoryPageProps) {
  const { slug } = await params;
  const category = resolveCatalogCategorySlug(slug);

  if (!category) {
    redirect('/categories');
  }

  redirect(`/products?category=${encodeURIComponent(slug)}`);
}
