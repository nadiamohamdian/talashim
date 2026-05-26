import Image from "next/image";
import { Badge, Button, Card } from "@gold/ui";
import { getProductBySlug } from "@/shared/api/catalog-api";
import { formatPrice } from "@/shared/lib/format-price";

interface ProductDetailsPageProps {
  params: Promise<{ slug: string }>;
}

export default async function ProductDetailsPage({
  params,
}: ProductDetailsPageProps) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_0.9fr]">
      <Card className="relative min-h-[420px] overflow-hidden">
        <Image
          src={product.imageUrl}
          alt={product.title}
          fill
          className="object-cover"
          sizes="(max-width: 1024px) 100vw, 50vw"
        />
      </Card>
      <Card className="p-8">
        <div className="flex items-center gap-3">
          <Badge>{product.karat} عیار</Badge>
          <Badge className="bg-stone-100 text-stone-700">{product.category}</Badge>
        </div>
        <h1 className="mt-4 text-3xl font-bold text-stone-950">{product.title}</h1>
        <p className="mt-4 text-sm leading-7 text-stone-600">{product.description}</p>
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <div className="rounded-2xl bg-stone-50 p-4">
            <p className="text-sm text-stone-500">وزن</p>
            <p className="mt-1 font-semibold text-stone-950">{product.weightGram} گرم</p>
          </div>
          <div className="rounded-2xl bg-stone-50 p-4">
            <p className="text-sm text-stone-500">اجرت</p>
            <p className="mt-1 font-semibold text-stone-950">
              {product.makingFeePercent} درصد
            </p>
          </div>
        </div>
        <div className="mt-8 flex items-center justify-between border-t border-stone-200 pt-6">
          <div>
            <p className="text-sm text-stone-500">قیمت نهایی</p>
            <p className="text-2xl font-bold text-stone-950">
              {formatPrice(product.priceToman)} تومان
            </p>
          </div>
          <Button>افزودن به سبد</Button>
        </div>
      </Card>
    </div>
  );
}
