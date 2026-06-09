import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '@/infrastructure/database/prisma.service';
import type { SubmitProductReviewDto } from '../dto/submit-product-review.dto';
import { ProductReviewsRepository } from '../repositories/product-reviews.repository';

const DUPLICATE_WINDOW_MS = 24 * 60 * 60 * 1000;

@Injectable()
export class ProductReviewsService {
  constructor(
    private readonly productReviewsRepository: ProductReviewsRepository,
    private readonly prisma: PrismaService,
  ) {}

  async submit(slug: string, payload: SubmitProductReviewDto) {
    const product = await this.productReviewsRepository.findProductIdBySlug(slug);
    if (!product) {
      throw new NotFoundException('Product not found');
    }

    const body = payload.body.trim();
    if (body.length < 10) {
      throw new BadRequestException('متن دیدگاه کوتاه است');
    }

    const phone = payload.phone.trim();
    const since = new Date(Date.now() - DUPLICATE_WINDOW_MS);
    const duplicate = await this.productReviewsRepository.findRecentPendingByPhone(
      product.id,
      phone,
      since,
    );
    if (duplicate) {
      throw new ConflictException('دیدگاه شما در انتظار بررسی است');
    }

    const review = await this.productReviewsRepository.createReview({
      productId: product.id,
      phone,
      body,
      rating: payload.rating,
    });

    await this.prisma.auditLog.create({
      data: {
        action: 'product.review_submitted',
        context: {
          productId: product.id,
          productSlug: slug,
          reviewId: review.id,
          rating: review.rating,
        },
      },
    });

    return {
      success: true,
      reviewId: review.id,
      message: 'دیدگاه شما ثبت شد و پس از تأیید نمایش داده می‌شود',
    };
  }

  async listApproved(slug: string, limit = 10) {
    const product = await this.productReviewsRepository.findProductIdBySlug(slug);
    if (!product) {
      throw new NotFoundException('Product not found');
    }

    const reviews = await this.productReviewsRepository.findApprovedByProductId(
      product.id,
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
