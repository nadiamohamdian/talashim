import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { StaffRoleGuard } from '@/common/guards/staff-role.guard';
import { CurrentUser } from '@/common/decorators/current-user.decorator';
import type { AuthenticatedUser } from '@/common/interfaces/auth-user.interface';
import { ApiProtected } from '@/swagger/decorators/api-protected.decorator';
import {
  AdminAccountingQueryDto,
  AdminFinanceReportsQueryDto,
  AdminLedgerAccountsQueryDto,
  AdminLedgerEntriesQueryDto,
} from '../dto/admin-finance-query.dto';
import { AdminFinanceService } from '../services/admin-finance.service';

@ApiTags('admin-finance')
@ApiProtected()
@UseGuards(StaffRoleGuard)
@Controller('admin')
export class AdminFinanceController {
  constructor(private readonly adminFinanceService: AdminFinanceService) {}

  @Get('ledger/entries')
  @ApiOperation({ summary: 'List ledger journal entries' })
  listLedgerEntries(
    @Query() query: AdminLedgerEntriesQueryDto,
    @CurrentUser() actor: AuthenticatedUser,
  ) {
    return this.adminFinanceService.listLedgerEntries(query, actor);
  }

  @Get('ledger/accounts')
  @ApiOperation({ summary: 'List ledger accounts with balances' })
  listLedgerAccounts(
    @Query() query: AdminLedgerAccountsQueryDto,
    @CurrentUser() actor: AuthenticatedUser,
  ) {
    return this.adminFinanceService.listLedgerAccounts(query, actor);
  }

  @Get('accounting/summary')
  @ApiOperation({ summary: 'Trial balance and account summary' })
  getAccountingSummary(
    @Query() query: AdminAccountingQueryDto,
    @CurrentUser() actor: AuthenticatedUser,
  ) {
    return this.adminFinanceService.getAccountingSummary(query, actor);
  }

  @Get('finance/reports')
  @ApiOperation({ summary: 'Finance P&L and platform balance report' })
  getFinanceReports(
    @Query() query: AdminFinanceReportsQueryDto,
    @CurrentUser() actor: AuthenticatedUser,
  ) {
    return this.adminFinanceService.getFinanceReports(query, actor);
  }
}
