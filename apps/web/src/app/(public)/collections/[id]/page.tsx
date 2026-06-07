import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getPublicCollection } from '@/lib/api/cms.api';
import { withLivePricingList } from '@/shared/lib/live-gold-pricing';
import { StoreImage } from '@/shared/ui/store-image';
import { ProductCard } from '@/widgets/catalog/product-card';

interface CollectionPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: CollectionPageProps): Promise<Metadata> {
  const { id } = await params;
  const collection = await getPublicCollection(id);

  if (!collection) {
    return { title: 'کالکشن یافت نشد' };
  }

  return {
    title: collection.title,
    description: collection.subtitle ?? `مشاهده ${collection.products.length} محصول انتخاب‌شده`,
  };
}

export default async function CollectionPage({ params }: CollectionPageProps) {
  const { id } = await params;
  const collection = await getPublicCollection(id);

  if (!collection) {
    notFound();
  }

  const products = await withLivePricingList(collection.products);

  return (
    <div className="space-y-8">
      <section className="overflow-hidden rounded-2xl border border-nude-200 bg-gradient-to-l from-nude-50 to-card">
        <div className="grid gap-0 md:grid-cols-[1.2fr_1fr]">
          <div className="relative aspect-[16/9] min-h-[220px] md:aspect-auto md:min-h-[280px]">
            <StoreImage
              src={collection.imageUrl}
              alt={collection.title}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 50vw"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-l from-foreground/55 via-foreground/15 to-transparent" />
          </div>
          <div className="flex flex-col justify-center p-6 md:p-8">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gold">کالکشن</p>
            <h1 className="mt-3 section-heading">{collection.title}</h1>
            {collection.subtitle ? (
              <p className="mt-3 text-sm leading-7 text-muted">{collection.subtitle}</p>
            ) : null}
            <p className="mt-4 text-sm text-muted">{products.length} محصول</p>
          </div>
        </div>
      </section>

      {!products.length ? (
        <p className="text-sm text-muted">در حال حاضر محصولی برای این کالکشن موجود نیست.</p>
      ) : (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 md:gap-5 lg:grid-cols-4">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}
