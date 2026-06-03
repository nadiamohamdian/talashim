import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AdminAnalyticsResponseDto } from '../dto/admin-analytics-response.dto';
import { ApiProtected } from '@/swagger/decorators/api-protected.decorator';
import { StaffRoleGuard } from '@/common/guards/staff-role.guard';
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
import { AdminUpdateUserContactDto } from '../dto/admin-update-user-contact.dto';
import { UpdateUserRoleDto } from '../dto/update-user-role.dto';
import { CreateStaffUserDto } from '../dto/create-staff-user.dto';
import { UpdateStaffUserDto } from '../dto/update-staff-user.dto';
import {
  AdminLoginHistoryQueryDto,
  AdminSessionsQueryDto,
} from '../dto/admin-security-query.dto';
import { AdminReportsService } from '../services/admin-reports.service';
import { AdminService } from '../services/admin.service';
import {
  FinancialReportQueryDto,
  InventoryReportQueryDto,
  SalesReportQueryDto,
  TradingReportQueryDto,
  UsersReportQueryDto,
} from '../dto/admin-reports-query.dto';

@ApiTags('admin')
@ApiProtected()
@UseGuards(StaffRoleGuard)
@Controller('admin')
export class AdminController {
  constructor(
    private readonly adminService: AdminService,
    private readonly adminReportsService: AdminReportsService,
  ) {}

  @Get('analytics')
  @ApiOperation({ summary: 'Dashboard analytics overview' })
  @ApiOkResponse({ type: AdminAnalyticsResponseDto })
  getAnalytics(@CurrentUser() actor: AuthenticatedUser) {
    return this.adminService.getAnalytics(actor);
  }

  @Get('users')
  @ApiOperation({ summary: 'List users with filters' })
  listUsers(@Query() query: AdminUsersQueryDto, @CurrentUser() actor: AuthenticatedUser) {
    return this.adminService.listUsers(query, actor);
  }

  @Get('users/:userId')
  @ApiOperation({ summary: 'Get user detail for admin CRM' })
  getUserDetail(@Param('userId') userId: string, @CurrentUser() actor: AuthenticatedUser) {
    return this.adminService.getUserDetail(userId, actor);
  }

  @Get('users/:userId/activity')
  @ApiOperation({ summary: 'List user audit activity' })
  getUserActivity(
    @Param('userId') userId: string,
    @Query() query: PaginationQueryDto,
    @CurrentUser() actor: AuthenticatedUser,
  ) {
    return this.adminService.getUserActivity(userId, query, actor);
  }

