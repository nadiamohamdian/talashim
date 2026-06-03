import { Body, Controller, Get, Param, Patch, Query, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { StaffRoleGuard } from '@/common/guards/staff-role.guard';
import { CurrentUser } from '@/common/decorators/current-user.decorator';
import type { AuthenticatedUser } from '@/common/interfaces/auth-user.interface';
import { ApiProtected } from '@/swagger/decorators/api-protected.decorator';
import { AdminOrdersQueryDto, UpdateAdminOrderStatusDto } from '../dto/admin-commerce.dto';
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
}
