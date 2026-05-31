import { Body, Controller, Get, Param, Patch, Query, UseGuards } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AdminAnalyticsResponseDto } from '../dto/admin-analytics-response.dto';
import { ApiProtected } from '@/swagger/decorators/api-protected.decorator';
import { AdminRoleGuard } from '@/common/guards/admin-role.guard';
import { CurrentUser } from '@/common/decorators/current-user.decorator';
import type { AuthenticatedUser } from '@/common/interfaces/auth-user.interface';
import {
  AdminAuditQueryDto,
  AdminKycQueryDto,
  AdminTradeQueryDto,
  AdminUsersQueryDto,
  AdminWalletTxQueryDto,
  PaginationQueryDto,
} from '../dto/admin-query.dto';
import { ReviewKycDto } from '../dto/review-kyc.dto';
import { UpdateUserRoleDto } from '../dto/update-user-role.dto';
import { AdminService } from '../services/admin.service';

@ApiTags('admin')
@ApiProtected()
@UseGuards(AdminRoleGuard)
@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('analytics')
  @ApiOperation({ summary: 'Dashboard analytics overview' })
  @ApiOkResponse({ type: AdminAnalyticsResponseDto })
  getAnalytics() {
    return this.adminService.getAnalytics();
  }

  @Get('users')
  @ApiOperation({ summary: 'List users with filters' })
  listUsers(@Query() query: AdminUsersQueryDto) {
    return this.adminService.listUsers(query);
  }

  @Patch('users/:userId/role')
  @ApiOperation({ summary: 'Update user RBAC role' })
  updateUserRole(
    @Param('userId') userId: string,
    @Body() payload: UpdateUserRoleDto,
    @CurrentUser() actor: AuthenticatedUser,
  ) {
    return this.adminService.updateUserRole(userId, payload, actor);
  }

  @Get('kyc')
  @ApiOperation({ summary: 'List KYC submissions' })
  listKyc(@Query() query: AdminKycQueryDto) {
    return this.adminService.listKyc(query);
  }

  @Patch('kyc/:id/review')
  @ApiOperation({ summary: 'Approve or reject KYC' })
  reviewKyc(
    @Param('id') id: string,
    @Body() payload: ReviewKycDto,
    @CurrentUser() actor: AuthenticatedUser,
  ) {
    return this.adminService.reviewKyc(id, payload, actor);
  }

  @Get('transactions/wallet')
  @ApiOperation({ summary: 'Monitor wallet transactions' })
  listWalletTransactions(@Query() query: AdminWalletTxQueryDto) {
    return this.adminService.listWalletTransactions(query);
  }

  @Get('transactions/trades')
  @ApiOperation({ summary: 'Monitor gold trade orders' })
  listTradeOrders(@Query() query: AdminTradeQueryDto) {
    return this.adminService.listTradeOrders(query);
  }

  @Get('wallets')
  @ApiOperation({ summary: 'List user wallets with balances' })
  listWallets(@Query() query: PaginationQueryDto & { search?: string }) {
    return this.adminService.listWallets(query);
  }

  @Get('audit-logs')
  @ApiOperation({ summary: 'Unified audit log feed' })
  listAuditLogs(@Query() query: AdminAuditQueryDto) {
    return this.adminService.listAuditLogs(query);
  }
}
