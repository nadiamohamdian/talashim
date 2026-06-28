import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ProductReviewStatus } from '@/generated/prisma';
import { ADMIN_PERMISSIONS } from '@sadafgold/shared/admin-rbac';
import type { AuthenticatedUser } from '@/common/interfaces/auth-user.interface';
import { assertAdminPermission } from '@/common/rbac/assert-admin-permission';
import { ProductReviewsRepository } from '@/modules/catalog/repositories/product-reviews.repository';
import { AdminRepository } from '../repositories/admin.repository';
import type {
  AdminProductReviewsQueryDto,
  CreateAdminProductReviewDto,
  ReviewAdminProductReviewDto,
  UpdateAdminProductReviewDto,
} from '../dto/admin-product-reviews.dto';

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
  product: { id: string; title: string; slug: string };
}) {
  return {
    id: row.id,
    body: row.body,
    rating: row.rating,
    status: row.status,
    phoneMasked: maskPhone(row.phone),
    author: row.authorName ?? 'کاربر',
    createdAt: row.createdAt.toISOString(),
    product: row.product,
  };
}

@Injectable()
export class AdminProductReviewsService {
  constructor(
    private readonly productReviewsRepository: ProductReviewsRepository,
    private readonly adminRepository: AdminRepository,
  ) {}

  async list(query: AdminProductReviewsQueryDto, actor: AuthenticatedUser) {
    assertAdminPermission(actor.role, ADMIN_PERMISSIONS.products.read);

    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const skip = (page - 1) * limit;

    if (query.groupByProduct) {
      const { total, groups } = await this.productReviewsRepository.listGroupedByProduct(
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
          product: group.product,
          reviewCount: group.reviewCount,
          averageRating: Math.round(group.averageRating * 10) / 10,
          reviews: group.reviews.map(mapReviewRow),
        })),
      };
    }

    const [rows, total] = await this.productReviewsRepository.listForAdmin(
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

  async create(payload: CreateAdminProductReviewDto, actor: AuthenticatedUser) {
    assertAdminPermission(actor.role, ADMIN_PERMISSIONS.products.write);

    const product = await this.productReviewsRepository.findProductIdBySlug(payload.productSlug.trim());
    if (!product) {
      throw new NotFoundException('Product not found');
    }

    const phone = payload.phone?.trim() || '09000000000';
    const status = payload.status ?? ProductReviewStatus.APPROVED;

    const created = await this.productReviewsRepository.createAdminReview({
      productId: product.id,
      body: payload.body.trim(),
      rating: payload.rating,
      authorName: payload.authorName?.trim() || undefined,
      phone,
      status,
    });

    await this.adminRepository.createAuditLog('admin.product_review.created', actor.id, {
      reviewId: created.id,
      productId: product.id,
      productSlug: payload.productSlug,
      status,
    });

    return mapReviewRow(created);
  }

  async update(id: string, payload: UpdateAdminProductReviewDto, actor: AuthenticatedUser) {
    assertAdminPermission(actor.role, ADMIN_PERMISSIONS.products.write);

    if (
      payload.body === undefined &&
      payload.rating === undefined &&
      payload.authorName === undefined &&
      payload.status === undefined
    ) {
      throw new BadRequestException('No fields to update');
    }

    try {
      const updated = await this.productReviewsRepository.updateReview(id, {
        body: payload.body?.trim(),
        rating: payload.rating,
        authorName: payload.authorName?.trim(),
        status: payload.status,
      });

      await this.adminRepository.createAuditLog('admin.product_review.updated', actor.id, {
        reviewId: id,
        productId: updated.product.id,
        productSlug: updated.product.slug,
      });

      return mapReviewRow(updated);
    } catch {
      throw new NotFoundException('Review not found');
    }
  }

  async remove(id: string, actor: AuthenticatedUser) {
    assertAdminPermission(actor.role, ADMIN_PERMISSIONS.products.write);

    try {
      const deleted = await this.productReviewsRepository.deleteReview(id);
      await this.adminRepository.createAuditLog('admin.product_review.deleted', actor.id, {
        reviewId: deleted.id,
        productId: deleted.productId,
      });
      return { id: deleted.id };
    } catch {
      throw new NotFoundException('Review not found');
    }
  }

  async review(id: string, payload: ReviewAdminProductReviewDto, actor: AuthenticatedUser) {
    assertAdminPermission(actor.role, ADMIN_PERMISSIONS.products.write);

    if (payload.status === ProductReviewStatus.PENDING) {
      throw new BadRequestException('Use APPROVED or REJECTED for review');
    }

    try {
      const updated = await this.productReviewsRepository.updateReviewStatus(id, payload.status);
      await this.adminRepository.createAuditLog('admin.product_review.reviewed', actor.id, {
        reviewId: id,
        productId: updated.product.id,
        productSlug: updated.product.slug,
        status: payload.status,
      });

      return mapReviewRow(updated);
    } catch {
      throw new NotFoundException('Review not found');
    }
  }
}
