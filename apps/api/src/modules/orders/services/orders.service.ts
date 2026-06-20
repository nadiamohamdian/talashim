import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CartStatus, OrderStatus, PaymentStatus } from '@/generated/prisma';
import type { CheckoutPaymentProvider } from '@sadafgold/shared';
import {
  assertFeatureEnabled,
  getEnabledCheckoutProviders,
  getFreeShippingMinToman,
  getMinOrderToman,
  getShippingInsurancePercent,
} from '@/common/platform-settings/platform-settings-helpers';
import { getPlatformSettings } from '@/common/platform-settings/platform-settings-runtime';
import {
  buildOrderLinePricingSnapshot,
  calculateInsuranceFeeToman,
  calculateShippingFeeToman,
  reconstructOrderLinePricing,
} from '@sadafgold/shared';
import { PricingEngineService } from '@/modules/pricing/services/pricing-engine.service';
import { CartRepository } from '@/modules/cart/repositories/cart.repository';
import { AddressesRepository } from '@/modules/addresses/repositories/addresses.repository';
import {
  MediaStorageService,
  type UploadedImageFile,
} from '@/infrastructure/media/media-storage.service';
import { WalletService } from '@/modules/wallet/services/wallet.service';
import { UsersService } from '@/modules/users/services/users.service';
import { CouponsService } from '@/modules/discounts/services/coupons.service';
import { OrdersRepository } from '../repositories/orders.repository';
import type { CreateOrderDto } from '../dto/create-order.dto';
import type { OrdersQueryDto } from '../dto/orders-query.dto';
import type { SetInvoiceRecipientDto } from '../dto/set-invoice-recipient.dto';
import {
  tomanBigIntToNumber,
  tomanNumberToBigInt,
} from '@/common/finance/toman-amount';
import type { OrderDetail, PaymentStatus as ApiPaymentStatus } from '@sadafgold/types';

function toApiPaymentStatus(status: PaymentStatus): ApiPaymentStatus {
  return status.toLowerCase() as ApiPaymentStatus;
}

function resolveInitialPaymentStatus(provider: CheckoutPaymentProvider): PaymentStatus {
  if (provider === 'card_to_card') {
    return PaymentStatus.AWAITING_RECEIPT;
  }
  if (provider === 'credit') {
    return PaymentStatus.AUTHORIZED;
  }
  return PaymentStatus.PENDING;
}

@Injectable()
export class OrdersService {
  constructor(
    private readonly cartRepository: CartRepository,
    private readonly ordersRepository: OrdersRepository,
    private readonly addressesRepository: AddressesRepository,
    private readonly mediaStorage: MediaStorageService,
    private readonly walletService: WalletService,
    private readonly usersService: UsersService,
    private readonly pricingEngine: PricingEngineService,
    private readonly couponsService: CouponsService,
  ) {}

