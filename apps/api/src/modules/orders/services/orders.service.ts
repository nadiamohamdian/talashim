import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CartRepository } from '@/modules/cart/repositories/cart.repository';
import { OrdersRepository } from '../repositories/orders.repository';
import type { CreateOrderDto } from '../dto/create-order.dto';

@Injectable()
export class OrdersService {
  constructor(
    private readonly cartRepository: CartRepository,
    private readonly ordersRepository: OrdersRepository,
  ) {}

  async checkout(payload: CreateOrderDto) {
    const cart = await this.cartRepository.findCartById(payload.cartId);

    if (!cart) {
      throw new NotFoundException('Cart not found');
    }

    if (!cart.items.length) {
      throw new BadRequestException('Cart is empty');
    }

    const subtotalToman = cart.items.reduce(
      (sum: number, item: { quantity: number; unitPriceToman: number }) =>
        sum + item.quantity * item.unitPriceToman,
      0,
    );
    const taxToman = Math.round(subtotalToman * 0.09);

    return this.ordersRepository.createFromCart({
      cartId: cart.id,
      userId: payload.userId ?? cart.userId ?? undefined,
      paymentProvider: payload.paymentProvider,
      subtotalToman,
      taxToman,
      totalToman: subtotalToman + taxToman,
      items: cart.items.map(
        (item: {
          productId: string;
          quantity: number;
          unitPriceToman: number;
        }) => ({
          productId: item.productId,
          quantity: item.quantity,
          unitPriceToman: item.unitPriceToman,
        }),
      ),
    });
  }
}
