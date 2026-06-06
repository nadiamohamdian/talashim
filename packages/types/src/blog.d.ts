export interface BlogPostSummary {
    id: string;
    slug: string;
    title: string;
    excerpt: string;
    content?: string;
    coverImageUrl: string;
    publishedAt: string;
    isPublished?: boolean;
    sortOrder?: number;
}
export interface BlogPostDetails extends BlogPostSummary {
    content: string;
}
