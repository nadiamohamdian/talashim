import {
  CartStatus,
  OrderStatus,
  PaymentStatus,
  Prisma,
} from '@/generated/prisma';
import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/infrastructure/database/prisma.service';

@Injectable()
export class OrdersRepository {
  constructor(private readonly prisma: PrismaService) {}

  createFromCart(payload: {
    cartId: string;
    userId?: string;
    paymentProvider: string;
    subtotalToman: number;
    taxToman: number;
    totalToman: number;
    items: Array<{
      productId: string;
      quantity: number;
      unitPriceToman: number;
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
}
