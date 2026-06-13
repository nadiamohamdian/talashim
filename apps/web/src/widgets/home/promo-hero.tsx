import Link from 'next/link';
import type { CmsHeroConfig } from '@sadafgold/types';
import {
  CMS_HERO_STATIC_FALLBACK,
  getDefaultHeroImageUrl,
} from '@/shared/config/cms-hero';
import {
  HOME_HERO_DESKTOP_BG,
  HOME_HERO_DESKTOP_CAROUSEL,
} from '@/shared/config/storefront-ia';
import { RichHtmlContent } from '@/shared/ui/rich-html-content';
import { StoreImage } from '@/shared/ui/store-image';
import { IconHeroArrowDiagonal } from '@/widgets/header/header-menu-icons';
import { PromoHeroDesktopCarousel } from '@/widgets/home/promo-hero-desktop-carousel';

function resolveHeroImage(imageUrl: string): string {
  const trimmed = imageUrl.trim();
  return trimmed || getDefaultHeroImageUrl();
}

interface PromoHeroProps {
  hero: CmsHeroConfig;
}

export function PromoHero({ hero }: PromoHeroProps) {
  const title = hero.title.trim() || 'زیبایی ماندگار';
  const desktopTitle = title === 'زیبایی ماندگار' ? 'گالری طلاشیم' : title;
  const description = hero.description.trim();
  const heroImage = resolveHeroImage(hero.imageUrl);
  const primaryLabel = hero.primaryCta.label.trim() || 'مشاهده کالکشن ها';
  const primaryHref = hero.primaryCta.href.trim() || '/products';
  const secondaryHref = hero.secondaryCta.href.trim() || '/products?category=rings';

  return (
    <>
      {/* Mobile — Figma node 1752:5901 */}
      <section className="promo-hero-mobile lg:hidden" aria-label="معرفی فروشگاه">
        <StoreImage
          src={heroImage}
          alt=""
          fill
          priority
          unoptimized
          sizes="100vw"
          fallbackSrc={CMS_HERO_STATIC_FALLBACK}
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

      {/* Desktop — Figma node 1919:7602 */}
      <section className="promo-hero-desktop hidden lg:block" aria-label="معرفی فروشگاه">
        <div className="promo-hero-desktop-bg" aria-hidden>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={HOME_HERO_DESKTOP_BG}
            alt=""
            className="promo-hero-desktop-bg-image"
            decoding="async"
          />
          <span className="promo-hero-desktop-bg-scrim" />
        </div>

        <div className="promo-hero-desktop-panel">
          <h1 className="promo-hero-desktop-title">{desktopTitle}</h1>
          {description ? (
            <RichHtmlContent
              html={description}
              className="promo-hero-desktop-description [&_p]:mb-0"
            />
          ) : (
            <p className="promo-hero-desktop-description">
              لورم ایپسوم متن ساختگی با تولید سادگی نامفهوم از صنعت چاپ نامفهوم
            </p>
          )}

          <Link href={primaryHref} className="promo-hero-desktop-cta">
            {primaryLabel}
          </Link>

          <PromoHeroDesktopCarousel items={HOME_HERO_DESKTOP_CAROUSEL} />
        </div>
      </section>
    </>
  );
}
