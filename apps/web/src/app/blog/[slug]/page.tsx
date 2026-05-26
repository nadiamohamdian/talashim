import { Card } from "@gold/ui";
import { getBlogPostBySlug } from "@/shared/api/blog-api";

interface BlogDetailsPageProps {
  params: Promise<{ slug: string }>;
}

export default async function BlogDetailsPage({ params }: BlogDetailsPageProps) {
  const { slug } = await params;
  const post = await getBlogPostBySlug(slug);

  return (
    <Card className="mx-auto max-w-4xl p-8">
      <p className="text-sm font-medium text-amber-700">مجله طلا</p>
      <h1 className="mt-3 text-3xl font-bold text-stone-950">{post.title}</h1>
      <p className="mt-6 text-base leading-8 text-stone-700">{post.content}</p>
    </Card>
  );
}
