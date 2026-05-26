import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/infrastructure/database/prisma.service';

@Injectable()
export class InventoryRepository {
  constructor(private readonly prisma: PrismaService) {}

  findByProductId(productId: string) {
    return this.prisma.inventoryItem.findUnique({
      where: { productId },
      include: { product: true },
    });
  }

  updateReserved(productId: string, quantity: number) {
    return this.prisma.inventoryItem.update({
      where: { productId },
      data: {
        reserved: {
          increment: quantity,
        },
      },
    });
  }
}