  async checkout(payload: CreateOrderDto) {
    const allowedProviders = getEnabledCheckoutProviders();
    if (!allowedProviders.includes(payload.paymentProvider as CheckoutPaymentProvider)) {
      throw new BadRequestException('روش پرداخت انتخاب‌شده فعال نیست');
    }

    const cart = await this.cartRepository.findCartById(payload.cartId);

    if (!cart) {
      throw new NotFoundException('Cart not found');
    }

    if (!cart.items.length) {
      throw new BadRequestException('Cart is empty');
    }

    if (cart.status !== CartStatus.ACTIVE) {
      throw new BadRequestException('Cart is no longer active');
    }

    const userId = payload.userId ?? cart.userId;
    if (!userId) {
      assertFeatureEnabled('enableGuestCheckout', 'خرید مهمان غیرفعال است — لطفاً وارد شوید');
      throw new BadRequestException('Checkout requires an authenticated user');
    }

    if (cart.userId && cart.userId !== userId) {
      throw new BadRequestException('Cart does not belong to this user');
    }

    const address = await this.addressesRepository.findByIdForUser(
      payload.shippingAddressId,
      userId,
    );
    if (!address) {
      throw new NotFoundException('Shipping address not found');
    }

    const profile = await this.usersService.getProfile(userId);

    const settings = getPlatformSettings();
    if (settings.featureFlags.requireKycForCheckout && profile.kycStatus !== 'approved') {
      throw new ForbiddenException('برای تکمیل خرید، احراز هویت (KYC) باید تأیید شده باشد');
    }

    const subtotalToman = cart.items.reduce(
      (sum, item) => sum + item.quantity * tomanBigIntToNumber(item.unitPriceToman),
      0,
    );
    const minOrder = getMinOrderToman();
    if (subtotalToman < minOrder) {
      throw new BadRequestException(`حداقل مبلغ سفارش ${minOrder.toLocaleString('fa-IR')} تومان است`);
    }

    let discountToman = 0;
    let couponId: string | undefined;
    let couponCode: string | undefined;
    if (payload.couponCode?.trim()) {
      const couponValidation = await this.couponsService.validateForCheckout(
        payload.couponCode,
        cart.id,
        userId,
        { throwOnFailure: true },
      );
      discountToman = couponValidation.discountAmount;
      couponId = couponValidation.couponId;
      couponCode = couponValidation.couponCode;
    }

    const discountedSubtotalToman = Math.max(subtotalToman - discountToman, 0);
    const taxPercent = getPlatformSettings().commerce.defaultTaxPercent;
    const taxToman = Math.round(discountedSubtotalToman * (taxPercent / 100));
    const liveGold18 = await this.pricingEngine.getLivePrice('XAU-IRR', 18);
    const liveGoldPrice18PerGramToman = Number(liveGold18.pricePerGram);
    const shippingToman = calculateShippingFeeToman(discountedSubtotalToman, getFreeShippingMinToman());
    const isInsured = payload.isInsured === true;
    const insuranceFeeToman = calculateInsuranceFeeToman(
      discountedSubtotalToman,
      isInsured,
      getShippingInsurancePercent(),
    );
    const totalToman = discountedSubtotalToman + taxToman + shippingToman + insuranceFeeToman;
    const provider = payload.paymentProvider as CheckoutPaymentProvider;

    const orderItems = await Promise.all(
      cart.items.map(async (item) => {
        const product = item.product;
        const live = await this.pricingEngine.getLivePrice('XAU-IRR', product.karat);
        const snapshot = buildOrderLinePricingSnapshot({
          weightGram: Number(product.weightGram),
          karat: product.karat,
          makingFeePercent: product.makingFeePercent,
          livePricePerGramToman: Number(live.pricePerGram),
          taxPercent,
        });

        return {
          productId: item.productId,
          quantity: item.quantity,
          unitPriceToman: item.unitPriceToman,
          weightGram: Number(product.weightGram),
          karat: product.karat,
          makingFeePercent: product.makingFeePercent,
          liveGoldPricePerGramToman: tomanNumberToBigInt(snapshot.liveGoldPricePerGramToman),
          metalValueToman: tomanNumberToBigInt(snapshot.metalValueToman),
          wageToman: tomanNumberToBigInt(snapshot.wageToman),
        };
      }),
    );

    const created = await this.ordersRepository.createFromCart({
      cartId: cart.id,
      userId,
      shippingAddressId: address.id,
      paymentProvider: provider,
      paymentStatus: resolveInitialPaymentStatus(provider),
      isInsured,
      insuranceFeeToman: tomanNumberToBigInt(insuranceFeeToman),
      subtotalToman: tomanNumberToBigInt(discountedSubtotalToman),
      discountToman: tomanNumberToBigInt(discountToman),
      couponId,
      couponCode,
      taxToman: tomanNumberToBigInt(taxToman),
      taxPercent,
      liveGoldPrice18PerGramToman: tomanNumberToBigInt(liveGoldPrice18PerGramToman),
      totalToman: tomanNumberToBigInt(totalToman),
      items: orderItems,
    });

    const order = await this.ordersRepository.findByIdForUser(created.id, userId);
    if (!order) {
      throw new NotFoundException('Order not found after checkout');
    }

    return this.toDetail(order);
  }

  async uploadPaymentReceipt(
    userId: string,
    orderId: string,
    paymentId: string,
    file: UploadedImageFile,
  ) {
    const payment = await this.ordersRepository.findPaymentForUser(orderId, paymentId, userId);
    if (!payment) {
      throw new NotFoundException('Payment not found');
    }

    if (payment.provider !== 'card_to_card') {
      throw new BadRequestException('Receipt upload is only for card-to-card payments');
    }

    if (
      payment.status !== PaymentStatus.AWAITING_RECEIPT &&
      payment.status !== PaymentStatus.REJECTED
    ) {
      throw new BadRequestException('Receipt cannot be uploaded for this payment state');
    }

    const saved = await this.mediaStorage.saveReceipt(file);
    await this.ordersRepository.submitPaymentReceipt(paymentId, saved.url);

    return this.getForUser(userId, orderId);
  }

