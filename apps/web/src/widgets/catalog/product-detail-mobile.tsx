'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import type { ProductVariant } from '@sadafgold/types';
import { applyLivePricingToProduct } from '@sadafgold/shared';
import { AddToCartButton } from '@/features/cart/components/add-to-cart-button';
import { ProductDetailVideoIcon } from '@/features/cart/components/product-detail-video-icon';
import { useDynamicProductPrice } from '@/features/catalog/hooks/use-dynamic-product-price';
import { useMarketPrices } from '@/lib/api/hooks/use-market-prices';
import { formatPrice } from '@/shared/lib/format-price';
import {
  DEFAULT_RELATED_PRODUCTS,
  type ProductDetailMobileProps,
} from '@/shared/config/product-detail-demo';
import { ProductReviewWizard } from '@/features/catalog/components/product-review-wizard';
import { ProductVideoModal } from '@/features/catalog/components/product-video-modal';
import { ProductReviewsShowcase } from '@/widgets/catalog/product-reviews-showcase';
import { ProductDetailScrollArrow } from '@/widgets/catalog/product-detail-scroll-arrow';
import { buildBraceletSizeGuideHref } from '@/shared/config/bracelet-size-guide';
import { buildNecklaceSizeGuideHref } from '@/shared/config/necklace-size-guide';
import { buildRingSizeGuideHref } from '@/shared/config/ring-size-guide';
import { toPersianDigits } from '@/shared/lib/to-persian-digits';
import { findMatchingVariant, resolvePdpSections } from '@/shared/lib/resolve-product-pdp-config';
import { ProductSizeRulerSection } from '@/widgets/catalog/product-size-ruler-section';
import { StoreImage } from '@/shared/ui/store-image';
import {
  applyVariantToProduct,
  resolveDefaultVariant,
} from '@/widgets/catalog/product-variant-selector';

export type { ProductDetailMobileProps };

const DEFAULT_RING_SIZES = [48, 49, 50, 52, 53, 54, 55, 56, 57, 58, 59, 60, 61, 62, 63, 65, 66];
const DEFAULT_NECKLACE_SIZES = [40, 45, 50, 55, 60, 65, 70, 80];
const DEFAULT_BRACELET_SIZES = [16, 17, 18, 19, 20, 21];

function pickDefaultSize(sizes: number[], preferred: number): number {
  if (sizes.length === 0) {
    return preferred;
  }
  if (sizes.includes(preferred)) {
    return preferred;
  }
  return sizes[Math.floor(sizes.length / 2)] ?? sizes[0] ?? preferred;
}

const RELATED_PRODUCTS_DESKTOP_LIMIT = 7;

const PRICE_TOOLTIP_TEXT =
  'وزن طلا × (قیمت روز طلا + اجرت) + ۷٪ سود + متعلقات + ۱۰٪ مالیات از سود و اجرت';

