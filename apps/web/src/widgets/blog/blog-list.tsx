import Link from "next/link";
import { Card } from "@gold/ui";
import type { BlogPostSummary } from "@gold/types";

interface BlogListProps {
  posts: BlogPostSummary[];
}

export function BlogList({ posts }: BlogListProps) {
  return (
    <div className="grid gap-6 md:grid-cols-2">
      {posts.map((post) => (
        <Link key={post.id} href={`/blog/${post.slug}`}>
          <Card className="h-full p-6 transition hover:-translate-y-1 hover:shadow-lg">
            <p className="text-xs font-medium text-amber-700">
              {new Intl.DateTimeFormat("fa-IR", { dateStyle: "medium" }).format(
                new Date(post.publishedAt),
              )}
            </p>
            <h3 className="mt-3 text-xl font-bold text-stone-950">{post.title}</h3>
            <p className="mt-4 text-sm leading-7 text-stone-600">{post.excerpt}</p>
          </Card>
        </Link>
      ))}
    </div>
  );
}
