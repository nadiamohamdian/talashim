'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { AddToCartButton } from '@/features/cart/components/add-to-cart-button';
import { ProductDetailVideoIcon } from '@/features/cart/components/product-detail-video-icon';
import { formatPrice } from '@/shared/lib/format-price';
import {
  DEFAULT_RELATED_PRODUCTS,
  type ProductDetailMobileProps,
  type StoneColorSwatch,
} from '@/shared/config/product-detail-demo';
import { ProductReviewWizard } from '@/features/catalog/components/product-review-wizard';
import { ProductVideoModal } from '@/features/catalog/components/product-video-modal';
import { ProductReviewsShowcase } from '@/widgets/catalog/product-reviews-showcase';
import { buildBraceletSizeGuideHref } from '@/shared/config/bracelet-size-guide';
import { buildNecklaceSizeGuideHref } from '@/shared/config/necklace-size-guide';
import { buildRingSizeGuideHref } from '@/shared/config/ring-size-guide';
import { toPersianDigits } from '@/shared/lib/to-persian-digits';
import { resolveProductJewelrySizeKinds } from '@/shared/lib/catalog-category';
import { ProductSizeRulerSection } from '@/widgets/catalog/product-size-ruler-section';
import { StoreImage } from '@/shared/ui/store-image';

export type { ProductDetailMobileProps };

const DEFAULT_RING_SIZES = [50, 51, 52, 53, 54, 55, 56, 57, 58, 59, 60, 61, 62, 63];
const DEFAULT_NECKLACE_SIZES = [40, 42, 45, 48, 50, 55];
const DEFAULT_BRACELET_SIZES = [16, 17, 18, 19, 20, 21];

function pickDefaultSize(sizes: number[], preferred: number): number {
  if (sizes.length === 0) {
    return preferred;
  }
  if (sizes.includes(preferred)) {
    return preferred;
  }
  return sizes[Math.floor(sizes.length / 2)] ?? sizes[0];
}

const DEFAULT_STONE_SWATCHES: StoneColorSwatch[] = [
  { id: 'pink', color: '#F2D4D9', label: 'صورتی' },
  { id: 'purple', color: '#D8CCE8', label: 'بنفش' },
  { id: 'blue', color: '#C8D9ED', label: 'آبی' },
  { id: 'gray', color: '#D9D9D9', label: 'خاکستری' },
];

const RELATED_PRODUCTS_DESKTOP_LIMIT = 4;

const PRICE_TOOLTIP_TEXT =
  'وزن طلا × (قیمت روز طلا + اجرت) + ۷٪ سود + متعلقات + ۱۰٪ مالیات از سود و اجرت';

