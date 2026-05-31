import type { Metadata } from 'next';
import Link from 'next/link';
import { Card } from '@sadafgold/ui';
import { productApi } from '@/lib/api/product.api';
import { PublicPageShell } from '@/widgets/content/public-page-shell';

export const metadata: Metadata = {
  title: 'دسته‌بندی محصولات | Sadaf Gold',
};

export default async function CategoriesPage() {
  const categories = await productApi.getCatalogCategories();

  return (
    <PublicPageShell
      eyebrow="فروشگاه"
      title="دسته‌بندی‌ها"
      description="مرور دسته‌های محصول از کاتالوگ زنده."
    >
      {!categories.length ? (
        <p className="text-sm text-muted">دسته‌بندی‌ای یافت نشد.</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {categories.map((cat) => (
            <Link key={cat.slug} href={`/categories/${cat.slug}`}>
              <Card className="p-5 text-center transition hover:border-amber-200">
                <p className="font-medium">{cat.label}</p>
                <p className="mt-2 text-xs text-muted">{cat.productCount} محصول</p>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </PublicPageShell>
  );
}
