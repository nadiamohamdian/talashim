import { Body, Controller, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CreateOrderDto } from '../dto/create-order.dto';
import { OrdersService } from '../services/orders.service';

@ApiTags('checkout')
@Controller('checkout')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  checkout(@Body() payload: CreateOrderDto) {
    return this.ordersService.checkout(payload);
  }
}
