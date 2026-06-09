import Link from 'next/link';
import type { CmsHeroConfig } from '@sadafgold/types';
import { RichHtmlContent } from '@/shared/ui/rich-html-content';
import { StoreImage } from '@/shared/ui/store-image';
import { IconHeroArrowDiagonal } from '@/widgets/header/header-menu-icons';

/** Local hero asset — apps/web/public/images/home/hero-mobile-bg.png */
const MOBILE_HERO_IMAGE = '/images/home/hero-mobile-bg.png';

function resolveMobileHeroImage(imageUrl: string): string {
  const trimmed = imageUrl.trim();
  if (trimmed.startsWith('/images/')) {
    return trimmed;
  }
  return MOBILE_HERO_IMAGE;
}

interface PromoHeroProps {
  hero: CmsHeroConfig;
}

export function PromoHero({ hero }: PromoHeroProps) {
  const badge = hero.badge.trim() || 'کالکشن جدید';
  const title = hero.title.trim() || 'گالری طلاشیم';
  const titleAccent = hero.titleAccent.trim();
  const description = hero.description.trim();
  const heroImage = resolveMobileHeroImage(hero.imageUrl);
  const primaryLabel = hero.primaryCta.label.trim() || 'مشاهده کالکشن‌ها';
  const primaryHref = hero.primaryCta.href.trim() || '/products';
  const secondaryHref = hero.secondaryCta.href.trim() || '/categories/rings';
  const imageCaption = title;

  return (
    <>
      {/* Mobile — Figma node 1752:5901 */}
      <section className="promo-hero-mobile lg:hidden" aria-label="معرفی فروشگاه">
        <StoreImage
          src={heroImage}
          alt=""
          fill
          priority
          sizes="100vw"
          className="promo-hero-mobile-bg"
        />
        <div className="promo-hero-mobile-overlay" aria-hidden />

        <div className="promo-hero-mobile-content">
          <h1 className="promo-hero-mobile-title">{title}</h1>
          {description ? (
            <RichHtmlContent
              html={description}
              className="promo-hero-mobile-description [&_p]:mb-0"
            />
          ) : null}

          <div className="promo-hero-mobile-actions">
            <Link href={primaryHref} className="promo-hero-mobile-cta-primary">
              {primaryLabel}
            </Link>
            <Link
              href={secondaryHref}
              className="promo-hero-mobile-cta-icon"
              aria-label={hero.secondaryCta.label.trim() || 'مشاهده بیشتر'}
            >
              <IconHeroArrowDiagonal className="promo-hero-mobile-cta-icon-svg" />
            </Link>
          </div>
        </div>
      </section>

      {/* Desktop — existing layout */}
      <section className="relative hidden overflow-hidden bg-gradient-to-br from-nude-50 via-background to-nude-100/50 lg:block">
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
            <span className="badge-gold">{badge}</span>
            <h1 className="text-3xl font-bold leading-[1.45] text-foreground md:text-[2.5rem]">
              {title}
              {titleAccent ? (
                <span className="mt-1 block text-gold-dark">{titleAccent}</span>
              ) : null}
            </h1>
            {description ? (
              <RichHtmlContent
                html={description}
                className="max-w-md text-sm leading-8 text-muted md:text-base [&_p]:mb-0"
              />
            ) : null}
            <div className="flex flex-wrap gap-3 pt-1">
              <Link href={primaryHref} className="btn-gold px-7 py-3">
                {primaryLabel}
              </Link>
              {hero.secondaryCta.label.trim() ? (
                <Link href={secondaryHref} className="btn-nude px-7 py-3">
                  {hero.secondaryCta.label.trim()}
                </Link>
              ) : null}
            </div>
          </div>

          <div className="relative mx-auto aspect-[4/3] w-full max-w-lg">
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-tr from-gold-light/40 to-transparent" />
            <div className="card-luxury relative h-full overflow-hidden rounded-2xl border-gold-light/40">
              {heroImage ? (
                <StoreImage
                  src={heroImage}
                  alt={imageCaption}
                  fill
                  className="object-cover"
                  priority
                  sizes="(max-width: 1024px) 100vw, 50vw"
                />
              ) : (
                <div className="absolute inset-0 bg-gradient-to-br from-nude-100 via-gold-light/30 to-nude-200" />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-foreground/50 via-transparent to-transparent" />
              <div className="absolute bottom-0 inset-x-0 p-6">
                <p className="text-xs font-medium tracking-widest text-gold-light">NEW</p>
                <p className="mt-1 text-xl font-semibold text-white">{imageCaption}</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
