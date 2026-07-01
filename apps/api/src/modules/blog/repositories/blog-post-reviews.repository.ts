import { Injectable } from '@nestjs/common';
import { ProductReviewStatus, type Prisma } from '@/generated/prisma';
import { PrismaService } from '@/infrastructure/database/prisma.service';

@Injectable()
export class BlogPostReviewsRepository {
  constructor(private readonly prisma: PrismaService) {}

  findBlogPostIdBySlug(slug: string) {
    return this.prisma.blogPost.findFirst({
      where: {
        slug,
        isPublished: true,
        publishedAt: { lte: new Date() },
      },
      select: { id: true, title: true },
    });
  }

  findBlogPostIdBySlugForAdmin(slug: string) {
    return this.prisma.blogPost.findUnique({
      where: { slug },
      select: { id: true, title: true },
    });
  }

  findRecentPendingByPhone(blogPostId: string, phone: string, since: Date) {
    return this.prisma.blogPostReview.findFirst({
      where: {
        blogPostId,
        phone,
        status: ProductReviewStatus.PENDING,
        createdAt: { gte: since },
      },
      select: { id: true },
    });
  }

  createReview(data: {
    blogPostId: string;
    userId?: string;
    authorName?: string;
    phone: string;
    body: string;
    rating: number;
  }) {
    return this.prisma.blogPostReview.create({
      data: {
        blogPostId: data.blogPostId,
        userId: data.userId,
        authorName: data.authorName,
        phone: data.phone,
        body: data.body,
        rating: data.rating,
        status: ProductReviewStatus.PENDING,
      },
      select: {
        id: true,
        rating: true,
        status: true,
        createdAt: true,
      },
    });
  }

  findApprovedByBlogPostId(blogPostId: string, limit: number) {
    return this.prisma.blogPostReview.findMany({
      where: {
        blogPostId,
        status: ProductReviewStatus.APPROVED,
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
      select: {
        id: true,
        authorName: true,
        body: true,
        rating: true,
        createdAt: true,
      },
    });
  }

  listForAdmin(
    skip: number,
    limit: number,
    status?: ProductReviewStatus,
    search?: string,
  ) {
    const where = this.buildAdminReviewWhere(status, search);

    return Promise.all([
      this.prisma.blogPostReview.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: this.adminReviewSelect,
      }),
      this.prisma.blogPostReview.count({ where }),
    ]);
  }

  listGroupedByBlogPost(
    skip: number,
    limit: number,
    status?: ProductReviewStatus,
    search?: string,
  ) {
    const where = this.buildAdminReviewWhere(status, search);

    return this.prisma.blogPostReview
      .groupBy({
        by: ['blogPostId'],
        where,
        _count: { _all: true },
        _avg: { rating: true },
        _max: { createdAt: true },
        orderBy: { _max: { createdAt: 'desc' } },
      })
      .then(async (grouped) => {
        const total = grouped.length;
        const pageSlice = grouped.slice(skip, skip + limit);
        const blogPostIds = pageSlice.map((row) => row.blogPostId);

        if (blogPostIds.length === 0) {
          return { total, groups: [] as const };
        }

        const trimmedSearch = search?.trim();
        const reviewWhere: Prisma.BlogPostReviewWhereInput = {
          blogPostId: { in: blogPostIds },
          ...(status ? { status } : {}),
          ...(trimmedSearch
            ? {
                OR: [
                  { body: { contains: trimmedSearch, mode: 'insensitive' as const } },
                  { phone: { contains: trimmedSearch } },
                  { blogPost: { title: { contains: trimmedSearch, mode: 'insensitive' as const } } },
                  { blogPost: { slug: { contains: trimmedSearch, mode: 'insensitive' as const } } },
                ],
              }
            : {}),
        };

        const [blogPosts, reviews] = await Promise.all([
          this.prisma.blogPost.findMany({
            where: { id: { in: blogPostIds } },
            select: { id: true, title: true, slug: true },
          }),
          this.prisma.blogPostReview.findMany({
            where: reviewWhere,
            orderBy: { createdAt: 'desc' },
            select: this.adminReviewSelect,
          }),
        ]);

        const blogPostById = new Map(blogPosts.map((post) => [post.id, post]));
        const reviewsByBlogPost = new Map<string, typeof reviews>();
        for (const review of reviews) {
          const bucket = reviewsByBlogPost.get(review.blogPost.id) ?? [];
          bucket.push(review);
          reviewsByBlogPost.set(review.blogPost.id, bucket);
        }

        const groups = pageSlice
          .map((row) => {
            const blogPost = blogPostById.get(row.blogPostId);
            if (!blogPost) {
              return null;
            }

            return {
              blogPost,
              reviewCount: row._count._all,
              averageRating: row._avg.rating ?? 0,
              reviews: reviewsByBlogPost.get(row.blogPostId) ?? [],
            };
          })
          .filter((group): group is NonNullable<typeof group> => group !== null);

        return { total, groups };
      });
  }

  private buildAdminReviewWhere(
    status?: ProductReviewStatus,
    search?: string,
  ): Prisma.BlogPostReviewWhereInput {
    const conditions: Prisma.BlogPostReviewWhereInput[] = [];

    if (status) {
      conditions.push({ status });
    }

    const trimmedSearch = search?.trim();
    if (trimmedSearch) {
      conditions.push({
        OR: [
          { body: { contains: trimmedSearch, mode: 'insensitive' } },
          { phone: { contains: trimmedSearch } },
          { blogPost: { title: { contains: trimmedSearch, mode: 'insensitive' } } },
          { blogPost: { slug: { contains: trimmedSearch, mode: 'insensitive' } } },
        ],
      });
    }

    return conditions.length > 0 ? { AND: conditions } : {};
  }

  updateReviewStatus(id: string, status: ProductReviewStatus) {
    return this.prisma.blogPostReview.update({
      where: { id },
      data: { status },
      select: this.adminReviewSelect,
    });
  }

  updateReview(
    id: string,
    data: {
      body?: string;
      rating?: number;
      authorName?: string;
      status?: ProductReviewStatus;
    },
  ) {
    return this.prisma.blogPostReview.update({
      where: { id },
      data,
      select: this.adminReviewSelect,
    });
  }

  deleteReview(id: string) {
    return this.prisma.blogPostReview.delete({
      where: { id },
      select: { id: true, blogPostId: true },
    });
  }

  createAdminReview(data: {
    blogPostId: string;
    body: string;
    rating: number;
    authorName?: string;
    phone: string;
    status: ProductReviewStatus;
  }) {
    return this.prisma.blogPostReview.create({
      data: {
        blogPostId: data.blogPostId,
        body: data.body,
        rating: data.rating,
        authorName: data.authorName,
        phone: data.phone,
        status: data.status,
      },
      select: this.adminReviewSelect,
    });
  }

  private readonly adminReviewSelect = {
    id: true,
    body: true,
    rating: true,
    status: true,
    phone: true,
    authorName: true,
    createdAt: true,
    blogPost: {
      select: {
        id: true,
        title: true,
        slug: true,
      },
    },
  } as const;
}
