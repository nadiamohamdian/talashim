import { Injectable } from '@nestjs/common';
import {
  DiscountType,
  Prisma,
  ProductCategory,
  type DiscountCoupon,
} from '@/generated/prisma';
import { PrismaService } from '@/infrastructure/database/prisma.service';

@Injectable()
export class CouponsRepository {
  constructor(private readonly prisma: PrismaService) {}

  findByCode(code: string) {
    return this.prisma.discountCoupon.findFirst({
      where: { code, deletedAt: null },
    });
  }

  listCoupons(
    skip: number,
    take: number,
    filters: { search?: string; type?: DiscountType; isActive?: boolean },
  ) {
    const where: Prisma.DiscountCouponWhereInput = { deletedAt: null };
    if (filters.search?.trim()) {
      where.OR = [
        { code: { contains: filters.search.trim(), mode: 'insensitive' } },
        { title: { contains: filters.search.trim(), mode: 'insensitive' } },
      ];
    }
    if (filters.type) {
      where.discountType = filters.type;
    }
    if (typeof filters.isActive === 'boolean') {
      where.isActive = filters.isActive;
    }
    return this.prisma.$transaction([
      this.prisma.discountCoupon.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.discountCoupon.count({ where }),
    ]);
  }

  createCoupon(data: Prisma.DiscountCouponCreateInput) {
    return this.prisma.discountCoupon.create({ data });
  }

  updateCoupon(id: string, data: Prisma.DiscountCouponUpdateInput) {
    return this.prisma.discountCoupon.update({ where: { id }, data });
  }

  softDeleteCoupon(id: string, actorId: string) {
    return this.prisma.discountCoupon.update({
      where: { id },
      data: { deletedAt: new Date(), updatedBy: actorId, isActive: false },
    });
  }

  duplicateCoupon(source: DiscountCoupon, code: string, actorId: string) {
    return this.prisma.discountCoupon.create({
      data: {
        code,
        title: `${source.title} (Copy)`,
        description: source.description,
        isActive: false,
        startsAt: source.startsAt,
        expiresAt: source.expiresAt,
        discountType: source.discountType,
        discountValue: source.discountValue,
        minimumOrderAmount: source.minimumOrderAmount,
        maximumDiscountAmount: source.maximumDiscountAmount,
        usageLimitTotal: source.usageLimitTotal,
        usageLimitPerUser: source.usageLimitPerUser,
        isFirstPurchaseOnly: source.isFirstPurchaseOnly,
        allowWithOtherCoupons: source.allowWithOtherCoupons,
        applicableCategories: source.applicableCategories as ProductCategory[],
        applicableProducts: source.applicableProducts,
        excludedCategories: source.excludedCategories as ProductCategory[],
        excludedProducts: source.excludedProducts,
        applicableUsers: source.applicableUsers,
        excludedUsers: source.excludedUsers,
        customerGroup: source.customerGroup,
        createdBy: actorId,
        updatedBy: actorId,
      },
    });
  }
}
