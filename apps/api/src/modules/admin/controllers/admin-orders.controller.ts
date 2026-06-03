import { Body, Controller, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { StaffRoleGuard } from '@/common/guards/staff-role.guard';
import { CurrentUser } from '@/common/decorators/current-user.decorator';
import type { AuthenticatedUser } from '@/common/interfaces/auth-user.interface';
import { ApiProtected } from '@/swagger/decorators/api-protected.decorator';
import { AdminOrdersQueryDto, UpdateAdminOrderStatusDto } from '../dto/admin-commerce.dto';
import { RejectPaymentReceiptDto } from '../dto/reject-payment-receipt.dto';
import { AdminOrdersService } from '../services/admin-orders.service';

@ApiTags('admin-orders')
@ApiProtected()
@UseGuards(StaffRoleGuard)
@Controller('admin/orders')
export class AdminOrdersController {
  constructor(private readonly adminOrdersService: AdminOrdersService) {}

  @Get()
  @ApiOperation({ summary: 'List storefront orders' })
  list(@Query() query: AdminOrdersQueryDto, @CurrentUser() actor: AuthenticatedUser) {
    return this.adminOrdersService.listOrders(query, actor);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Order detail' })
  get(@Param('id') id: string, @CurrentUser() actor: AuthenticatedUser) {
    return this.adminOrdersService.getOrder(id, actor);
  }

  @Patch(':id/status')
  @ApiOperation({ summary: 'Update order status' })
  updateStatus(
    @Param('id') id: string,
    @Body() dto: UpdateAdminOrderStatusDto,
    @CurrentUser() actor: AuthenticatedUser,
  ) {
    return this.adminOrdersService.updateStatus(id, dto, actor);
  }

  @Post(':orderId/payments/:paymentId/approve-receipt')
  @ApiOperation({ summary: 'Approve card-to-card payment receipt and confirm order' })
  approveReceipt(
    @Param('orderId') orderId: string,
    @Param('paymentId') paymentId: string,
    @CurrentUser() actor: AuthenticatedUser,
  ) {
    return this.adminOrdersService.approvePaymentReceipt(orderId, paymentId, actor);
  }

  @Post(':orderId/payments/:paymentId/reject-receipt')
  @ApiOperation({ summary: 'Reject payment receipt — customer can re-upload' })
  rejectReceipt(
    @Param('orderId') orderId: string,
    @Param('paymentId') paymentId: string,
    @Body() dto: RejectPaymentReceiptDto,
    @CurrentUser() actor: AuthenticatedUser,
  ) {
    return this.adminOrdersService.rejectPaymentReceipt(orderId, paymentId, dto, actor);
  }
}
