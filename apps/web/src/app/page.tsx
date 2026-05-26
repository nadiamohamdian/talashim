import { getBlogPosts } from "@/shared/api/blog-api";
import { getFeaturedProducts } from "@/shared/api/catalog-api";
import { CartDrawer } from "@/features/cart/components/cart-drawer";
import { BlogList } from "@/widgets/blog/blog-list";
import { FeaturedProducts } from "@/widgets/home/featured-products";
import { HeroSection } from "@/widgets/home/hero-section";

export default async function Home() {
  const [products, posts] = await Promise.all([
    getFeaturedProducts(),
    getBlogPosts(),
  ]);

  return (
    <div className="space-y-12">
      <HeroSection />
      <div className="grid gap-8 xl:grid-cols-[1.5fr_0.7fr]">
        <FeaturedProducts products={products} />
        <CartDrawer />
      </div>
      <section className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-stone-950">مجله و محتوای سئو</h2>
          <p className="mt-2 text-sm leading-7 text-stone-600">
            این بخش از الان آماده است تا بعدا به CMS یا پنل مدیریت محتوا متصل شود.
          </p>
        </div>
        <BlogList posts={posts} />
      </section>
    </div>
  );
}
