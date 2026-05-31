import Link from 'next/link';
import { productApi } from '@/lib/api/product.api';
import { CATEGORY_FALLBACK_IMAGES, DEFAULT_PRODUCT_IMAGE } from '@/shared/config/images';
import { StoreImage } from '@/shared/ui/store-image';

function categoryImage(slug: string): string {
  const key = slug as keyof typeof CATEGORY_FALLBACK_IMAGES;
  return CATEGORY_FALLBACK_IMAGES[key] ?? DEFAULT_PRODUCT_IMAGE;
}

export async function CategoryShowcase() {
  const categories = await productApi.getCatalogCategories();
  const shortcuts = [...categories]
    .sort((a, b) => b.productCount - a.productCount)
    .slice(0, 5)
    .map((cat) => ({
      slug: cat.slug,
      label: cat.label,
      href: `/categories/${cat.slug}`,
      imageUrl: categoryImage(cat.slug),
    }));

  if (!shortcuts.length) {
    return null;
  }

  return (
    <section className="container-store py-10 md:py-14">
      <div className="mb-8 text-center">
        <h2 className="section-heading mx-auto w-fit">خرید بر اساس دسته</h2>
        <p className="mt-3 text-sm text-muted">دسته مورد علاقه‌تان را انتخاب کنید</p>
      </div>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5 lg:gap-6">
        {shortcuts.map((category) => (
          <Link
            key={category.slug}
            href={category.href}
            className="group flex flex-col items-center rounded-2xl border border-nude-200/80 bg-card p-5 text-center shadow-[var(--shadow-soft)] transition hover:border-gold-light hover:shadow-[var(--shadow-hover)]"
          >
            <div className="relative mb-4 h-24 w-24 overflow-hidden rounded-full border-2 border-nude-100 bg-nude-50 p-1 shadow-inner">
              <div className="relative h-full w-full overflow-hidden rounded-full">
                <StoreImage
                  src={category.imageUrl}
                  alt={category.label}
                  fill
                  className="object-cover transition duration-500 group-hover:scale-110"
                  sizes="96px"
                />
              </div>
            </div>
            <h3 className="text-sm font-semibold text-foreground">{category.label}</h3>
            <span className="mt-3 rounded-full bg-nude-50 px-4 py-1.5 text-xs font-medium text-gold-dark transition group-hover:bg-gold-dark group-hover:text-white">
              مشاهده
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}
