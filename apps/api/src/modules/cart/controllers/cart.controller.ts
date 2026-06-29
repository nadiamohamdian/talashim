import { Body, Controller, Delete, Get, Param, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '@/common/decorators/current-user.decorator';
import type { AuthenticatedUser } from '@/common/interfaces/auth-user.interface';
import { ApiProtected } from '@/swagger/decorators/api-protected.decorator';
import { UpsertCartItemDto } from '../dto/upsert-cart-item.dto';
import { CartService } from '../services/cart.service';

@ApiTags('cart')
@ApiProtected()
@Controller('cart')
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Get('me')
  getMyCart(@CurrentUser() user: AuthenticatedUser) {
    return this.cartService.getCartForUser(user.id);
  }

  @Get(':cartId')
  getCart(@CurrentUser() user: AuthenticatedUser, @Param('cartId') cartId: string) {
    return this.cartService.getCartForUserById(user.id, cartId);
  }

  @Post('items')
  upsertItem(
    @CurrentUser() user: AuthenticatedUser,
    @Body() payload: UpsertCartItemDto,
  ) {
    return this.cartService.upsertItem({
      ...payload,
      userId: payload.userId ?? user.id,
    });
  }

  @Delete('items/:productId')
  removeItem(
    @CurrentUser() user: AuthenticatedUser,
    @Param('productId') productId: string,
  ) {
    return this.cartService.removeItem(user.id, productId);
  }
}