export function ProductDetailMobile({
  product,
  gallery,
  heroImageUrl,
  displayPriceToman,
  ringSizes,
  necklaceSizes,
  braceletSizes,
  goldColors = ['طلایی', 'رزگلد', 'سفید'],
  stoneSwatches = DEFAULT_STONE_SWATCHES,
  specRows = [],
  featuredReview,
  relatedProducts = [],
  videos = [],
  reviews = [],
}: ProductDetailMobileProps) {
  const images = gallery?.length ? gallery : [heroImageUrl ?? product.imageUrl];
  const [activeImage, setActiveImage] = useState(() =>
    images.length >= 5 ? 4 : 0,
  );
  const [selectedRingSize, setSelectedRingSize] = useState(57);
  const [selectedNecklaceSize, setSelectedNecklaceSize] = useState(
    () => necklaceSizes?.[2] ?? necklaceSizes?.[0] ?? 45,
  );
  const [selectedBraceletSize, setSelectedBraceletSize] = useState(
    () => braceletSizes?.[2] ?? braceletSizes?.[0] ?? 18,
  );
  const [selectedGold, setSelectedGold] = useState('طلایی');
  const [selectedStone, setSelectedStone] = useState('purple');
  const [priceTooltipOpen, setPriceTooltipOpen] = useState(false);
  const [reviewWizardOpen, setReviewWizardOpen] = useState(false);
  const [videoModalOpen, setVideoModalOpen] = useState(false);

  const primaryVideo = useMemo(() => {
    const sorted = [...videos]
      .filter((item) => item.videoUrl.trim().length > 0)
      .sort((a, b) => a.sortOrder - b.sortOrder);
    return sorted[0] ?? null;
  }, [videos]);

  const sizeKinds = useMemo(
    () =>
      resolveProductJewelrySizeKinds({
        title: product.title,
        slug: product.slug,
        category: product.category,
        description: product.description,
        specifications: product.specifications,
      }),
    [product.category, product.description, product.slug, product.specifications, product.title],
  );
  const showRingSize = sizeKinds.includes('ring');
  const showNecklaceSize = sizeKinds.includes('necklace');
  const showBraceletSize = sizeKinds.includes('bracelet');
  const ringSizeOptions = ringSizes ?? DEFAULT_RING_SIZES;
  const necklaceSizeOptions = necklaceSizes ?? DEFAULT_NECKLACE_SIZES;
  const braceletSizeOptions = braceletSizes ?? DEFAULT_BRACELET_SIZES;

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

  const priceToman = displayPriceToman ?? product.priceToman;
  const heroSrc = images[activeImage] ?? heroImageUrl ?? product.imageUrl;
  const relatedItems = useMemo(() => {
    const items = relatedProducts.length > 0 ? relatedProducts : DEFAULT_RELATED_PRODUCTS;
    return items.slice(0, RELATED_PRODUCTS_DESKTOP_LIMIT);
  }, [relatedProducts]);

  const specs = useMemo(() => {
    if (specRows.length > 0) return specRows;
    return Object.entries(product.specifications ?? {}).map(([label, value]) => ({
      label,
      value,
    }));
  }, [product.specifications, specRows]);

  return (
    <article className="product-details">
      <section className="product-details-hero" aria-label="تصاویر محصول">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={heroSrc} alt={product.title} className="product-details-hero-image" />

        <div className="product-details-hero-ui">
          <div className="product-details-hero-focus" aria-hidden />

          <div className="product-details-glass">
            <h1 className="product-details-glass-title">{product.title}</h1>

            <div className="product-details-glass-row">
              <span className="product-details-glass-row-value">
                {formatPrice(priceToman)} تومان
              </span>
              <span className="product-details-glass-row-label">قیمت</span>
            </div>

            <div className="product-details-glass-row">
              <span className="product-details-glass-row-value">
                {toPersianDigits(product.weightGram)} گرم (طلای {toPersianDigits(product.karat)} عیار)
              </span>
              <span className="product-details-glass-row-label">وزن</span>
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
                <ProductDetailVideoIcon />
                <span className="product-details-action-video-label">مشاهده ویدئو محصول</span>
              </button>
              <AddToCartButton
                productId={product.id}
                slug={product.slug}
                title={product.title}
                priceToman={priceToman}
                imageUrl={product.imageUrl}
                weightGram={product.weightGram}
                quantity={1}
                disabled={product.inventory <= 0}
                variant="product-detail"
                className="product-details-action product-details-action-cart"
                label="افزودن به سبد خرید"
                addedLabel="به سبد اضافه شد"
              />
            </div>
          </div>

          <div className="product-details-dots" role="tablist" aria-label="اسلایدهای محصول">
            {images.map((_, index) => (
              <button
                key={index}
                type="button"
                role="tab"
                aria-selected={index === activeImage}
                className={
                  index === activeImage ? 'product-details-dot is-active' : 'product-details-dot'
                }
                onClick={() => setActiveImage(index)}
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

        <section
          className="product-details-section product-details-section-gold"
          aria-labelledby="pdp-gold-title"
        >
          <h2 id="pdp-gold-title" className="product-details-section-title">
            انتخاب رنگ طلا
          </h2>
          <div className="product-details-options">
            {goldColors.map((color) => (
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

        <section
          className="product-details-section product-details-section-stone"
          aria-labelledby="pdp-stone-title"
        >
          <h2 id="pdp-stone-title" className="product-details-section-title">
            انتخاب رنگ سنگ
          </h2>
          <div className="product-details-stone-swatches">
            {stoneSwatches.map((swatch) => (
              <button
                key={swatch.id}
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
            ))}
          </div>
        </section>

        <section className="product-details-section product-details-specs-section" aria-labelledby="pdp-specs-title">
          <div className="product-details-section-head">
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
            <Link href="/products" className="product-details-related-view-all">
              نمایش همه
            </Link>
          </div>

          <div className="product-details-related-track" role="list">
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
        onClose={() => setVideoModalOpen(false)}
      />
    </article>
  );
}
