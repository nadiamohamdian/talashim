import { Injectable } from '@nestjs/common';
import { OrderStatus, Prisma } from '@/generated/prisma';
import { PrismaService } from '@/infrastructure/database/prisma.service';

@Injectable()
export class AdminOrdersRepository {
  constructor(private readonly prisma: PrismaService) {}

  listOrders(
    skip: number,
    take: number,
    filters: {
      search?: string;
      status?: OrderStatus;
      from?: Date;
      to?: Date;
    },
  ) {
    const where: Prisma.OrderWhereInput = {};

    if (filters.status) {
      where.status = filters.status;
    }
    if (filters.from || filters.to) {
      where.createdAt = {};
      if (filters.from) {
        where.createdAt.gte = filters.from;
      }
      if (filters.to) {
        where.createdAt.lte = filters.to;
      }
    }
    if (filters.search?.trim()) {
      where.OR = [
        { orderNumber: { contains: filters.search.trim(), mode: 'insensitive' } },
        { user: { email: { contains: filters.search.trim(), mode: 'insensitive' } } },
        { user: { fullName: { contains: filters.search.trim(), mode: 'insensitive' } } },
      ];
    }

    return this.prisma.$transaction([
      this.prisma.order.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: 'desc' },
        include: {
          user: { select: { id: true, email: true, fullName: true } },
          _count: { select: { items: true } },
          payments: {
            select: { id: true, status: true, receiptUrl: true },
            orderBy: { createdAt: 'desc' },
            take: 1,
          },
        },
      }),
      this.prisma.order.count({ where }),
    ]);
  }

  findOrderById(id: string) {
    return this.prisma.order.findUnique({
      where: { id },
      include: this.orderDetailInclude(),
    });
  }

  private orderDetailInclude() {
    return {
      user: {
        select: {
          id: true,
          email: true,
          fullName: true,
          firstName: true,
          lastName: true,
          phone: true,
          nationalId: true,
          kycVerification: { select: { phone: true, nationalId: true } },
        },
      },
      shippingAddress: true,
      items: {
        include: {
          product: {
            select: {
              id: true,
              title: true,
              slug: true,
              sku: true,
              weightGram: true,
              karat: true,
              makingFeePercent: true,
            },
          },
        },
      },
      payments: { orderBy: { createdAt: 'desc' as const } },
    };
  }

  updateOrderStatus(id: string, status: OrderStatus) {
    return this.prisma.order.update({
      where: { id },
      data: { status },
      include: this.orderDetailInclude(),
    });
  }
}
