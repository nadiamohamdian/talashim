import { CartStatus, OrderStatus, PaymentStatus, Prisma } from '@/generated/prisma';
import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/infrastructure/database/prisma.service';

@Injectable()
export class OrdersRepository {
  constructor(private readonly prisma: PrismaService) {}

  createFromCart(payload: {
    cartId: string;
    userId?: string;
    paymentProvider: string;
    subtotalToman: bigint;
    taxToman: bigint;
    totalToman: bigint;
    items: Array<{
      productId: string;
      quantity: number;
      unitPriceToman: bigint;
    }>;
  }) {
    return this.prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      const order = await tx.order.create({
        data: {
          orderNumber: `SG-${Date.now()}`,
          userId: payload.userId,
          status: OrderStatus.PENDING,
          subtotalToman: payload.subtotalToman,
          taxToman: payload.taxToman,
          totalToman: payload.totalToman,
          items: {
            create: payload.items,
          },
          payments: {
            create: {
              provider: payload.paymentProvider,
              status: PaymentStatus.PENDING,
              amountToman: payload.totalToman,
            },
          },
        },
        include: {
          items: true,
          payments: true,
        },
      });

      await tx.cart.update({
        where: { id: payload.cartId },
        data: { status: CartStatus.CHECKED_OUT },
      });

      return order;
    });
  }

  findByUserId(userId: string, skip: number, take: number, status?: OrderStatus) {
    const where: Prisma.OrderWhereInput = { userId, status };
    return Promise.all([
      this.prisma.order.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: 'desc' },
        include: {
          items: { include: { product: { select: { title: true, slug: true } } } },
        },
      }),
      this.prisma.order.count({ where }),
    ]);
  }

  countActiveByUserId(userId: string) {
    return this.prisma.order.count({
      where: {
        userId,
        status: { in: [OrderStatus.PENDING, OrderStatus.CONFIRMED] },
      },
    });
  }

  findByIdForUser(orderId: string, userId: string) {
    return this.prisma.order.findFirst({
      where: { id: orderId, userId },
      include: {
        items: { include: { product: { select: { title: true, slug: true } } } },
        payments: true,
      },
    });
  }
}
