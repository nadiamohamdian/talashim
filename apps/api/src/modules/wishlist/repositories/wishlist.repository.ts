import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/infrastructure/database/prisma.service';

@Injectable()
export class WishlistRepository {
  constructor(private readonly prisma: PrismaService) {}

  findByUserId(userId: string) {
    return this.prisma.wishlistItem.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      include: {
        product: { include: { inventoryItem: true } },
      },
    });
  }

  findEntry(userId: string, productId: string) {
    return this.prisma.wishlistItem.findUnique({
      where: { userId_productId: { userId, productId } },
    });
  }

  add(userId: string, productId: string) {
    return this.prisma.wishlistItem.create({
      data: { userId, productId },
      include: { product: { include: { inventoryItem: true } } },
    });
  }

  remove(userId: string, productId: string) {
    return this.prisma.wishlistItem.delete({
      where: { userId_productId: { userId, productId } },
    });
  }
}
