import Link from 'next/link';
import { Badge, Card } from '@sadafgold/ui';
import type { ProductSummary } from '@sadafgold/types';
import { formatPrice } from '@/shared/lib/format-price';
import { StoreImage } from '@/shared/ui/store-image';

interface FeaturedProductsProps {
  products: ProductSummary[];
}

export function FeaturedProducts({ products }: FeaturedProductsProps) {
  return (
    <section className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Badge>منتخب هفته</Badge>
          <h2 className="mt-3 text-2xl font-bold text-stone-950">محصولات ویژه</h2>
        </div>
        <p className="text-sm text-stone-500">{products.length} محصول منتخب</p>
      </div>
      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {products.map((product) => (
          <Link key={product.id} href={`/products/${product.slug}`}>
            <Card className="h-full overflow-hidden transition hover:-translate-y-1 hover:shadow-lg">
              <div className="relative aspect-[4/3] bg-stone-100">
                <StoreImage
                  src={product.imageUrl}
                  alt={product.title}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 33vw"
                />
              </div>
              <div className="space-y-3 p-5">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-stone-950">{product.title}</h3>
                  <Badge className="bg-stone-100 text-stone-700">{product.karat} عیار</Badge>
                </div>
                <p className="text-sm text-stone-500">
                  وزن {product.weightGram} گرم، اجرت {product.makingFeePercent} درصد
                </p>
                <div className="flex items-center justify-between">
                  <p className="text-lg font-bold text-stone-950">
                    {formatPrice(product.priceToman)} تومان
                  </p>
                  <p className="text-sm text-emerald-700">موجودی: {product.inventory}</p>
                </div>
              </div>
            </Card>
          </Link>
        ))}
      </div>
    </section>
  );
}
