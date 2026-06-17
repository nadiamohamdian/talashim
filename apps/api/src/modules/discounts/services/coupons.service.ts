import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { DiscountType, OrderStatus, Prisma, ProductCategory } from '@/generated/prisma';
import { CartRepository } from '@/modules/cart/repositories/cart.repository';
import { PrismaService } from '@/infrastructure/database/prisma.service';
import { tomanNumberToBigInt } from '@/common/finance/toman-amount';
import type {
  CouponQueryDto,
  CreateCouponDto,
  UpdateCouponDto,
} from '../dto/coupon.dto';
import { CouponsRepository } from '../repositories/coupons.repository';

export interface CouponValidationResult {
  couponAccepted: boolean;
  couponMessage: string;
  discountAmount: number;
  discountPercent: number | null;
  finalTotal: number;
  finalPayable: number;
  couponCode?: string;
  couponId?: string;
}

@Injectable()
export class CouponsService {
  constructor(
    private readonly couponsRepository: CouponsRepository,
    private readonly cartRepository: CartRepository,
    private readonly prisma: PrismaService,
  ) {}

  private normalizeCode(code: string): string {
    return code.trim().toUpperCase();
  }

  private async writeAudit(action: string, actorId: string | null, context: Prisma.JsonObject) {
    await this.prisma.auditLog.create({
      data: {
        action,
        actorId: actorId ?? undefined,
        context,
      },
    });
  }

  async validateForCheckout(
    code: string,
    cartId: string,
    userId: string,
    options?: { throwOnFailure?: boolean },
  ): Promise<CouponValidationResult> {
    const normalizedCode = this.normalizeCode(code);
    const cart = await this.cartRepository.findCartById(cartId);
    if (!cart || !cart.items.length) {
      throw new BadRequestException('سبد خرید معتبر نیست');
    }
    if (cart.userId && cart.userId !== userId) {
      throw new BadRequestException('سبد خرید متعلق به شما نیست');
    }

    const subtotal = cart.items.reduce((sum, item) => sum + Number(item.unitPriceToman) * item.quantity, 0);
    const invalid = (message: string): CouponValidationResult => ({
      couponAccepted: false,
      couponMessage: message,
      discountAmount: 0,
      discountPercent: null,
      finalTotal: subtotal,
      finalPayable: subtotal,
    });
    const fail = async (message: string) => {
      await this.writeAudit('coupon.apply_failed', userId, {
        code: normalizedCode,
        cartId,
        message,
      });
      if (options?.throwOnFailure) {
        throw new BadRequestException(message);
      }
      return invalid(message);
    };

    const coupon = await this.couponsRepository.findByCode(normalizedCode);
    if (!coupon) {
      return fail('کد تخفیف معتبر نیست.');
    }
    const now = new Date();
    if (!coupon.isActive) {
      return fail('این کد تخفیف غیرفعال است.');
    }
    if (coupon.startsAt && coupon.startsAt > now) {
      return fail('زمان استفاده از این کد تخفیف هنوز شروع نشده است.');
    }
    if (coupon.expiresAt && coupon.expiresAt < now) {
      return fail('مهلت استفاده از این کد تخفیف به پایان رسیده است.');
    }
    if (coupon.usageLimitTotal && coupon.usedCount >= coupon.usageLimitTotal) {
      return fail('ظرفیت استفاده از این کد تکمیل شده است.');
    }
    if (coupon.minimumOrderAmount && subtotal < Number(coupon.minimumOrderAmount)) {
      return fail('حداقل مبلغ سفارش برای این کد تخفیف رعایت نشده است.');
    }

    const [userOrdersCount, userCouponUsageCount] = await Promise.all([
      this.prisma.order.count({
        where: { userId, status: { in: [OrderStatus.PENDING, OrderStatus.CONFIRMED, OrderStatus.PAID] } },
      }),
      this.prisma.couponUsage.count({ where: { couponId: coupon.id, userId } }),
    ]);
    if (coupon.isFirstPurchaseOnly && userOrdersCount > 0) {
      return fail('این کد فقط برای اولین خرید قابل استفاده است.');
    }
    if (coupon.usageLimitPerUser && userCouponUsageCount >= coupon.usageLimitPerUser) {
      return fail('سقف استفاده شما از این کد تخفیف تکمیل شده است.');
    }

    const itemProductIds = new Set(cart.items.map((item) => item.productId));
    const itemCategories = new Set(cart.items.map((item) => item.product.category));
    if (coupon.excludedProducts.some((id) => itemProductIds.has(id))) {
      return fail('این کد برای برخی کالاهای سبد قابل استفاده نیست.');
    }
    if (coupon.excludedCategories.some((cat) => itemCategories.has(cat))) {
      return fail('این کد برای برخی دسته‌بندی‌های سبد قابل استفاده نیست.');
    }
    if (coupon.applicableProducts.length > 0) {
      const hasIncludedProduct = coupon.applicableProducts.some((id) => itemProductIds.has(id));
      if (!hasIncludedProduct) {
        return fail('این کد برای کالاهای فعلی سبد شما قابل استفاده نیست.');
      }
    }
    if (coupon.applicableCategories.length > 0) {
      const hasIncludedCategory = coupon.applicableCategories.some((cat) => itemCategories.has(cat));
      if (!hasIncludedCategory) {
        return fail('این کد برای دسته‌بندی‌های فعلی سبد شما قابل استفاده نیست.');
      }
    }
    if (coupon.applicableUsers.length > 0 && !coupon.applicableUsers.includes(userId)) {
      return fail('این کد برای حساب شما فعال نشده است.');
    }
    if (coupon.excludedUsers.includes(userId)) {
      return fail('امکان استفاده از این کد برای حساب شما وجود ندارد.');
    }

    let discountAmount =
      coupon.discountType === DiscountType.PERCENT
        ? Math.floor((subtotal * Number(coupon.discountValue)) / 100)
        : Math.floor(Number(coupon.discountValue));
    if (coupon.maximumDiscountAmount) {
      discountAmount = Math.min(discountAmount, Number(coupon.maximumDiscountAmount));
    }
    discountAmount = Math.min(Math.max(discountAmount, 0), subtotal);
    const finalPayable = Math.max(subtotal - discountAmount, 0);

    await this.writeAudit('coupon.apply_validated', userId, {
      code: normalizedCode,
      couponId: coupon.id,
      cartId,
      subtotal,
      discountAmount,
    });
    return {
      couponAccepted: true,
      couponMessage: 'کد تخفیف با موفقیت اعمال شد.',
      discountAmount,
      discountPercent:
        coupon.discountType === DiscountType.PERCENT ? Number(coupon.discountValue) : null,
      finalTotal: finalPayable,
      finalPayable,
      couponCode: coupon.code,
      couponId: coupon.id,
    };
  }

