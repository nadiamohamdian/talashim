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
    const where = this.buildAdminReviewWhere(status, search);

    return Promise.all([
      this.prisma.productReview.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: this.adminReviewSelect,
      }),
      this.prisma.productReview.count({ where }),
    ]);
  }

  listGroupedByProduct(
    skip: number,
    limit: number,
    status?: ProductReviewStatus,
    search?: string,
  ) {
    const where = this.buildAdminReviewWhere(status, search);

    return this.prisma.productReview
      .groupBy({
        by: ['productId'],
        where,
        _count: { _all: true },
        _avg: { rating: true },
        _max: { createdAt: true },
        orderBy: { _max: { createdAt: 'desc' } },
      })
      .then(async (grouped) => {
        const total = grouped.length;
        const pageSlice = grouped.slice(skip, skip + limit);
        const productIds = pageSlice.map((row) => row.productId);

        if (productIds.length === 0) {
          return { total, groups: [] as const };
        }

        const trimmedSearch = search?.trim();
        const reviewWhere: Prisma.ProductReviewWhereInput = {
          productId: { in: productIds },
          ...(status ? { status } : {}),
          ...(trimmedSearch
            ? {
                OR: [
                  { body: { contains: trimmedSearch, mode: 'insensitive' as const } },
                  { phone: { contains: trimmedSearch } },
                  { product: { title: { contains: trimmedSearch, mode: 'insensitive' as const } } },
                  { product: { slug: { contains: trimmedSearch, mode: 'insensitive' as const } } },
                ],
              }
            : {}),
        };

        const [products, reviews] = await Promise.all([
          this.prisma.product.findMany({
            where: { id: { in: productIds } },
            select: { id: true, title: true, slug: true },
          }),
          this.prisma.productReview.findMany({
            where: reviewWhere,
            orderBy: { createdAt: 'desc' },
            select: this.adminReviewSelect,
          }),
        ]);

        const productById = new Map(products.map((product) => [product.id, product]));
        const reviewsByProduct = new Map<string, typeof reviews>();
        for (const review of reviews) {
          const bucket = reviewsByProduct.get(review.product.id) ?? [];
          bucket.push(review);
          reviewsByProduct.set(review.product.id, bucket);
        }

        const groups = pageSlice
          .map((row) => {
            const product = productById.get(row.productId);
            if (!product) {
              return null;
            }

            return {
              product,
              reviewCount: row._count._all,
              averageRating: row._avg.rating ?? 0,
              reviews: reviewsByProduct.get(row.productId) ?? [],
            };
          })
          .filter((group): group is NonNullable<typeof group> => group !== null);

        return { total, groups };
      });
  }

  /** @deprecated Use listGroupedByProduct */
  listApprovedGroupedByProduct(skip: number, limit: number, search?: string) {
    return this.listGroupedByProduct(skip, limit, ProductReviewStatus.APPROVED, search);
  }

  private buildAdminReviewWhere(
    status?: ProductReviewStatus,
    search?: string,
  ): Prisma.ProductReviewWhereInput {
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

    return conditions.length > 0 ? { AND: conditions } : {};
  }

  updateReviewStatus(id: string, status: ProductReviewStatus) {
    return this.prisma.productReview.update({
      where: { id },
      data: { status },
      select: this.adminReviewSelect,
    });
  }

  updateReview(
    id: string,
    data: {
      body?: string;
      rating?: number;
      authorName?: string;
      status?: ProductReviewStatus;
    },
  ) {
    return this.prisma.productReview.update({
      where: { id },
      data,
      select: this.adminReviewSelect,
    });
  }

  deleteReview(id: string) {
    return this.prisma.productReview.delete({
      where: { id },
      select: { id: true, productId: true },
    });
  }

  createAdminReview(data: {
    productId: string;
    body: string;
    rating: number;
    authorName?: string;
    phone: string;
    status: ProductReviewStatus;
  }) {
    return this.prisma.productReview.create({
      data: {
        productId: data.productId,
        body: data.body,
        rating: data.rating,
        authorName: data.authorName,
        phone: data.phone,
        status: data.status,
      },
      select: this.adminReviewSelect,
    });
  }

  private readonly adminReviewSelect = {
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
  } as const;
}
