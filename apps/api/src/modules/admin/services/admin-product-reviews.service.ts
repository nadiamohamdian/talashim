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
  ReviewAdminProductReviewDto,
} from '../dto/admin-product-reviews.dto';

function maskPhone(phone: string): string {
  if (phone.length < 7) {
    return '***';
  }
  return `${phone.slice(0, 4)}***${phone.slice(-3)}`;
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
      items: rows.map((row) => ({
        id: row.id,
        body: row.body,
        rating: row.rating,
        status: row.status,
        phoneMasked: maskPhone(row.phone),
        author: row.authorName ?? 'کاربر',
        createdAt: row.createdAt.toISOString(),
        product: row.product,
      })),
    };
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

      return {
        id: updated.id,
        body: updated.body,
        rating: updated.rating,
        status: updated.status,
        phoneMasked: maskPhone(updated.phone),
        author: updated.authorName ?? 'کاربر',
        createdAt: updated.createdAt.toISOString(),
        product: updated.product,
      };
    } catch {
      throw new NotFoundException('Review not found');
    }
  }
}
