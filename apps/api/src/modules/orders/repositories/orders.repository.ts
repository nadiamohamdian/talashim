import { Injectable } from '@nestjs/common';
import { CartStatus, OrderStatus, PaymentStatus, Prisma } from '@/generated/prisma';
import { PrismaService } from '@/infrastructure/database/prisma.service';

@Injectable()
export class OrdersRepository {
  constructor(private readonly prisma: PrismaService) {}

  createFromCart(payload: {
    cartId: string;
    userId?: string;
    shippingAddressId?: string;
    paymentProvider: string;
    paymentStatus: PaymentStatus;
    isInsured: boolean;
    insuranceFeeToman: bigint;
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
          status: OrderStatus.PENDING,
          isInsured: payload.isInsured,
          insuranceFeeToman: payload.insuranceFeeToman,
          subtotalToman: payload.subtotalToman,
          taxToman: payload.taxToman,
          totalToman: payload.totalToman,
          ...(payload.userId
            ? { user: { connect: { id: payload.userId } } }
            : {}),
          ...(payload.shippingAddressId
            ? { shippingAddress: { connect: { id: payload.shippingAddressId } } }
            : {}),
          items: {
            create: payload.items,
          },
          payments: {
            create: {
              provider: payload.paymentProvider,
              status: payload.paymentStatus,
              amountToman: payload.totalToman,
            },
          },
        },
        include: {
          items: { include: { product: { select: { title: true, slug: true } } } },
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

  findPaymentForUser(orderId: string, paymentId: string, userId: string) {
    return this.prisma.payment.findFirst({
      where: {
        id: paymentId,
        orderId,
        order: { userId },
      },
    });
  }

  submitPaymentReceipt(paymentId: string, receiptUrl: string) {
    return this.prisma.payment.update({
      where: { id: paymentId },
      data: {
        receiptUrl,
        receiptUploadedAt: new Date(),
        status: PaymentStatus.RECEIPT_SUBMITTED,
        rejectionReason: null,
      },
    });
  }

  approvePaymentReceipt(paymentId: string, reviewedById: string) {
    return this.prisma.$transaction(async (tx) => {
      const payment = await tx.payment.update({
        where: { id: paymentId },
        data: {
          status: PaymentStatus.PAID,
          reviewedAt: new Date(),
          reviewedById,
        },
      });

      await tx.order.update({
        where: { id: payment.orderId },
        data: { status: OrderStatus.CONFIRMED },
      });

      return payment;
    });
  }

  rejectPaymentReceipt(paymentId: string, reviewedById: string, reason: string) {
    return this.prisma.payment.update({
      where: { id: paymentId },
      data: {
        status: PaymentStatus.AWAITING_RECEIPT,
        reviewedAt: new Date(),
        reviewedById,
        rejectionReason: reason,
        receiptUrl: null,
        receiptUploadedAt: null,
      },
    });
  }

  findPaymentById(paymentId: string) {
    return this.prisma.payment.findUnique({ where: { id: paymentId } });
  }

  findById(id: string) {
    return this.prisma.order.findUnique({
      where: { id },
      include: {
        user: { select: { id: true, email: true, fullName: true } },
        items: {
          include: {
            product: { select: { id: true, title: true, slug: true, sku: true } },
          },
        },
        payments: true,
        _count: { select: { items: true } },
      },
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
          payments: { orderBy: { createdAt: 'desc' }, take: 1 },
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
