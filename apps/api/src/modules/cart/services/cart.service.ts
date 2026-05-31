import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CartRepository } from '../repositories/cart.repository';
import { CatalogRepository } from '@/modules/catalog/repositories/catalog.repository';
import type { UpsertCartItemDto } from '../dto/upsert-cart-item.dto';

@Injectable()
export class CartService {
  constructor(
    private readonly cartRepository: CartRepository,
    private readonly catalogRepository: CatalogRepository,
  ) {}

  async upsertItem(payload: UpsertCartItemDto) {
    if (!payload.userId && !payload.sessionKey) {
      throw new BadRequestException('userId or sessionKey is required');
    }

    const product = await this.catalogRepository.findById(payload.productId);

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    const cart = await this.cartRepository.findOrCreateActiveCart(
      payload.userId,
      payload.sessionKey,
    );

    await this.cartRepository.upsertCartItem(
      cart.id,
      product.id,
      payload.quantity,
      product.priceToman,
    );

    if (payload.userId) {
      return this.getCartForUser(payload.userId);
    }

    const updated = await this.cartRepository.findCartById(cart.id);
    return updated ? this.toCartResponse(updated) : { id: cart.id, items: [], subtotalToman: 0 };
  }

  async getCart(cartId: string) {
    const cart = await this.cartRepository.findCartById(cartId);

    if (!cart) {
      throw new NotFoundException('Cart not found');
    }

    return this.toCartResponse(cart);
  }

  async getCartForUser(userId: string) {
    const cart = await this.cartRepository.findActiveCartByUserId(userId);
    if (!cart) {
      return { id: null, items: [], subtotalToman: 0 };
    }
    return this.toCartResponse(cart);
  }

  async removeItem(userId: string, productId: string) {
    const cart = await this.cartRepository.findActiveCartByUserId(userId);
    if (!cart) {
      throw new NotFoundException('Cart not found');
    }
    await this.cartRepository.removeCartItem(cart.id, productId);
    return this.getCartForUser(userId);
  }

  private toCartResponse(cart: {
    id: string;
    items: Array<{
      id: string;
      productId: string;
      quantity: number;
      unitPriceToman: number;
      product: {
        slug: string;
        title: string;
        imageUrl: string;
        weightGram: { toString(): string };
      };
    }>;
  }) {
    const items = cart.items.map((item) => ({
      id: item.id,
      productId: item.productId,
      slug: item.product.slug,
      title: item.product.title,
      imageUrl: item.product.imageUrl,
      weightGram: Number(item.product.weightGram),
      quantity: item.quantity,
      unitPriceToman: item.unitPriceToman,
    }));
    const subtotalToman = items.reduce(
      (sum, item) => sum + item.quantity * item.unitPriceToman,
      0,
    );
    return { id: cart.id, items, subtotalToman };
  }
}
