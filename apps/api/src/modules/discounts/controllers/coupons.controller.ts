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
import { Throttle } from '@nestjs/throttler';
import { ADMIN_PERMISSIONS } from '@sadafgold/shared/admin-rbac';
import { CurrentUser } from '@/common/decorators/current-user.decorator';
import type { AuthenticatedUser } from '@/common/interfaces/auth-user.interface';
import { assertAdminPermission } from '@/common/rbac/assert-admin-permission';
import { StaffRoleGuard } from '@/common/guards/staff-role.guard';
import { ApiProtected } from '@/swagger/decorators/api-protected.decorator';
import {
  CouponQueryDto,
  CreateCouponDto,
  UpdateCouponDto,
  ValidateCouponDto,
} from '../dto/coupon.dto';
import { CouponsService } from '../services/coupons.service';

@ApiTags('checkout-coupons')
@ApiProtected()
@Controller('checkout/coupons')
export class CheckoutCouponsController {
  constructor(private readonly couponsService: CouponsService) {}

  @Post('validate')
  @Throttle({ default: { limit: 10, ttl: 60_000 } })
  @ApiOperation({ summary: 'Validate coupon against current checkout cart' })
  validateCoupon(@CurrentUser() user: AuthenticatedUser, @Body() payload: ValidateCouponDto) {
    return this.couponsService.validateForCheckout(payload.code, payload.cartId, user.id);
  }
}

@ApiTags('admin-coupons')
@ApiProtected()
@UseGuards(StaffRoleGuard)
@Controller('admin/coupons')
export class AdminCouponsController {
  constructor(private readonly couponsService: CouponsService) {}

  @Get()
  @ApiOperation({ summary: 'List coupons with filters' })
  list(
    @Query() query: CouponQueryDto,
    @CurrentUser() actor: AuthenticatedUser,
  ) {
    assertAdminPermission(actor.role, ADMIN_PERMISSIONS.orders.read);
    return this.couponsService.listCoupons(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get coupon detail and usage history' })
  get(@Param('id') id: string, @CurrentUser() actor: AuthenticatedUser) {
    assertAdminPermission(actor.role, ADMIN_PERMISSIONS.orders.read);
    return this.couponsService.getCouponById(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create coupon' })
  create(@Body() payload: CreateCouponDto, @CurrentUser() actor: AuthenticatedUser) {
    assertAdminPermission(actor.role, ADMIN_PERMISSIONS.orders.write);
    return this.couponsService.createCoupon(payload, actor.id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update coupon' })
  update(
    @Param('id') id: string,
    @Body() payload: UpdateCouponDto,
    @CurrentUser() actor: AuthenticatedUser,
  ) {
    assertAdminPermission(actor.role, ADMIN_PERMISSIONS.orders.write);
    return this.couponsService.updateCoupon(id, payload, actor.id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Soft delete coupon' })
  remove(@Param('id') id: string, @CurrentUser() actor: AuthenticatedUser) {
    assertAdminPermission(actor.role, ADMIN_PERMISSIONS.orders.write);
    return this.couponsService.softDeleteCoupon(id, actor.id);
  }

  @Post(':id/toggle')
  @ApiOperation({ summary: 'Enable / disable coupon' })
  toggle(
    @Param('id') id: string,
    @Body() payload: { isActive: boolean },
    @CurrentUser() actor: AuthenticatedUser,
  ) {
    assertAdminPermission(actor.role, ADMIN_PERMISSIONS.orders.write);
    return this.couponsService.toggleCoupon(id, payload.isActive, actor.id);
  }

  @Post(':id/duplicate')
  @ApiOperation({ summary: 'Duplicate coupon' })
  duplicate(@Param('id') id: string, @CurrentUser() actor: AuthenticatedUser) {
    assertAdminPermission(actor.role, ADMIN_PERMISSIONS.orders.write);
    return this.couponsService.duplicateCoupon(id, actor.id);
  }
}
