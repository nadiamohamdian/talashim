import type { ProductDetails, ProductSummary } from "@gold/contracts";

export const fallbackFeaturedProducts: ProductSummary[] = [
  {
    id: "prod-ring-1",
    slug: "royal-ring",
    title: "انگشتر طلای رویال",
    category: "ring",
    karat: 18,
    weightGram: 4.8,
    makingFeePercent: 9,
    priceToman: 32750000,
    imageUrl:
      "https://images.unsplash.com/photo-1617038220319-276d3cfab638?auto=format&fit=crop&w=900&q=80",
    inventory: 3,
    featured: true,
  },
  {
    id: "prod-necklace-1",
    slug: "sadaf-necklace",
    title: "گردنبند صدف",
    category: "necklace",
    karat: 18,
    weightGram: 11.2,
    makingFeePercent: 11,
    priceToman: 71900000,
    imageUrl:
      "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=900&q=80",
    inventory: 2,
    featured: true,
  },
  {
    id: "prod-bracelet-1",
    slug: "aurora-bracelet",
    title: "دستبند Aurora",
    category: "bracelet",
    karat: 18,
    weightGram: 7.4,
    makingFeePercent: 8,
    priceToman: 46800000,
    imageUrl:
      "https://images.unsplash.com/photo-1606760227091-3dd870d97f1d?auto=format&fit=crop&w=900&q=80",
    inventory: 5,
    featured: true,
  },
];

export const fallbackProductDetails: Record<string, ProductDetails> = {
  "royal-ring": {
    ...fallbackFeaturedProducts[0],
    description:
      "انگشتر 18 عیار با طراحی کلاسیک و نگین ظریف، مناسب استفاده روزمره و هدیه.",
    seoDescription:
      "انگشتر طلای رویال با طراحی کلاسیک، وزن دقیق و قیمت شفاف برای خرید مطمئن.",
  },
  "sadaf-necklace": {
    ...fallbackFeaturedProducts[1],
    description:
      "گردنبند مینیمال با قفل ایمن و ساخت تمیز برای استایل رسمی و نیمه‌رسمی.",
    seoDescription:
      "گردنبند طلای صدف با اجرت شفاف و کیفیت ساخت بالا برای خرید آنلاین طلا.",
  },
  "aurora-bracelet": {
    ...fallbackFeaturedProducts[2],
    description:
      "دستبند سبک و خوش‌فرم با پرداخت براق و مناسب ست روزانه.",
    seoDescription:
      "دستبند طلای Aurora با موجودی دقیق، قیمت روز و ارسال امن.",
  },
};
