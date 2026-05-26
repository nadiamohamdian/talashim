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

    return this.cartRepository.findCartById(cart.id);
  }

  async getCart(cartId: string) {
    const cart = await this.cartRepository.findCartById(cartId);

    if (!cart) {
      throw new NotFoundException('Cart not found');
    }

    return cart;
  }
}
