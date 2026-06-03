import Link from 'next/link';
import { CATEGORY_FALLBACK_IMAGES } from '@/shared/config/images';
import { StoreImage } from '@/shared/ui/store-image';

export function PromoHero() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-nude-50 via-background to-nude-100/50">
      <div
        className="pointer-events-none absolute -left-20 top-0 h-64 w-64 rounded-full bg-rose-nude/20 blur-3xl"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -bottom-10 -right-10 h-72 w-72 rounded-full bg-gold-light/30 blur-3xl"
        aria-hidden
      />

      <div className="container-store relative grid min-h-[360px] items-center gap-8 py-12 lg:grid-cols-2 lg:py-16">
        <div className="space-y-5">
          <span className="badge-gold">کالکشن جدید</span>
          <h1 className="text-3xl font-bold leading-[1.45] text-foreground md:text-[2.5rem]">
            زیبایی ماندگار
            <span className="mt-1 block text-gold-dark">در هر قطعه طلا</span>
          </h1>
          <p className="max-w-md text-sm leading-8 text-muted md:text-base">
            گالری طلای تلاشیم — انگشتر، گوشواره، دستبند و گردنبند با قیمت روز، وزن دقیق و خرید آنلاین
            امن.
          </p>
          <div className="flex flex-wrap gap-3 pt-1">
            <Link href="/products" className="btn-gold px-7 py-3">
              مشاهده فروشگاه
            </Link>
            <Link href="/categories/rings" className="btn-nude px-7 py-3">
              انگشترهای زنانه
            </Link>
          </div>
        </div>

        <div className="relative mx-auto aspect-[4/3] w-full max-w-lg">
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-tr from-gold-light/40 to-transparent" />
          <div className="card-luxury relative h-full overflow-hidden rounded-2xl border-gold-light/40">
            <StoreImage
              src={CATEGORY_FALLBACK_IMAGES.earrings}
              alt="گوشواره طلا"
              fill
              className="object-cover"
              priority
              sizes="(max-width: 1024px) 100vw, 50vw"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-foreground/50 via-transparent to-transparent" />
            <div className="absolute bottom-0 inset-x-0 p-6">
              <p className="text-xs font-medium tracking-widest text-gold-light">NEW</p>
              <p className="mt-1 text-xl font-semibold text-white">گوشواره زنانه</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