  async approvePaymentReceipt(orderId: string, paymentId: string, reviewedById: string) {
    const payment = await this.ordersRepository.findPaymentById(paymentId);
    if (!payment || payment.orderId !== orderId) {
      throw new NotFoundException('Payment not found');
    }
    if (payment.status !== PaymentStatus.RECEIPT_SUBMITTED) {
      throw new BadRequestException('Payment is not awaiting receipt review');
    }

    await this.ordersRepository.approvePaymentReceipt(paymentId, reviewedById);
    return { approved: true, paymentId, orderId };
  }

  syncSubmittedPaymentsOnOrderConfirm(orderId: string, reviewedById: string) {
    return this.ordersRepository.syncSubmittedPaymentsOnConfirm(orderId, reviewedById);
  }

  async rejectPaymentReceipt(
    orderId: string,
    paymentId: string,
    reviewedById: string,
    reason: string,
  ) {
    const payment = await this.ordersRepository.findPaymentById(paymentId);
    if (!payment || payment.orderId !== orderId) {
      throw new NotFoundException('Payment not found');
    }
    if (payment.status !== PaymentStatus.RECEIPT_SUBMITTED) {
      throw new BadRequestException('Payment is not awaiting receipt review');
    }

    await this.ordersRepository.rejectPaymentReceipt(paymentId, reviewedById, reason);
    return { rejected: true, paymentId, orderId };
  }

  async listForUser(userId: string, query: OrdersQueryDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const skip = (page - 1) * limit;
    const [orders, total] = await this.ordersRepository.findByUserId(
      userId,
      skip,
      limit,
      query.status,
    );
    return {
      page,
      limit,
      total,
      items: orders.map((order) => this.toSummary(order)),
    };
  }

  async getForUser(userId: string, orderId: string) {
    const order = await this.ordersRepository.findByIdForUser(orderId, userId);
    if (!order) {
      throw new NotFoundException('Order not found');
    }
    return this.toDetail(order);
  }

  mapOrderRecordToDetail(
    order: NonNullable<Awaited<ReturnType<OrdersRepository['findByIdForUser']>>>,
  ): OrderDetail {
    return this.toDetail(order);
  }

  async setInvoiceRecipient(userId: string, orderId: string, payload: SetInvoiceRecipientDto) {
    const order = await this.ordersRepository.findByIdForUser(orderId, userId);
    if (!order) {
      throw new NotFoundException('Order not found');
    }

    if (!this.isInvoiceReady(order)) {
      throw new BadRequestException('فاکتور این سفارش هنوز آماده صدور نیست');
    }

    const firstName = payload.firstName.trim();
    const lastName = payload.lastName.trim();

    const updated = await this.ordersRepository.updateInvoiceRecipient(
      orderId,
      userId,
      firstName,
      lastName,
    );

    if (updated.count === 0) {
      throw new NotFoundException('Order not found');
    }

    return this.getForUser(userId, orderId);
  }

  async getAccountSummary(userId: string) {
    const [activeOrders, totalOrders, balances, user] = await Promise.all([
      this.ordersRepository.countActiveByUserId(userId),
      this.ordersRepository.findByUserId(userId, 0, 1).then(([, total]) => total),
      this.walletService.getBalances(userId),
      this.usersService.getProfile(userId),
    ]);

    return {
      activeOrders,
      totalOrders,
      rialBalance: String(balances.rialBalance),
      goldBalanceGram: String(balances.goldBalanceGram),
      kycStatus: user.kycStatus ?? 'none',
    };
  }

  private isInvoiceReady(order: {
    status: OrderStatus;
    payments: Array<{ status: PaymentStatus }>;
  }): boolean {
    if (order.status === OrderStatus.CANCELLED || order.status === OrderStatus.PENDING) {
      return false;
    }

    const paymentStatus = this.resolvePaymentStatus(order.payments, order.status);
    return (
      order.status === OrderStatus.CONFIRMED ||
      order.status === OrderStatus.PAID ||
      paymentStatus === PaymentStatus.PAID
    );
  }

  private resolvePaymentStatus(
    payments: Array<{ status: PaymentStatus }> | undefined,
    orderStatus: OrderStatus,
  ): PaymentStatus | null {
    if (!payments?.length) {
      if (orderStatus === OrderStatus.CONFIRMED || orderStatus === OrderStatus.PAID) {
        return PaymentStatus.PAID;
      }
      return null;
    }

    const paidPayment = payments.find((payment) => payment.status === PaymentStatus.PAID);
    if (paidPayment) {
      return PaymentStatus.PAID;
    }

    if (orderStatus === OrderStatus.CONFIRMED || orderStatus === OrderStatus.PAID) {
      return PaymentStatus.PAID;
    }

    const priority: Record<PaymentStatus, number> = {
      [PaymentStatus.PAID]: 100,
      [PaymentStatus.AUTHORIZED]: 90,
      [PaymentStatus.RECEIPT_SUBMITTED]: 50,
      [PaymentStatus.AWAITING_RECEIPT]: 40,
      [PaymentStatus.PENDING]: 30,
      [PaymentStatus.REJECTED]: 20,
      [PaymentStatus.FAILED]: 10,
    };

    return payments.reduce((best, payment) =>
      priority[payment.status] > priority[best.status] ? payment : best,
    ).status;
  }

