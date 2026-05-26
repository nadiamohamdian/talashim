import type { BlogPostDetails, BlogPostSummary } from "@gold/contracts";

export const fallbackBlogPosts: BlogPostSummary[] = [
  {
    id: "blog-1",
    slug: "how-to-buy-gold-online",
    title: "راهنمای خرید امن طلا از فروشگاه آنلاین",
    excerpt:
      "از بررسی عیار و وزن تا شفافیت اجرت و قیمت نهایی؛ این نکات ریسک خرید آنلاین را کم می‌کنند.",
    coverImageUrl:
      "https://images.unsplash.com/photo-1617038220319-276d3cfab638?auto=format&fit=crop&w=1200&q=80",
    publishedAt: new Date("2026-05-01").toISOString(),
  },
  {
    id: "blog-2",
    slug: "difference-between-carat-and-purity",
    title: "تفاوت عیار طلا و خلوص چیست؟",
    excerpt:
      "این مطلب کمک می‌کند عیار 18 و 24 را بهتر بفهمید و انتخاب دقیق‌تری داشته باشید.",
    coverImageUrl:
      "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=1200&q=80",
    publishedAt: new Date("2026-04-20").toISOString(),
  },
];

export const fallbackBlogDetails: Record<string, BlogPostDetails> = {
  "how-to-buy-gold-online": {
    ...fallbackBlogPosts[0],
    content:
      "برای خرید امن طلا باید وزن، عیار، اجرت، مالیات و سیاست مرجوعی را هم‌زمان بررسی کنید. فروشگاهی که این داده‌ها را شفاف نمایش دهد، انتخاب مطمئن‌تری است.",
  },
  "difference-between-carat-and-purity": {
    ...fallbackBlogPosts[1],
    content:
      "عیار شاخصی برای بیان نسبت طلای خالص در آلیاژ است. هرچه عیار بالاتر باشد، خلوص بیشتر و سختی قطعه معمولا کمتر می‌شود.",
  },
};
