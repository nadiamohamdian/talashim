import { getBlogPosts } from "@/shared/api/blog-api";
import { BlogList } from "@/widgets/blog/blog-list";

export default async function BlogPage() {
  const posts = await getBlogPosts();

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-medium text-amber-700">SEO & Content</p>
        <h1 className="mt-3 text-3xl font-bold text-stone-950">مجله طلا</h1>
        <p className="mt-3 max-w-2xl text-sm leading-7 text-stone-600">
          ساختار محتوا به‌صورت ماژولار طراحی شده تا بعدا بتواند به CMS، پنل ادمین یا workflow
          تولید محتوا متصل شود.
        </p>
      </div>
      <BlogList posts={posts} />
    </div>
  );
}
