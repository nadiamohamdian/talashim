import { CatalogCategoryFormPanel } from '@/features/catalog/components/catalog-category-form-panel';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function Page({ params }: PageProps) {
  const { id } = await params;
  return <CatalogCategoryFormPanel categoryId={id} />;
}
