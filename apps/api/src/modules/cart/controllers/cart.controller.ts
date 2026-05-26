import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { UpsertCartItemDto } from '../dto/upsert-cart-item.dto';
import { CartService } from '../services/cart.service';

@ApiTags('cart')
@Controller('cart')
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Get(':cartId')
  getCart(@Param('cartId') cartId: string) {
    return this.cartService.getCart(cartId);
  }

  @Post('items')
  upsertItem(@Body() payload: UpsertCartItemDto) {
    return this.cartService.upsertItem(payload);
  }
}
