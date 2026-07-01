import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '@/infrastructure/database/prisma.service';
import { StaffInboxNotifierService } from '@/infrastructure/notifications/staff-inbox-notifier.service';
import type { SubmitBlogPostReviewDto } from '../dto/submit-blog-post-review.dto';
import { BlogPostReviewsRepository } from '../repositories/blog-post-reviews.repository';

const DUPLICATE_WINDOW_MS = 24 * 60 * 60 * 1000;

@Injectable()
export class BlogPostReviewsService {
  constructor(
    private readonly blogPostReviewsRepository: BlogPostReviewsRepository,
    private readonly prisma: PrismaService,
    private readonly staffInboxNotifier: StaffInboxNotifierService,
  ) {}

  async submit(slug: string, payload: SubmitBlogPostReviewDto) {
    const blogPost = await this.blogPostReviewsRepository.findBlogPostIdBySlug(slug);
    if (!blogPost) {
      throw new NotFoundException('Blog post not found');
    }

    const body = payload.body.trim();
    if (body.length < 10) {
      throw new BadRequestException('متن دیدگاه کوتاه است');
    }

    const phone = payload.phone.trim();
    const since = new Date(Date.now() - DUPLICATE_WINDOW_MS);
    const duplicate = await this.blogPostReviewsRepository.findRecentPendingByPhone(
      blogPost.id,
      phone,
      since,
    );
    if (duplicate) {
      throw new ConflictException('دیدگاه شما در انتظار بررسی است');
    }

    const review = await this.blogPostReviewsRepository.createReview({
      blogPostId: blogPost.id,
      phone,
      body,
      rating: payload.rating,
    });

    await this.prisma.auditLog.create({
      data: {
        action: 'blog.review_submitted',
        context: {
          blogPostId: blogPost.id,
          blogPostSlug: slug,
          reviewId: review.id,
          rating: review.rating,
        },
      },
    });

    await this.staffInboxNotifier.notifyBlogPostReviewPending({
      reviewId: review.id,
      blogPostId: blogPost.id,
      blogPostSlug: slug,
      blogPostTitle: blogPost.title,
      rating: review.rating,
    });

    return {
      success: true,
      reviewId: review.id,
      message: 'دیدگاه شما ثبت شد و پس از تأیید نمایش داده می‌شود',
    };
  }

  async listApproved(slug: string, limit = 10) {
    const blogPost = await this.blogPostReviewsRepository.findBlogPostIdBySlug(slug);
    if (!blogPost) {
      throw new NotFoundException('Blog post not found');
    }

    const reviews = await this.blogPostReviewsRepository.findApprovedByBlogPostId(
      blogPost.id,
      limit,
    );

    return reviews.map((review) => ({
      id: review.id,
      author: review.authorName ?? 'کاربر',
      body: review.body,
      rating: review.rating,
      date: review.createdAt.toISOString(),
    }));
  }
}
