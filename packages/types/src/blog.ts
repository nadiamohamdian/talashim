export interface BlogPostSummary {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  /** Full answer HTML — included for FAQ list responses */
  content?: string;
  coverImageUrl: string;
  publishedAt: string;
  isPublished?: boolean;
  sortOrder?: number;
}

export interface BlogPostDetails extends BlogPostSummary {
  content: string;
}

export interface BlogPostReviewItem {
  id: string;
  author: string;
  body: string;
  rating: number;
  date: string;
}

export interface AdminBlogPostReviewItem {
  id: string;
  body: string;
  rating: number;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  phoneMasked: string;
  author: string;
  createdAt: string;
  blogPost: {
    id: string;
    title: string;
    slug: string;
  };
}

export interface AdminBlogPostReviewGroup {
  blogPost: {
    id: string;
    title: string;
    slug: string;
  };
  reviewCount: number;
  averageRating: number;
  reviews: AdminBlogPostReviewItem[];
}

export interface AdminBlogPostReviewsGroupedResponse {
  page: number;
  limit: number;
  total: number;
  groups: AdminBlogPostReviewGroup[];
}