export function ProductDetailMobile({
  product,
  gallery,
  heroImageUrl,
  cardImageUrl,
  displayPriceToman,
  ringSizes,
  necklaceSizes,
  braceletSizes,
  goldColors,
  stoneSwatches,
  specRows = [],
  featuredReview,
  relatedProducts = [],
  videos = [],
  reviews = [],
}: ProductDetailMobileProps) {
  const relatedTrackRef = useRef<HTMLDivElement | null>(null);
  const images = gallery?.length ? gallery : [heroImageUrl ?? product.imageUrl];
  const heroBackgroundSrc = heroImageUrl ?? images[0] ?? product.imageUrl;
  const [activeProductSlide, setActiveProductSlide] = useState(0);
  const [activeMobileSlide, setActiveMobileSlide] = useState(() =>
    images.length >= 5 ? 4 : 0,
  );
  const [selectedRingSize, setSelectedRingSize] = useState(57);
  const [selectedNecklaceSize, setSelectedNecklaceSize] = useState(
    () => necklaceSizes?.[2] ?? necklaceSizes?.[0] ?? 45,
  );
  const [selectedBraceletSize, setSelectedBraceletSize] = useState(
    () => braceletSizes?.[2] ?? braceletSizes?.[0] ?? 18,
  );
  const [selectedGold, setSelectedGold] = useState(() => goldColors?.[0] ?? '');
  const [selectedStone, setSelectedStone] = useState(() => stoneSwatches?.[0]?.id ?? '');
  const [priceTooltipOpen, setPriceTooltipOpen] = useState(false);
  const [reviewWizardOpen, setReviewWizardOpen] = useState(false);
  const [videoModalOpen, setVideoModalOpen] = useState(false);

  const primaryVideo = useMemo(() => {
    const sorted = [...videos]
      .filter((item) => item.videoUrl.trim().length > 0)
      .sort((a, b) => a.sortOrder - b.sortOrder);
    return sorted[0] ?? null;
  }, [videos]);

  const variants = product.variants ?? [];

  const productSlideImages = useMemo(() => {
    const urls = [
      cardImageUrl,
      product.imageUrl,
      ...variants.map((variant) => variant.imageUrl),
      ...images.filter((url) => url !== heroBackgroundSrc),
    ].filter((url): url is string => typeof url === 'string' && url.length > 0);

    const unique = [...new Set(urls)];
    return unique.length > 0 ? unique : [heroBackgroundSrc];
  }, [cardImageUrl, heroBackgroundSrc, images, product.imageUrl, variants]);

  useEffect(() => {
    setActiveProductSlide((index) => {
      if (productSlideImages.length === 0) {
        return 0;
      }
      return Math.min(index, productSlideImages.length - 1);
    });
  }, [productSlideImages.length]);

  const pdpSections = useMemo(() => resolvePdpSections(product), [product]);
  const effectiveRingSizes = ringSizes?.length ? ringSizes : pdpSections.ringSizes;
  const effectiveNecklaceSizes = necklaceSizes?.length ? necklaceSizes : pdpSections.necklaceSizes;
  const effectiveBraceletSizes = braceletSizes?.length ? braceletSizes : pdpSections.braceletSizes;

  const showRingSize = Boolean(effectiveRingSizes && effectiveRingSizes.length > 0);
  const showNecklaceSize = Boolean(effectiveNecklaceSizes && effectiveNecklaceSizes.length > 0);
  const showBraceletSize = Boolean(effectiveBraceletSizes && effectiveBraceletSizes.length > 0);
  const showGoldSection = Boolean(
    (goldColors?.length ? goldColors : pdpSections.goldColors)?.length,
  );
  const showStoneSection = Boolean(
    (stoneSwatches?.length ? stoneSwatches : pdpSections.stoneSwatches)?.length,
  );
  const activeGoldColors = goldColors?.length ? goldColors : pdpSections.goldColors;
  const activeStoneSwatches = stoneSwatches?.length ? stoneSwatches : pdpSections.stoneSwatches;
  const ringSizeOptions = effectiveRingSizes ?? DEFAULT_RING_SIZES;
  const necklaceSizeOptions = effectiveNecklaceSizes ?? DEFAULT_NECKLACE_SIZES;
  const braceletSizeOptions = effectiveBraceletSizes ?? DEFAULT_BRACELET_SIZES;

  useEffect(() => {
    if (activeGoldColors?.length) {
      setSelectedGold((current) =>
        activeGoldColors.includes(current) ? current : activeGoldColors[0]!,
      );
    }
  }, [activeGoldColors]);

  useEffect(() => {
    if (activeStoneSwatches?.length) {
      setSelectedStone((current) =>
        activeStoneSwatches.some((swatch) => swatch.id === current)
          ? current
          : activeStoneSwatches[0]!.id,
      );
    }
  }, [activeStoneSwatches]);

  useEffect(() => {
    setSelectedRingSize((current) =>
      ringSizeOptions.includes(current) ? current : pickDefaultSize(ringSizeOptions, 57),
    );
  }, [ringSizeOptions]);

  useEffect(() => {
    setSelectedNecklaceSize((current) =>
      necklaceSizeOptions.includes(current)
        ? current
        : pickDefaultSize(necklaceSizeOptions, 45),
    );
  }, [necklaceSizeOptions]);

  useEffect(() => {
    setSelectedBraceletSize((current) =>
      braceletSizeOptions.includes(current)
        ? current
        : pickDefaultSize(braceletSizeOptions, 18),
    );
  }, [braceletSizeOptions]);

  const activeSize = useMemo(() => {
    if (showRingSize) {
      return String(selectedRingSize);
    }
    if (showNecklaceSize) {
      return String(selectedNecklaceSize);
    }
    if (showBraceletSize) {
      return String(selectedBraceletSize);
    }
    return undefined;
  }, [
    showBraceletSize,
    showNecklaceSize,
    showRingSize,
    selectedBraceletSize,
    selectedNecklaceSize,
    selectedRingSize,
  ]);

  const selectedVariant = useMemo((): ProductVariant | null => {
    if (variants.length === 0) {
      return null;
    }

    const matched = findMatchingVariant(variants, {
      goldColor: showGoldSection ? selectedGold : undefined,
      size: activeSize,
      stone: showStoneSection ? selectedStone : undefined,
    });

    return matched ?? resolveDefaultVariant(variants);
  }, [
    activeSize,
    selectedGold,
    selectedStone,
    showGoldSection,
    showStoneSection,
    variants,
  ]);

  const { data: liveQuote } = useMarketPrices({ karat: product.karat });

  const resolveEffectivePriceToman = (variant: ProductVariant | null): number => {
    const merged = applyVariantToProduct(product, variant);
    const livePerGram = Number(liveQuote?.pricePerGram ?? 0);
    if (Number.isFinite(livePerGram) && livePerGram > 0) {
      return applyLivePricingToProduct(merged, livePerGram).priceToman;
    }
    return merged.priceToman;
  };

  const stonePriceDeltas = useMemo(() => {
    if (!showStoneSection || !stoneSwatches?.length) {
      return {} as Record<string, number | null>;
    }

    const selection = {
      goldColor: showGoldSection ? selectedGold : undefined,
      size: activeSize,
    };
    const basePrice = resolveEffectivePriceToman(selectedVariant);
    const deltas: Record<string, number | null> = {};

    for (const swatch of stoneSwatches) {
      const variant = findMatchingVariant(variants, { ...selection, stone: swatch.id });
      if (!variant) {
        deltas[swatch.id] = null;
        continue;
      }
      const delta = resolveEffectivePriceToman(variant) - basePrice;
      deltas[swatch.id] = delta === 0 ? null : delta;
    }

    return deltas;
  }, [
    activeSize,
    liveQuote?.pricePerGram,
    product,
    selectedGold,
    selectedVariant,
    showGoldSection,
    showStoneSection,
    stoneSwatches,
    variants,
  ]);

  const variantProduct = useMemo(
    () => applyVariantToProduct(product, selectedVariant),
    [product, selectedVariant],
  );
  const pricedProduct = useDynamicProductPrice(variantProduct);
  const priceToman = displayPriceToman ?? pricedProduct.priceToman;
  const displayWeightGram = pricedProduct.weightGram;
  const displayInventory = selectedVariant ? selectedVariant.quantity : product.inventory;
  const mobileHeroSrc = images[activeMobileSlide % images.length] ?? heroBackgroundSrc;
  const glassProductSrc =
    productSlideImages[activeProductSlide % productSlideImages.length] ??
    cardImageUrl ??
    product.imageUrl ??
    heroBackgroundSrc;
  const relatedItems = useMemo(() => {
    const items = relatedProducts.length > 0 ? relatedProducts : DEFAULT_RELATED_PRODUCTS;
    return items.slice(0, RELATED_PRODUCTS_DESKTOP_LIMIT);
  }, [relatedProducts]);

  const goToPrevImage = () => {
    setActiveProductSlide(
      (index) => (index - 1 + productSlideImages.length) % productSlideImages.length,
    );
  };

  const goToNextImage = () => {
    setActiveProductSlide((index) => (index + 1) % productSlideImages.length);
  };

  const scrollRelatedProducts = (direction: 'prev' | 'next') => {
    const track = relatedTrackRef.current;
    if (!track) {
      return;
    }

    const delta = Math.max(track.clientWidth * 0.82, 260);
    track.scrollBy({
      left: direction === 'prev' ? -delta : delta,
      behavior: 'smooth',
    });
  };

  const specs = useMemo(() => {
    const rows =
      specRows.length > 0
        ? specRows
        : Object.entries(product.specifications ?? {}).map(([label, value]) => ({
            label,
            value,
          }));

    if (!selectedVariant?.weightGram) {
      return rows;
    }

    const variantWeight = `${toPersianDigits(selectedVariant.weightGram)} گرم`;
    return rows.map((row) => (row.label === 'وزن' ? { ...row, value: variantWeight } : row));
  }, [product.specifications, selectedVariant?.weightGram, specRows]);

  return (
    <article className="product-details">
      <section className="product-details-hero" aria-label="تصاویر محصول">
        <div className="product-details-hero-stage" aria-hidden>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={heroBackgroundSrc} alt="" className="product-details-hero-lifestyle-blur" />
          <div className="product-details-hero-focus-zone">
            <div className="product-details-hero-focus-brackets" />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={heroBackgroundSrc} alt="" className="product-details-hero-lifestyle-sharp" />
          </div>
        </div>

        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={mobileHeroSrc} alt={product.title} className="product-details-hero-image" />

        <div className="product-details-hero-ui">
          <div className="product-details-glass">
            <div className="product-details-glass-media" aria-hidden>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={glassProductSrc}
                alt=""
                className="product-details-glass-product-image"
              />
            </div>

            <div className="product-details-glass-content">
              <h1 className="product-details-glass-title">{product.title}</h1>

              <div className="product-details-glass-row">
                <span className="product-details-glass-row-label">قیمت</span>
                <span className="product-details-glass-row-value">
                  {formatPrice(priceToman)} تومان
                </span>
              </div>

              <div className="product-details-glass-row">
                <span className="product-details-glass-row-label">وزن</span>
                <span className="product-details-glass-row-value">
                  {toPersianDigits(displayWeightGram)} گرم (طلای {toPersianDigits(product.karat)} عیار)
                </span>
              </div>
            </div>

            <hr className="product-details-glass-divider" />

            <div className="product-details-glass-actions">
              <button
                type="button"
                className="product-details-action product-details-action-video"
                disabled={!primaryVideo}
                aria-disabled={!primaryVideo}
                onClick={() => {
                  if (primaryVideo) {
                    setVideoModalOpen(true);
                  }
                }}
              >
                <span className="product-details-action-video-label">مشاهده ویدئو محصول</span>
                <ProductDetailVideoIcon />
              </button>
              <AddToCartButton
                productId={product.id}
                slug={product.slug}
                title={product.title}
                priceToman={priceToman}
                imageUrl={selectedVariant?.imageUrl ?? product.imageUrl}
                weightGram={displayWeightGram}
                quantity={1}
                disabled={displayInventory <= 0}
                variant="product-detail"
                className="product-details-action product-details-action-cart"
                label="افزودن به سبد خرید"
                addedLabel="به سبد اضافه شد"
              />
            </div>
          </div>

          <nav className="product-details-hero-nav" aria-label="اسلایدهای محصول">
            <button
              type="button"
              className="product-details-hero-nav-btn"
              onClick={goToPrevImage}
              aria-label="اسلاید قبلی"
            >
              <span className="product-details-hero-nav-icon product-details-hero-nav-icon--prev" />
            </button>
            <span className="product-details-hero-nav-index">
              {toPersianDigits(
                String((activeProductSlide % productSlideImages.length) + 1).padStart(2, '0'),
              )}
            </span>
            <button
              type="button"
              className="product-details-hero-nav-btn"
              onClick={goToNextImage}
              aria-label="اسلاید بعدی"
            >
              <span className="product-details-hero-nav-icon product-details-hero-nav-icon--next" />
            </button>
          </nav>

          <div className="product-details-dots" role="tablist" aria-label="اسلایدهای محصول">
            {images.map((_, index) => (
              <button
                key={index}
                type="button"
                role="tab"
                aria-selected={index === activeMobileSlide}
                className={
                  index === activeMobileSlide ? 'product-details-dot is-active' : 'product-details-dot'
                }
                onClick={() => setActiveMobileSlide(index)}
                aria-label={`اسلاید ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </section>

      <div className="product-details-body">
        {showRingSize ? (
          <ProductSizeRulerSection
            id="pdp-ring-size-title"
            title="انتخاب سایز انگشتر"
            guideHref={buildRingSizeGuideHref(`/products/${product.slug}`)}
            sizes={ringSizeOptions}
            selectedSize={selectedRingSize}
            onSelectSize={setSelectedRingSize}
            className="product-details-section product-details-section-size"
          />
        ) : null}

        {showNecklaceSize ? (
          <ProductSizeRulerSection
            id="pdp-necklace-size-title"
            title="انتخاب سایز گردنبند"
            guideHref={buildNecklaceSizeGuideHref(`/products/${product.slug}`)}
            sizes={necklaceSizeOptions}
            selectedSize={selectedNecklaceSize}
            onSelectSize={setSelectedNecklaceSize}
            className="product-details-section product-details-section-size product-details-section-necklace"
          />
        ) : null}

        {showBraceletSize ? (
          <ProductSizeRulerSection
            id="pdp-bracelet-size-title"
            title="انتخاب سایز دستبند"
            guideHref={buildBraceletSizeGuideHref(`/products/${product.slug}`)}
            sizes={braceletSizeOptions}
            selectedSize={selectedBraceletSize}
            onSelectSize={setSelectedBraceletSize}
            className="product-details-section product-details-section-size product-details-section-bracelet"
          />
        ) : null}

        {(showGoldSection || showStoneSection) ? (
        <div className="product-details-gold-stone-row">
        {showGoldSection ? (
        <section
          className="product-details-section product-details-section-gold"
          aria-labelledby="pdp-gold-title"
        >
          <h2 id="pdp-gold-title" className="product-details-section-title">
            انتخاب رنگ طلا
          </h2>
          <div className="product-details-options">
            {activeGoldColors!.map((color) => (
              <button
                key={color}
                type="button"
                className={
                  selectedGold === color
                    ? 'product-details-option is-active'
                    : 'product-details-option'
                }
                onClick={() => setSelectedGold(color)}
              >
                {color}
              </button>
            ))}
          </div>
        </section>
        ) : null}

        {showStoneSection ? (
        <section
          className="product-details-section product-details-section-stone"
          aria-labelledby="pdp-stone-title"
        >
          <h2 id="pdp-stone-title" className="product-details-section-title">
            انتخاب رنگ سنگ
          </h2>
          <div className="product-details-stone-swatches">
            {activeStoneSwatches!.map((swatch) => {
              const priceDelta = stonePriceDeltas[swatch.id];
              return (
                <div key={swatch.id} className="product-details-stone-swatch-item">
                  <button
                    type="button"
                    className={
                      selectedStone === swatch.id
                        ? 'product-details-stone-swatch is-active'
                        : 'product-details-stone-swatch'
                    }
                    style={{ backgroundColor: swatch.color }}
                    aria-label={swatch.label}
                    aria-pressed={selectedStone === swatch.id}
                    onClick={() => setSelectedStone(swatch.id)}
                  />
                  {priceDelta != null ? (
                    <span
                      className={`product-details-stone-price-delta${
                        priceDelta > 0 ? ' is-positive' : priceDelta < 0 ? ' is-negative' : ''
                      }`}
                    >
                      {priceDelta > 0 ? '+' : '−'} {formatPrice(Math.abs(priceDelta))}
                    </span>
                  ) : null}
                </div>
              );
            })}
          </div>
        </section>
        ) : null}
        </div>
        ) : null}

        <div className="product-details-specs-review-row">
          <div className="product-details-section-head product-details-specs-review-head">
            <h2 id="pdp-specs-title" className="product-details-section-title">
              مشخصات
            </h2>
            <div className="product-details-price-tooltip-wrap">
              <button
                type="button"
                className="product-details-link"
                aria-expanded={priceTooltipOpen}
                onClick={() => setPriceTooltipOpen((open) => !open)}
              >
                نحوه محاسبه قیمت
              </button>
              {priceTooltipOpen ? (
                <div className="product-details-price-tooltip" role="tooltip">
                  {PRICE_TOOLTIP_TEXT}
                </div>
              ) : null}
            </div>
          </div>

          <section
            className="product-details-section product-details-specs-section product-details-specs-table-wrap"
            aria-labelledby="pdp-specs-title"
          >
            <table className="product-details-specs-table">
              <tbody>
                {specs.map((row) => (
                  <tr key={row.label} className="product-details-spec-row">
                    <th scope="row" className="product-details-spec-label">
                      {row.label}
                    </th>
                    <td className="product-details-spec-value">{row.value}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>

          <ProductReviewsShowcase
            productSlug={product.slug}
            seedReviews={reviews}
            featuredReview={featuredReview}
            onSubmitReview={() => setReviewWizardOpen(true)}
          />
        </div>

        <section className="product-details-related" aria-labelledby="pdp-related-title">
          <div className="product-details-related-header">
            <div className="product-details-related-heading">
              <span className="product-details-related-watermark" aria-hidden>
                Related Products
              </span>
              <h2 id="pdp-related-title" className="product-details-related-title">
                محصولات مشابه
              </h2>
            </div>
            <div className="product-details-related-controls" aria-label="ناوبری محصولات مشابه">
              <button
                type="button"
                className="product-details-related-scroll-btn"
                onClick={() => scrollRelatedProducts('prev')}
                aria-label="اسکرول به محصول قبلی"
              >
                <ProductDetailScrollArrow direction="prev" />
              </button>
              <button
                type="button"
                className="product-details-related-scroll-btn"
                onClick={() => scrollRelatedProducts('next')}
                aria-label="اسکرول به محصول بعدی"
              >
                <ProductDetailScrollArrow direction="next" />
              </button>
            </div>
          </div>

          <div ref={relatedTrackRef} className="product-details-related-track" role="list">
            {relatedItems.map((item) => (
              <article key={item.id} className="product-details-related-card" role="listitem">
                <Link href={item.href ?? '/products'} className="product-details-related-link">
                  <div className="product-details-related-media">
                    <StoreImage
                      src={item.imageUrl}
                      alt={item.title}
                      fill
                      className="product-details-related-image"
                        sizes="42vw"
                    />
                  </div>
                  <h3 className="product-details-related-name">{item.title}</h3>
                  <p className="product-details-related-price">
                    {formatPrice(item.priceToman)} تومان
                  </p>
                  <p className="product-details-related-weight">
                    {toPersianDigits(item.weightGram)} گرم
                  </p>
                </Link>
              </article>
            ))}
          </div>
        </section>
      </div>

      <ProductReviewWizard
        open={reviewWizardOpen}
        productSlug={product.slug}
        onClose={() => setReviewWizardOpen(false)}
      />

      <ProductVideoModal
        open={videoModalOpen}
        video={primaryVideo}
        videos={videos}
        relatedProducts={relatedItems}
        onClose={() => setVideoModalOpen(false)}
      />
    </article>
  );
}
