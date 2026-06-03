import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { OrderStatus } from '@/generated/prisma';
import { CartRepository } from '@/modules/cart/repositories/cart.repository';
import { WalletService } from '@/modules/wallet/services/wallet.service';
import { UsersService } from '@/modules/users/services/users.service';
import { OrdersRepository } from '../repositories/orders.repository';
import type { CreateOrderDto } from '../dto/create-order.dto';
import type { OrdersQueryDto } from '../dto/orders-query.dto';
import {
  tomanBigIntToNumber,
  tomanNumberToBigInt,
} from '@/common/finance/toman-amount';

@Injectable()
export class OrdersService {
  constructor(
    private readonly cartRepository: CartRepository,
    private readonly ordersRepository: OrdersRepository,
    private readonly walletService: WalletService,
    private readonly usersService: UsersService,
  ) {}

  async checkout(payload: CreateOrderDto) {
    const cart = await this.cartRepository.findCartById(payload.cartId);

    if (!cart) {
      throw new NotFoundException('Cart not found');
    }

    if (!cart.items.length) {
      throw new BadRequestException('Cart is empty');
    }

    const subtotalToman = cart.items.reduce(
      (sum, item) => sum + item.quantity * tomanBigIntToNumber(item.unitPriceToman),
      0,
    );
    const taxToman = Math.round(subtotalToman * 0.09);

    return this.ordersRepository.createFromCart({
      cartId: cart.id,
      userId: payload.userId ?? cart.userId ?? undefined,
      paymentProvider: payload.paymentProvider,
      subtotalToman: tomanNumberToBigInt(subtotalToman),
      taxToman: tomanNumberToBigInt(taxToman),
      totalToman: tomanNumberToBigInt(subtotalToman + taxToman),
      items: cart.items.map((item) => ({
        productId: item.productId,
        quantity: item.quantity,
        unitPriceToman: item.unitPriceToman,
      })),
    });
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
  }) {
    return {
      id: order.id,
      orderNumber: order.orderNumber,
      status: order.status.toLowerCase(),
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
      status: string;
      provider: string;
      amountToman: bigint | number;
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
        createdAt: payment.createdAt.toISOString(),
      })),
    };
  }
}
