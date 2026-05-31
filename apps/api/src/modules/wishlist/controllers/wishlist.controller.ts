import { Body, Controller, Delete, Get, Param, Post } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '@/common/decorators/current-user.decorator';
import type { AuthenticatedUser } from '@/common/interfaces/auth-user.interface';
import { ApiProtected } from '@/swagger/decorators/api-protected.decorator';
import { ToggleWishlistDto } from '../dto/toggle-wishlist.dto';
import { WishlistService } from '../services/wishlist.service';

@ApiTags('wishlist')
@ApiProtected()
@Controller('wishlist')
export class WishlistController {
  constructor(private readonly wishlistService: WishlistService) {}

  @Get()
  @ApiOperation({ summary: 'List user wishlist products' })
  list(@CurrentUser() user: AuthenticatedUser) {
    return this.wishlistService.list(user.id);
  }

  @Post()
  @ApiOperation({ summary: 'Add product to wishlist' })
  add(@CurrentUser() user: AuthenticatedUser, @Body() payload: ToggleWishlistDto) {
    return this.wishlistService.add(user.id, payload.productId);
  }

  @Delete(':productId')
  @ApiOperation({ summary: 'Remove product from wishlist' })
  remove(@CurrentUser() user: AuthenticatedUser, @Param('productId') productId: string) {
    return this.wishlistService.remove(user.id, productId);
  }
}