  private toSummary(order: {
    id: string;
    orderNumber: string;
    status: OrderStatus;
    subtotalToman: bigint | number;
    taxToman: bigint | number;
    discountToman?: bigint | number;
    couponCode?: string | null;
    isInsured: boolean;
    insuranceFeeToman: bigint | number;
    totalToman: bigint | number;
    invoiceFirstName?: string | null;
    invoiceLastName?: string | null;
    createdAt: Date;
    items: Array<{ quantity: number }>;
    payments?: Array<{ status: PaymentStatus }>;
  }) {
    const paymentStatus = this.resolvePaymentStatus(order.payments, order.status);
    return {
      id: order.id,
      orderNumber: order.orderNumber,
      status: order.status.toLowerCase() as 'pending' | 'confirmed' | 'paid' | 'cancelled',
      paymentStatus: paymentStatus ? toApiPaymentStatus(paymentStatus) : null,
      subtotalToman: tomanBigIntToNumber(order.subtotalToman),
      taxToman: tomanBigIntToNumber(order.taxToman),
      discountToman: tomanBigIntToNumber(order.discountToman ?? 0),
      couponCode: order.couponCode ?? null,
      isInsured: order.isInsured,
      insuranceFeeToman: tomanBigIntToNumber(order.insuranceFeeToman),
      totalToman: tomanBigIntToNumber(order.totalToman),
      itemCount: order.items.reduce((sum, item) => sum + item.quantity, 0),
      invoiceFirstName: order.invoiceFirstName ?? null,
      invoiceLastName: order.invoiceLastName ?? null,
      createdAt: order.createdAt.toISOString(),
    };
  }

  private mapOrderItemForInvoice(
    item: {
      id: string;
      productId: string;
      quantity: number;
      unitPriceToman: bigint | number;
      weightGram?: { toString(): string } | number | null;
      karat?: number | null;
      makingFeePercent?: number | null;
      liveGoldPricePerGramToman?: bigint | number | null;
      metalValueToman?: bigint | number | null;
      wageToman?: bigint | number | null;
      product: {
        title: string;
        slug: string;
        sku?: string;
        weightGram?: { toString(): string } | number;
        karat?: number;
        makingFeePercent?: number;
      };
    },
    orderTaxPercent: number,
  ) {
    const unitPriceToman = tomanBigIntToNumber(item.unitPriceToman);
    const weightGram =
      item.weightGram != null
        ? Number(item.weightGram)
        : Number(item.product.weightGram ?? 0);
    const karat = item.karat ?? item.product.karat ?? 18;
    const makingFeePercent = item.makingFeePercent ?? item.product.makingFeePercent ?? 0;

    const snapshot =
      item.metalValueToman != null &&
      item.wageToman != null &&
      item.liveGoldPricePerGramToman != null
        ? (() => {
            const metalValueToman = tomanBigIntToNumber(item.metalValueToman);
            const wageToman = tomanBigIntToNumber(item.wageToman);
            const liveGoldPricePerGramToman = tomanBigIntToNumber(item.liveGoldPricePerGramToman);
            const lineSubtotalToman = metalValueToman + wageToman;
            const purityFactor = karat / 18;
            return {
              weightGram,
              karat,
              makingFeePercent,
              liveGoldPricePerGramToman,
              liveGoldPrice18PerGramToman:
                purityFactor > 0
                  ? Math.round(liveGoldPricePerGramToman / purityFactor)
                  : 0,
              metalValueToman,
              wageToman,
              lineSubtotalToman,
              lineTaxToman: unitPriceToman - lineSubtotalToman,
              unitPriceToman,
            };
          })()
        : reconstructOrderLinePricing({
            unitPriceToman,
            weightGram,
            karat,
            makingFeePercent,
            taxPercent: orderTaxPercent,
          });

    return {
      id: item.id,
      productId: item.productId,
      productTitle: item.product.title,
      productSlug: item.product.slug,
      productSku: item.product.sku,
      quantity: item.quantity,
      ...snapshot,
      lineTotalToman: unitPriceToman * item.quantity,
      totalWeightGram: weightGram * item.quantity,
      totalMetalValueToman: snapshot.metalValueToman * item.quantity,
      totalWageToman: snapshot.wageToman * item.quantity,
      totalLineTaxToman: snapshot.lineTaxToman * item.quantity,
    };
  }