  @Patch('users/:userId/contact')
  @ApiOperation({ summary: 'Update customer phone (KYC) and shipping address' })
  updateUserContact(
    @Param('userId') userId: string,
    @Body() payload: AdminUpdateUserContactDto,
    @CurrentUser() actor: AuthenticatedUser,
  ) {
    return this.adminService.updateUserContact(userId, payload, actor);
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

  @Post('staff')
  @ApiOperation({ summary: 'Create staff user' })
  createStaffUser(@Body() payload: CreateStaffUserDto, @CurrentUser() actor: AuthenticatedUser) {
    return this.adminService.createStaffUser(payload, actor);
  }

  @Patch('staff/:userId')
  @ApiOperation({ summary: 'Update staff user' })
  updateStaffUser(
    @Param('userId') userId: string,
    @Body() payload: UpdateStaffUserDto,
    @CurrentUser() actor: AuthenticatedUser,
  ) {
    return this.adminService.updateStaffUser(userId, payload, actor);
  }

  @Get('kyc')
  @ApiOperation({ summary: 'List KYC submissions' })
  listKyc(@Query() query: AdminKycQueryDto, @CurrentUser() actor: AuthenticatedUser) {
    return this.adminService.listKyc(query, actor);
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
  listWalletTransactions(
    @Query() query: AdminWalletTxQueryDto,
    @CurrentUser() actor: AuthenticatedUser,
  ) {
    return this.adminService.listWalletTransactions(query, actor);
  }

  @Get('transactions/trades')
  @ApiOperation({ summary: 'Monitor gold trade orders' })
  listTradeOrders(
    @Query() query: AdminTradeQueryDto,
    @CurrentUser() actor: AuthenticatedUser,
  ) {
    return this.adminService.listTradeOrders(query, actor);
  }

  @Get('wallets')
  @ApiOperation({ summary: 'List user wallets with balances' })
  listWallets(
    @Query() query: PaginationQueryDto & { search?: string },
    @CurrentUser() actor: AuthenticatedUser,
  ) {
    return this.adminService.listWallets(query, actor);
  }

  @Get('audit-logs')
  @ApiOperation({ summary: 'Unified audit log feed' })
  listAuditLogs(@Query() query: AdminAuditQueryDto, @CurrentUser() actor: AuthenticatedUser) {
    return this.adminService.listAuditLogs(query, actor);
  }

  @Get('security/sessions')
  @ApiOperation({ summary: 'List refresh-token sessions' })
  listSessions(@Query() query: AdminSessionsQueryDto, @CurrentUser() actor: AuthenticatedUser) {
    return this.adminService.listSessions(query, actor);
  }

  @Delete('security/sessions/:sessionId')
  @ApiOperation({ summary: 'Revoke a single session' })
  revokeSession(
    @Param('sessionId') sessionId: string,
    @CurrentUser() actor: AuthenticatedUser,
  ) {
    return this.adminService.revokeSession(sessionId, actor);
  }

  @Delete('security/users/:userId/sessions')
  @ApiOperation({ summary: 'Revoke all active sessions for a user' })
  revokeUserSessions(
    @Param('userId') userId: string,
    @CurrentUser() actor: AuthenticatedUser,
  ) {
    return this.adminService.revokeUserSessions(userId, actor);
  }

  @Get('security/login-history')
  @ApiOperation({ summary: 'Auth-related audit events' })
  listLoginHistory(
    @Query() query: AdminLoginHistoryQueryDto,
    @CurrentUser() actor: AuthenticatedUser,
  ) {
    return this.adminService.listLoginHistory(query, actor);
  }

  @Get('security/permissions')
  @ApiOperation({ summary: 'RBAC permission registry' })
  getPermissions(@CurrentUser() actor: AuthenticatedUser) {
    return this.adminService.getPermissionRegistry(actor);
  }

  @Get('reports/sales')
  @ApiOperation({ summary: 'Sales report with summary and orders' })
  getSalesReport(
    @Query() query: SalesReportQueryDto,
    @CurrentUser() actor: AuthenticatedUser,
  ) {
    return this.adminReportsService.getSalesReport(query, actor);
  }

  @Get('reports/inventory')
  @ApiOperation({ summary: 'Inventory stock report' })
  getInventoryReport(
    @Query() query: InventoryReportQueryDto,
    @CurrentUser() actor: AuthenticatedUser,
  ) {
    return this.adminReportsService.getInventoryReport(query, actor);
  }

  @Get('reports/users')
  @ApiOperation({ summary: 'Users growth and directory report' })
  getUsersReport(
    @Query() query: UsersReportQueryDto,
    @CurrentUser() actor: AuthenticatedUser,
  ) {
    return this.adminReportsService.getUsersReport(query, actor);
  }

  @Get('reports/trading')
  @ApiOperation({ summary: 'Gold trading report' })
  getTradingReport(
    @Query() query: TradingReportQueryDto,
    @CurrentUser() actor: AuthenticatedUser,
  ) {
    return this.adminReportsService.getTradingReport(query, actor);
  }

  @Get('reports/financial')
  @ApiOperation({ summary: 'Wallet transactions financial report' })
  getFinancialReport(
    @Query() query: FinancialReportQueryDto,
    @CurrentUser() actor: AuthenticatedUser,
  ) {
    return this.adminReportsService.getFinancialReport(query, actor);
  }
}
