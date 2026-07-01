import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/infrastructure/database/prisma.service';

@Injectable()
export class StaffInboxNotifierService {
  constructor(private readonly prisma: PrismaService) {}

  notifyProductReviewPending(params: {
    reviewId: string;
    productId: string;
    productSlug: string;
    productTitle: string;
    rating: number;
  }) {
    return this.prisma.staffNotification.create({
      data: {
        title: 'دیدگاه جدید در انتظار تأیید',
        body: `یک دیدگاه جدید برای محصول «${params.productTitle}» ثبت شد. پس از تأیید شما در پنل مدیریت، در صفحه محصول نمایش داده می‌شود.`,
        channel: 'IN_APP',
        priority: 'NORMAL',
        category: 'operational',
        targetRole: null,
        metadata: {
          kind: 'product_review_pending',
          reviewId: params.reviewId,
          productId: params.productId,
          productSlug: params.productSlug,
          rating: params.rating,
          adminPath: '/products/reviews',
        },
      },
    });
  }

  notifyBlogPostReviewPending(params: {
    reviewId: string;
    blogPostId: string;
    blogPostSlug: string;
    blogPostTitle: string;
    rating: number;
  }) {
    return this.prisma.staffNotification.create({
      data: {
        title: 'نظر جدید مقاله در انتظار تأیید',
        body: `یک نظر جدید برای مقاله «${params.blogPostTitle}» ثبت شد. پس از تأیید شما در پنل مدیریت، در صفحه مقاله نمایش داده می‌شود.`,
        channel: 'IN_APP',
        priority: 'NORMAL',
        category: 'operational',
        targetRole: null,
        metadata: {
          kind: 'blog_post_review_pending',
          reviewId: params.reviewId,
          blogPostId: params.blogPostId,
          blogPostSlug: params.blogPostSlug,
          rating: params.rating,
          adminPath: '/cms/blog/reviews',
        },
      },
    });
  }
}