  private toDetail(order: {
    id: string;
    orderNumber: string;
    status: OrderStatus;
    subtotalToman: bigint | number;
    taxToman: bigint | number;
    discountToman?: bigint | number;
    couponCode?: string | null;
    taxPercent?: number | null;
    liveGoldPrice18PerGramToman?: bigint | number | null;
    isInsured: boolean;
    insuranceFeeToman: bigint | number;
    totalToman: bigint | number;
    invoiceFirstName?: string | null;
    invoiceLastName?: string | null;
    createdAt: Date;
    user?: {
      email: string;
      fullName: string;
      firstName: string | null;
      lastName: string | null;
      phone: string | null;
      nationalId: string | null;
    } | null;
    shippingAddress?: {
      id: string;
      title: string;
      recipient: string;
      phone: string;
      line1: string;
      city: string;
      state: string;
      postalCode: string;
    } | null;
    items: Array<{
      id: string;
      productId: string;
      quantity: number;
      unitPriceToman: bigint | number;
      weightGram?: { toString(): string } | number | null;
      karat?: number | null;
      makingFeePercent?: number | null;
      liveGoldPricePerGramToman?: bigint | number | null;
      metalValueToman?: bigint | number | null;
      wageToman?: bigint | number | null;
      product: {
        title: string;
        slug: string;
        sku?: string;
        weightGram?: { toString(): string } | number;
        karat?: number;
        makingFeePercent?: number;
      };
    }>;
    payments: Array<{
      id: string;
      status: PaymentStatus;
      provider: string;
      amountToman: bigint | number;
      receiptUrl?: string | null;
      rejectionReason?: string | null;
      reviewedAt?: Date | null;
      createdAt: Date;
    }>;
  }): OrderDetail {
    const paidPayment = order.payments.find((payment) => payment.status === PaymentStatus.PAID);
    const taxPercent = order.taxPercent ?? getPlatformSettings().commerce.defaultTaxPercent;
    const mappedItems = order.items.map((item) =>
      this.mapOrderItemForInvoice(item, taxPercent),
    );

    return {
      ...this.toSummary(order),
      taxPercent,
      discountToman: tomanBigIntToNumber(order.discountToman ?? 0),
      couponCode: order.couponCode ?? null,
      liveGoldPrice18PerGramToman: order.liveGoldPrice18PerGramToman
        ? tomanBigIntToNumber(order.liveGoldPrice18PerGramToman)
        : mappedItems[0]?.liveGoldPrice18PerGramToman ?? null,
      totalGoldWeightGram: mappedItems.reduce(
        (sum, item) => sum + (item.totalWeightGram ?? 0),
        0,
      ),
      totalMetalValueToman: mappedItems.reduce(
        (sum, item) => sum + (item.totalMetalValueToman ?? 0),
        0,
      ),
      totalWageToman: mappedItems.reduce((sum, item) => sum + (item.totalWageToman ?? 0), 0),
      items: mappedItems,
      shippingAddress: order.shippingAddress
        ? {
            id: order.shippingAddress.id,
            title: order.shippingAddress.title,
            recipient: order.shippingAddress.recipient,
            phone: order.shippingAddress.phone,
            line1: order.shippingAddress.line1,
            city: order.shippingAddress.city,
            state: order.shippingAddress.state,
            postalCode: order.shippingAddress.postalCode,
          }
        : null,
      customer: order.user
        ? {
            email: order.user.email,
            fullName: order.user.fullName,
            firstName: order.user.firstName,
            lastName: order.user.lastName,
            phone: order.user.phone,
            nationalId: order.user.nationalId,
          }
        : null,
      invoiceFirstName: order.invoiceFirstName ?? null,
      invoiceLastName: order.invoiceLastName ?? null,
      invoicePaidAt: paidPayment?.reviewedAt?.toISOString() ?? paidPayment?.createdAt.toISOString() ?? null,
      payments: order.payments.map((payment) => ({
        id: payment.id,
        status: toApiPaymentStatus(payment.status),
        provider: payment.provider,
        amountToman: tomanBigIntToNumber(payment.amountToman),
        receiptUrl: payment.receiptUrl ?? null,
        rejectionReason: payment.rejectionReason ?? null,
        reviewedAt: payment.reviewedAt?.toISOString() ?? null,
        createdAt: payment.createdAt.toISOString(),
      })),
    };
  }
}