  async redeemCoupon(params: {
    couponId: string;
    code: string;
    userId: string;
    orderId: string;
    discountAmount: number;
    tx: Prisma.TransactionClient;
  }) {
    await params.tx.discountCoupon.update({
      where: { id: params.couponId },
      data: { usedCount: { increment: 1 } },
    });
    await params.tx.couponUsage.create({
      data: {
        couponId: params.couponId,
        userId: params.userId,
        orderId: params.orderId,
        discountAmount: tomanNumberToBigInt(params.discountAmount),
      },
    });
    await params.tx.auditLog.create({
      data: {
        action: 'coupon.redeemed',
        actorId: params.userId,
        context: {
          couponId: params.couponId,
          code: params.code,
          orderId: params.orderId,
          discountAmount: params.discountAmount,
        },
      },
    });
  }

  async listCoupons(query: CouponQueryDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const skip = (page - 1) * limit;
    const [items, total] = await this.couponsRepository.listCoupons(skip, limit, query);
    return { page, limit, total, items };
  }

  async getCouponById(id: string) {
    const coupon = await this.prisma.discountCoupon.findFirst({
      where: { id, deletedAt: null },
      include: {
        usages: {
          orderBy: { usedAt: 'desc' },
          take: 100,
          include: {
            user: { select: { id: true, fullName: true, email: true } },
            order: { select: { id: true, orderNumber: true } },
          },
        },
      },
    });
    if (!coupon) {
      throw new NotFoundException('Coupon not found');
    }
    return coupon;
  }

