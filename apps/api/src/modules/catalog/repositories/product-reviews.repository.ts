import { Injectable } from '@nestjs/common';
import { ProductReviewStatus, type Prisma } from '@/generated/prisma';
import { PrismaService } from '@/infrastructure/database/prisma.service';

@Injectable()
export class ProductReviewsRepository {
  constructor(private readonly prisma: PrismaService) {}

  findProductIdBySlug(slug: string) {
    return this.prisma.product.findUnique({
      where: { slug },
      select: { id: true, title: true },
    });
  }

  findRecentPendingByPhone(productId: string, phone: string, since: Date) {
    return this.prisma.productReview.findFirst({
      where: {
        productId,
        phone,
        status: ProductReviewStatus.PENDING,
        createdAt: { gte: since },
      },
      select: { id: true },
    });
  }

  createReview(data: {
    productId: string;
    userId?: string;
    authorName?: string;
    phone: string;
    body: string;
    rating: number;
  }) {
    return this.prisma.productReview.create({
      data: {
        productId: data.productId,
        userId: data.userId,
        authorName: data.authorName,
        phone: data.phone,
        body: data.body,
        rating: data.rating,
        status: ProductReviewStatus.PENDING,
      },
      select: {
        id: true,
        rating: true,
        status: true,
        createdAt: true,
      },
    });
  }

  findApprovedByProductId(productId: string, limit: number) {
    return this.prisma.productReview.findMany({
      where: {
        productId,
        status: ProductReviewStatus.APPROVED,
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
      select: {
        id: true,
        authorName: true,
        body: true,
        rating: true,
        createdAt: true,
      },
    });
  }

  listForAdmin(
    skip: number,
    limit: number,
    status?: ProductReviewStatus,
    search?: string,
  ) {
    const conditions: Prisma.ProductReviewWhereInput[] = [];

    if (status) {
      conditions.push({ status });
    }

    const trimmedSearch = search?.trim();
    if (trimmedSearch) {
      conditions.push({
        OR: [
          { body: { contains: trimmedSearch, mode: 'insensitive' } },
          { phone: { contains: trimmedSearch } },
          { product: { title: { contains: trimmedSearch, mode: 'insensitive' } } },
          { product: { slug: { contains: trimmedSearch, mode: 'insensitive' } } },
        ],
      });
    }

    const where = conditions.length > 0 ? { AND: conditions } : {};

    return Promise.all([
      this.prisma.productReview.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          body: true,
          rating: true,
          status: true,
          phone: true,
          authorName: true,
          createdAt: true,
          product: {
            select: {
              id: true,
              title: true,
              slug: true,
            },
          },
        },
      }),
      this.prisma.productReview.count({ where }),
    ]);
  }

  updateReviewStatus(id: string, status: ProductReviewStatus) {
    return this.prisma.productReview.update({
      where: { id },
      data: { status },
      select: {
        id: true,
        body: true,
        rating: true,
        status: true,
        phone: true,
        authorName: true,
        createdAt: true,
        product: {
          select: {
            id: true,
            title: true,
            slug: true,
          },
        },
      },
    });
  }
}
