import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiConsumes, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '@/common/decorators/current-user.decorator';
import type { AuthenticatedUser } from '@/common/interfaces/auth-user.interface';
import type { UploadedImageFile } from '@/infrastructure/media/media-storage.service';
import { ApiProtected } from '@/swagger/decorators/api-protected.decorator';
import { CreateOrderDto } from '../dto/create-order.dto';
import { CreateOrderResponseDto } from '../dto/order-response.dto';
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

  @Post(':orderId/payments/:paymentId/receipt')
  @ApiOperation({ summary: 'Upload card-to-card payment receipt' })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('file'))
  uploadReceipt(
    @CurrentUser() user: AuthenticatedUser,
    @Param('orderId') orderId: string,
    @Param('paymentId') paymentId: string,
    @UploadedFile() file: UploadedImageFile | undefined,
  ) {
    if (!file?.buffer?.length) {
      throw new BadRequestException('فایل فیش واریز ارسال نشده است');
    }
    return this.ordersService.uploadPaymentReceipt(user.id, orderId, paymentId, {
      buffer: file.buffer,
      mimetype: file.mimetype,
      size: file.size,
      originalname: file.originalname,
    });
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
  @ApiResponse({ status: 201, type: CreateOrderResponseDto })
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
