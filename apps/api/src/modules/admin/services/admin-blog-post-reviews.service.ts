import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ProductReviewStatus } from '@/generated/prisma';
import { ADMIN_PERMISSIONS } from '@sadafgold/shared/admin-rbac';
import type { AuthenticatedUser } from '@/common/interfaces/auth-user.interface';
import { assertAdminPermission } from '@/common/rbac/assert-admin-permission';
import { BlogPostReviewsRepository } from '@/modules/blog/repositories/blog-post-reviews.repository';
import { AdminRepository } from '../repositories/admin.repository';
import type {
  AdminBlogPostReviewsQueryDto,
  CreateAdminBlogPostReviewDto,
  ReviewAdminBlogPostReviewDto,
  UpdateAdminBlogPostReviewDto,
} from '../dto/admin-blog-post-reviews.dto';

function maskPhone(phone: string): string {
  if (phone.length < 7) {
    return '***';
  }
  return `${phone.slice(0, 4)}***${phone.slice(-3)}`;
}

function mapReviewRow(row: {
  id: string;
  body: string;
  rating: number;
  status: ProductReviewStatus;
  phone: string;
  authorName: string | null;
  createdAt: Date;
  blogPost: { id: string; title: string; slug: string };
}) {
  return {
    id: row.id,
    body: row.body,
    rating: row.rating,
    status: row.status,
    phoneMasked: maskPhone(row.phone),
    author: row.authorName ?? 'کاربر',
    createdAt: row.createdAt.toISOString(),
    blogPost: row.blogPost,
  };
}

@Injectable()
export class AdminBlogPostReviewsService {
  constructor(
    private readonly blogPostReviewsRepository: BlogPostReviewsRepository,
    private readonly adminRepository: AdminRepository,
  ) {}

  async list(query: AdminBlogPostReviewsQueryDto, actor: AuthenticatedUser) {
    assertAdminPermission(actor.role, ADMIN_PERMISSIONS.cms.read);

    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const skip = (page - 1) * limit;

    if (query.groupByBlogPost) {
      const { total, groups } = await this.blogPostReviewsRepository.listGroupedByBlogPost(
        skip,
        limit,
        query.status,
        query.search,
      );

      return {
        page,
        limit,
        total,
        groups: groups.map((group) => ({
          blogPost: group.blogPost,
          reviewCount: group.reviewCount,
          averageRating: Math.round(group.averageRating * 10) / 10,
          reviews: group.reviews.map(mapReviewRow),
        })),
      };
    }

    const [rows, total] = await this.blogPostReviewsRepository.listForAdmin(
      skip,
      limit,
      query.status,
      query.search,
    );

    return {
      page,
      limit,
      total,
      items: rows.map(mapReviewRow),
    };
  }

  async create(payload: CreateAdminBlogPostReviewDto, actor: AuthenticatedUser) {
    assertAdminPermission(actor.role, ADMIN_PERMISSIONS.cms.write);

    const blogPost = await this.blogPostReviewsRepository.findBlogPostIdBySlugForAdmin(
      payload.blogPostSlug.trim(),
    );
    if (!blogPost) {
      throw new NotFoundException('Blog post not found');
    }

    const phone = payload.phone?.trim() || '09000000000';
    const status = payload.status ?? ProductReviewStatus.APPROVED;

    const created = await this.blogPostReviewsRepository.createAdminReview({
      blogPostId: blogPost.id,
      body: payload.body.trim(),
      rating: payload.rating,
      authorName: payload.authorName?.trim() || undefined,
      phone,
      status,
    });

    await this.adminRepository.createAuditLog('admin.blog_post_review.created', actor.id, {
      reviewId: created.id,
      blogPostId: blogPost.id,
      blogPostSlug: payload.blogPostSlug,
      status,
    });

    return mapReviewRow(created);
  }

  async update(id: string, payload: UpdateAdminBlogPostReviewDto, actor: AuthenticatedUser) {
    assertAdminPermission(actor.role, ADMIN_PERMISSIONS.cms.write);

    if (
      payload.body === undefined &&
      payload.rating === undefined &&
      payload.authorName === undefined &&
      payload.status === undefined
    ) {
      throw new BadRequestException('No fields to update');
    }

    try {
      const updated = await this.blogPostReviewsRepository.updateReview(id, {
        body: payload.body?.trim(),
        rating: payload.rating,
        authorName: payload.authorName?.trim(),
        status: payload.status,
      });

      await this.adminRepository.createAuditLog('admin.blog_post_review.updated', actor.id, {
        reviewId: id,
        blogPostId: updated.blogPost.id,
        blogPostSlug: updated.blogPost.slug,
      });

      return mapReviewRow(updated);
    } catch {
      throw new NotFoundException('Review not found');
    }
  }

  async remove(id: string, actor: AuthenticatedUser) {
    assertAdminPermission(actor.role, ADMIN_PERMISSIONS.cms.write);

    try {
      const deleted = await this.blogPostReviewsRepository.deleteReview(id);
      await this.adminRepository.createAuditLog('admin.blog_post_review.deleted', actor.id, {
        reviewId: deleted.id,
        blogPostId: deleted.blogPostId,
      });
      return { id: deleted.id };
    } catch {
      throw new NotFoundException('Review not found');
    }
  }

  async review(id: string, payload: ReviewAdminBlogPostReviewDto, actor: AuthenticatedUser) {
    assertAdminPermission(actor.role, ADMIN_PERMISSIONS.cms.write);

    if (payload.status === ProductReviewStatus.PENDING) {
      throw new BadRequestException('Use APPROVED or REJECTED for review');
    }

    try {
      const updated = await this.blogPostReviewsRepository.updateReviewStatus(id, payload.status);
      await this.adminRepository.createAuditLog('admin.blog_post_review.reviewed', actor.id, {
        reviewId: id,
        blogPostId: updated.blogPost.id,
        blogPostSlug: updated.blogPost.slug,
        status: payload.status,
      });

      return mapReviewRow(updated);
    } catch {
      throw new NotFoundException('Review not found');
    }
  }
}
