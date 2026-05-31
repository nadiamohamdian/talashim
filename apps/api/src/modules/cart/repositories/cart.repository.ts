import { CartStatus } from '@/generated/prisma';
import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/infrastructure/database/prisma.service';

@Injectable()
export class CartRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findOrCreateActiveCart(userId?: string, sessionKey?: string) {
    const cart = await this.prisma.cart.findFirst({
      where: {
        userId,
        sessionKey,
        status: CartStatus.ACTIVE,
      },
      include: {
        items: {
          include: { product: true },
        },
      },
    });

    if (cart) {
      return cart;
    }

    return this.prisma.cart.create({
      data: {
        userId,
        sessionKey,
      },
      include: {
        items: {
          include: { product: true },
        },
      },
    });
  }

  async upsertCartItem(
    cartId: string,
    productId: string,
    quantity: number,
    unitPriceToman: number,
  ) {
    const existingItem = await this.prisma.cartItem.findUnique({
      where: {
        cartId_productId: {
          cartId,
          productId,
        },
      },
    });

    if (existingItem) {
      return this.prisma.cartItem.update({
        where: { id: existingItem.id },
        data: {
          quantity,
          unitPriceToman,
        },
      });
    }

    return this.prisma.cartItem.create({
      data: {
        cartId,
        productId,
        quantity,
        unitPriceToman,
      },
    });
  }

  findCartById(cartId: string) {
    return this.prisma.cart.findUnique({
      where: { id: cartId },
      include: {
        items: {
          include: { product: true },
        },
      },
    });
  }

  findActiveCartByUserId(userId: string) {
    return this.prisma.cart.findFirst({
      where: { userId, status: CartStatus.ACTIVE },
      include: {
        items: { include: { product: true } },
      },
    });
  }

  removeCartItem(cartId: string, productId: string) {
    return this.prisma.cartItem.deleteMany({
      where: { cartId, productId },
    });
  }
}