  async createCoupon(payload: CreateCouponDto, actorId: string) {
    const code = this.normalizeCode(payload.code);
    const exists = await this.couponsRepository.findByCode(code);
    if (exists) {
      throw new BadRequestException('کد تخفیف تکراری است.');
    }
    const created = await this.couponsRepository.createCoupon({
      code,
      title: payload.title.trim(),
      description: payload.description?.trim(),
      isActive: payload.isActive ?? true,
      startsAt: payload.startsAt ? new Date(payload.startsAt) : null,
      expiresAt: payload.expiresAt ? new Date(payload.expiresAt) : null,
      discountType: payload.discountType,
      discountValue: payload.discountValue,
      minimumOrderAmount: payload.minimumOrderAmount
        ? tomanNumberToBigInt(payload.minimumOrderAmount)
        : null,
      maximumDiscountAmount: payload.maximumDiscountAmount
        ? tomanNumberToBigInt(payload.maximumDiscountAmount)
        : null,
      usageLimitTotal: payload.usageLimitTotal ?? null,
      usageLimitPerUser: payload.usageLimitPerUser ?? null,
      isFirstPurchaseOnly: payload.isFirstPurchaseOnly ?? false,
      allowWithOtherCoupons: payload.allowWithOtherCoupons ?? false,
      applicableCategories: payload.applicableCategories ?? [],
      applicableProducts: payload.applicableProducts ?? [],
      excludedCategories: payload.excludedCategories ?? [],
      excludedProducts: payload.excludedProducts ?? [],
      applicableUsers: payload.applicableUsers ?? [],
      excludedUsers: payload.excludedUsers ?? [],
      customerGroup: payload.customerGroup ?? null,
      createdBy: actorId,
      updatedBy: actorId,
    });
    await this.writeAudit('coupon.created', actorId, { couponId: created.id, code: created.code });
    return created;
  }

  async updateCoupon(id: string, payload: UpdateCouponDto, actorId: string) {
    const current = await this.getCouponById(id);
    if (payload.code && payload.code !== current.code) {
      const duplicate = await this.couponsRepository.findByCode(this.normalizeCode(payload.code));
      if (duplicate) {
        throw new BadRequestException('کد تخفیف تکراری است.');
      }
    }
    const updated = await this.couponsRepository.updateCoupon(id, {
      code: payload.code ? this.normalizeCode(payload.code) : undefined,
      title: payload.title?.trim(),
      description: payload.description?.trim(),
      isActive: payload.isActive,
      startsAt: payload.startsAt ? new Date(payload.startsAt) : undefined,
      expiresAt: payload.expiresAt ? new Date(payload.expiresAt) : undefined,
      discountType: payload.discountType,
      discountValue: payload.discountValue,
      minimumOrderAmount:
        payload.minimumOrderAmount !== undefined
          ? payload.minimumOrderAmount === null
            ? null
            : tomanNumberToBigInt(payload.minimumOrderAmount)
          : undefined,
      maximumDiscountAmount:
        payload.maximumDiscountAmount !== undefined
          ? payload.maximumDiscountAmount === null
            ? null
            : tomanNumberToBigInt(payload.maximumDiscountAmount)
          : undefined,
      usageLimitTotal: payload.usageLimitTotal,
      usageLimitPerUser: payload.usageLimitPerUser,
      isFirstPurchaseOnly: payload.isFirstPurchaseOnly,
      allowWithOtherCoupons: payload.allowWithOtherCoupons,
      applicableCategories: payload.applicableCategories as ProductCategory[] | undefined,
      applicableProducts: payload.applicableProducts,
      excludedCategories: payload.excludedCategories as ProductCategory[] | undefined,
      excludedProducts: payload.excludedProducts,
      applicableUsers: payload.applicableUsers,
      excludedUsers: payload.excludedUsers,
      customerGroup: payload.customerGroup,
      updatedBy: actorId,
    });
    await this.writeAudit('coupon.updated', actorId, { couponId: id, code: updated.code });
    return updated;
  }

  async softDeleteCoupon(id: string, actorId: string) {
    await this.getCouponById(id);
    const deleted = await this.couponsRepository.softDeleteCoupon(id, actorId);
    await this.writeAudit('coupon.deleted', actorId, { couponId: id, code: deleted.code });
    return { success: true };
  }

  async toggleCoupon(id: string, isActive: boolean, actorId: string) {
    await this.getCouponById(id);
    const updated = await this.couponsRepository.updateCoupon(id, { isActive, updatedBy: actorId });
    await this.writeAudit('coupon.toggled', actorId, { couponId: id, isActive });
    return updated;
  }

  async duplicateCoupon(id: string, actorId: string) {
    const source = await this.getCouponById(id);
    const randomSuffix = Math.random().toString(36).slice(2, 8).toUpperCase();
    const duplicated = await this.couponsRepository.duplicateCoupon(
      source,
      `${source.code}_${randomSuffix}`,
      actorId,
    );
    await this.writeAudit('coupon.duplicated', actorId, {
      sourceCouponId: id,
      duplicatedCouponId: duplicated.id,
    });
    return duplicated;
  }
}
