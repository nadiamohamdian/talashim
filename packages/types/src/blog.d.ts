export interface BlogPostSummary {
    id: string;
    slug: string;
    title: string;
    excerpt: string;
    coverImageUrl: string;
    publishedAt: string;
}
export interface BlogPostDetails extends BlogPostSummary {
    content: string;
}
//# sourceMappingURL=blog.d.ts.map