import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { StaffRoleGuard } from '@/common/guards/staff-role.guard';
import { CurrentUser } from '@/common/decorators/current-user.decorator';
import type { AuthenticatedUser } from '@/common/interfaces/auth-user.interface';
import { ApiProtected } from '@/swagger/decorators/api-protected.decorator';
import {
  AdjustInventoryDto,
  AdminInventoryHistoryQueryDto,
  AdminInventoryQueryDto,
  AdminInventoryReportQueryDto,
} from '../dto/admin-commerce.dto';
import { AdminInventoryService } from '../services/admin-inventory.service';

@ApiTags('admin-inventory')
@ApiProtected()
@UseGuards(StaffRoleGuard)
@Controller('admin/inventory')
export class AdminInventoryController {
  constructor(private readonly adminInventoryService: AdminInventoryService) {}

  @Get()
  @ApiOperation({ summary: 'Stock overview by product' })
  list(
    @Query() query: AdminInventoryQueryDto,
    @CurrentUser() actor: AuthenticatedUser,
  ) {
    return this.adminInventoryService.listStock(query, actor);
  }

  @Get('history')
  @ApiOperation({ summary: 'Inventory movement history' })
  history(
    @Query() query: AdminInventoryHistoryQueryDto,
    @CurrentUser() actor: AuthenticatedUser,
  ) {
    return this.adminInventoryService.listHistory(query, actor);
  }

  @Get('reports')
  @ApiOperation({ summary: 'Inventory analytics report' })
  reports(
    @Query() query: AdminInventoryReportQueryDto,
    @CurrentUser() actor: AuthenticatedUser,
  ) {
    return this.adminInventoryService.getReport(query, actor);
  }

  @Post('adjustments')
  @ApiOperation({ summary: 'Adjust stock quantity (audited)' })
  adjust(
    @Body() dto: AdjustInventoryDto,
    @CurrentUser() actor: AuthenticatedUser,
  ) {
    return this.adminInventoryService.adjust(dto, actor);
  }
}
