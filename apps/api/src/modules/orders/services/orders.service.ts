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
  getCheckoutTaxRate,
  getEnabledCheckoutProviders,
  getMinOrderToman,
} from '@/common/platform-settings/platform-settings-helpers';
import { getPlatformSettings } from '@/common/platform-settings/platform-settings-runtime';
import { CartRepository } from '@/modules/cart/repositories/cart.repository';
import { AddressesRepository } from '@/modules/addresses/repositories/addresses.repository';
import {
  MediaStorageService,
  type UploadedImageFile,
} from '@/infrastructure/media/media-storage.service';
import { WalletService } from '@/modules/wallet/services/wallet.service';
import { UsersService } from '@/modules/users/services/users.service';
import { OrdersRepository } from '../repositories/orders.repository';
import type { CreateOrderDto } from '../dto/create-order.dto';
import type { OrdersQueryDto } from '../dto/orders-query.dto';
import {
  tomanBigIntToNumber,
  tomanNumberToBigInt,
} from '@/common/finance/toman-amount';

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

    const taxToman = Math.round(subtotalToman * getCheckoutTaxRate());
    const provider = payload.paymentProvider as CheckoutPaymentProvider;

    const created = await this.ordersRepository.createFromCart({
      cartId: cart.id,
      userId,
      shippingAddressId: address.id,
      paymentProvider: provider,
      paymentStatus: resolveInitialPaymentStatus(provider),
      subtotalToman: tomanNumberToBigInt(subtotalToman),
      taxToman: tomanNumberToBigInt(taxToman),
      totalToman: tomanNumberToBigInt(subtotalToman + taxToman),
      items: cart.items.map((item) => ({
        productId: item.productId,
        quantity: item.quantity,
        unitPriceToman: item.unitPriceToman,
      })),
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

  private toSummary(order: {
    id: string;
    orderNumber: string;
    status: OrderStatus;
    subtotalToman: bigint | number;
    taxToman: bigint | number;
    totalToman: bigint | number;
    createdAt: Date;
    items: Array<{ quantity: number }>;
    payments?: Array<{ status: PaymentStatus }>;
  }) {
    const paymentStatus = order.payments?.[0]?.status;
    return {
      id: order.id,
      orderNumber: order.orderNumber,
      status: order.status.toLowerCase() as 'pending' | 'confirmed' | 'paid' | 'cancelled',
      paymentStatus: paymentStatus
        ? (paymentStatus.toLowerCase() as
            | 'pending'
            | 'awaiting_receipt'
            | 'receipt_submitted'
            | 'authorized'
            | 'paid'
            | 'failed'
            | 'rejected')
        : null,
      subtotalToman: tomanBigIntToNumber(order.subtotalToman),
      taxToman: tomanBigIntToNumber(order.taxToman),
      totalToman: tomanBigIntToNumber(order.totalToman),
      itemCount: order.items.reduce((sum, item) => sum + item.quantity, 0),
      createdAt: order.createdAt.toISOString(),
    };
  }

  private toDetail(order: {
    id: string;
    orderNumber: string;
    status: OrderStatus;
    subtotalToman: bigint | number;
    taxToman: bigint | number;
    totalToman: bigint | number;
    createdAt: Date;
    items: Array<{
      id: string;
      productId: string;
      quantity: number;
      unitPriceToman: bigint | number;
      product: { title: string; slug: string };
    }>;
    payments: Array<{
      id: string;
      status: PaymentStatus;
      provider: string;
      amountToman: bigint | number;
      receiptUrl?: string | null;
      rejectionReason?: string | null;
      createdAt: Date;
    }>;
  }) {
    return {
      ...this.toSummary(order),
      items: order.items.map((item) => ({
        id: item.id,
        productId: item.productId,
        productTitle: item.product.title,
        productSlug: item.product.slug,
        quantity: item.quantity,
        unitPriceToman: tomanBigIntToNumber(item.unitPriceToman),
      })),
      payments: order.payments.map((payment) => ({
        id: payment.id,
        status: payment.status.toLowerCase(),
        provider: payment.provider,
        amountToman: tomanBigIntToNumber(payment.amountToman),
        receiptUrl: payment.receiptUrl ?? null,
        rejectionReason: payment.rejectionReason ?? null,
        createdAt: payment.createdAt.toISOString(),
      })),
    };
  }
}
