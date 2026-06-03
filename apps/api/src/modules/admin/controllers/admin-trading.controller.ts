import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { StaffRoleGuard } from '@/common/guards/staff-role.guard';
import { CurrentUser } from '@/common/decorators/current-user.decorator';
import type { AuthenticatedUser } from '@/common/interfaces/auth-user.interface';
import { ApiProtected } from '@/swagger/decorators/api-protected.decorator';
import {
  AdminCancelTradeOrderDto,
  AdminTradingOrdersQueryDto,
  AdminTradingReportQueryDto,
} from '../dto/admin-trading.dto';
import { AdminTradingService } from '../services/admin-trading.service';

@ApiTags('admin-trading')
@ApiProtected()
@UseGuards(StaffRoleGuard)
@Controller('admin/trading')
export class AdminTradingController {
  constructor(private readonly adminTradingService: AdminTradingService) {}

  @Get('orders')
  @ApiOperation({ summary: 'List gold trade orders' })
  listOrders(@Query() query: AdminTradingOrdersQueryDto, @CurrentUser() actor: AuthenticatedUser) {
    return this.adminTradingService.listOrders(query, actor);
  }

  @Get('orders/:id')
  @ApiOperation({ summary: 'Get trade order detail with audit trail' })
  getOrder(@Param('id') id: string, @CurrentUser() actor: AuthenticatedUser) {
    return this.adminTradingService.getOrder(id, actor);
  }

  @Get('settlement/summary')
  @ApiOperation({ summary: 'Settlement queue KPIs' })
  getSettlementSummary(@CurrentUser() actor: AuthenticatedUser) {
    return this.adminTradingService.getSettlementSummary(actor);
  }

  @Get('settlement/queue')
  @ApiOperation({ summary: 'Orders awaiting settlement (pending/failed filter)' })
  listSettlementQueue(
    @Query() query: AdminTradingOrdersQueryDto,
    @CurrentUser() actor: AuthenticatedUser,
  ) {
    return this.adminTradingService.listSettlementQueue(query, actor);
  }

  @Post('orders/:id/settle')
  @ApiOperation({ summary: 'Manually settle a pending trade order' })
  settleOrder(@Param('id') id: string, @CurrentUser() actor: AuthenticatedUser) {
    return this.adminTradingService.settleOrder(id, actor);
  }

  @Post('orders/:id/cancel')
  @ApiOperation({ summary: 'Cancel a pending trade order' })
  cancelOrder(
    @Param('id') id: string,
    @Body() dto: AdminCancelTradeOrderDto,
    @CurrentUser() actor: AuthenticatedUser,
  ) {
    return this.adminTradingService.cancelOrder(id, dto, actor);
  }

  @Get('reports')
  @ApiOperation({ summary: 'Trading analytics report' })
  getReports(@Query() query: AdminTradingReportQueryDto, @CurrentUser() actor: AuthenticatedUser) {
    return this.adminTradingService.getTradingReport(query, actor);
  }
}
