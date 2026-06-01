import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { StaffRoleGuard } from '@/common/guards/staff-role.guard';
import { CurrentUser } from '@/common/decorators/current-user.decorator';
import type { AuthenticatedUser } from '@/common/interfaces/auth-user.interface';
import { ApiProtected } from '@/swagger/decorators/api-protected.decorator';
import { PriceHistoryQueryDto } from '@/modules/pricing/dto/price-history-query.dto';
import {
  AdminOverridesQueryDto,
  AdminPriceHistoryQueryDto,
  UpdatePricingMarginsDto,
  UpsertGoldPriceOverrideDto,
} from '../dto/admin-pricing.dto';
import { AdminPricingService } from '../services/admin-pricing.service';

@ApiTags('admin-pricing')
@ApiProtected()
@UseGuards(StaffRoleGuard)
@Controller('admin/pricing')
export class AdminPricingController {
  constructor(private readonly adminPricingService: AdminPricingService) {}

  @Get('live')
  @ApiOperation({ summary: 'Live gold price (admin)' })
  getLive(
    @Query() query: PriceHistoryQueryDto,
    @CurrentUser() actor: AuthenticatedUser,
  ) {
    return this.adminPricingService.getLive(query.symbol, query.karat, actor);
  }

  @Post('refresh')
  @ApiOperation({ summary: 'Force refresh live gold price' })
  refresh(
    @Query() query: PriceHistoryQueryDto,
    @CurrentUser() actor: AuthenticatedUser,
  ) {
    return this.adminPricingService.refreshLive(
      query.symbol,
      query.karat,
      actor,
    );
  }

  @Get('history')
  @ApiOperation({ summary: 'Gold price history with date range' })
  getHistory(
    @Query() query: AdminPriceHistoryQueryDto,
    @CurrentUser() actor: AuthenticatedUser,
  ) {
    return this.adminPricingService.getHistory(query, actor);
  }

  @Get('providers')
  @ApiOperation({ summary: 'Pricing provider health and configuration' })
  getProviders(@CurrentUser() actor: AuthenticatedUser) {
    return this.adminPricingService.getProviders(actor);
  }

  @Get('margins')
  @ApiOperation({ summary: 'Get spread, commission and refresh settings' })
  getMargins(@CurrentUser() actor: AuthenticatedUser) {
    return this.adminPricingService.getMargins(actor);
  }

  @Patch('margins')
  @ApiOperation({ summary: 'Update pricing margins and fees' })
  updateMargins(
    @Body() dto: UpdatePricingMarginsDto,
    @CurrentUser() actor: AuthenticatedUser,
  ) {
    return this.adminPricingService.updateMargins(dto, actor);
  }

  @Get('overrides')
  @ApiOperation({ summary: 'List manual price overrides' })
  listOverrides(
    @Query() query: AdminOverridesQueryDto,
    @CurrentUser() actor: AuthenticatedUser,
  ) {
    return this.adminPricingService.listOverrides(query, actor);
  }

  @Post('overrides')
  @ApiOperation({ summary: 'Create manual price override' })
  createOverride(
    @Body() dto: UpsertGoldPriceOverrideDto,
    @CurrentUser() actor: AuthenticatedUser,
  ) {
    return this.adminPricingService.createOverride(dto, actor);
  }

  @Patch('overrides/:id')
  @ApiOperation({ summary: 'Update price override' })
  updateOverride(
    @Param('id') id: string,
    @Body() dto: UpsertGoldPriceOverrideDto,
    @CurrentUser() actor: AuthenticatedUser,
  ) {
    return this.adminPricingService.updateOverride(id, dto, actor);
  }

  @Delete('overrides/:id')
  @ApiOperation({ summary: 'Delete price override' })
  deleteOverride(
    @Param('id') id: string,
    @CurrentUser() actor: AuthenticatedUser,
  ) {
    return this.adminPricingService.deleteOverride(id, actor);
  }
}
