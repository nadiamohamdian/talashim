import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '@/common/decorators/current-user.decorator';
import type { AuthenticatedUser } from '@/common/interfaces/auth-user.interface';
import { ApiProtected } from '@/swagger/decorators/api-protected.decorator';
import { CreateOrderDto } from '../dto/create-order.dto';
import { OrdersQueryDto } from '../dto/orders-query.dto';
import { OrdersService } from '../services/orders.service';

@ApiTags('orders')
@ApiProtected()
@Controller('orders')
export class OrdersListController {
  constructor(private readonly ordersService: OrdersService) {}

  @Get('me')
  @ApiOperation({ summary: 'List current user orders' })
  listMine(@CurrentUser() user: AuthenticatedUser, @Query() query: OrdersQueryDto) {
    return this.ordersService.listForUser(user.id, query);
  }

  @Get('me/summary')
  @ApiOperation({ summary: 'Account dashboard summary' })
  accountSummary(@CurrentUser() user: AuthenticatedUser) {
    return this.ordersService.getAccountSummary(user.id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get order detail' })
  getOne(@CurrentUser() user: AuthenticatedUser, @Param('id') id: string) {
    return this.ordersService.getForUser(user.id, id);
  }
}

@ApiTags('checkout')
@ApiProtected()
@Controller('checkout')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  @ApiOperation({ summary: 'Checkout cart and create order' })
  checkout(
    @CurrentUser() user: AuthenticatedUser,
    @Body() payload: CreateOrderDto,
  ) {
    return this.ordersService.checkout({
      ...payload,
      userId: payload.userId ?? user.id,
    });
  }
}
