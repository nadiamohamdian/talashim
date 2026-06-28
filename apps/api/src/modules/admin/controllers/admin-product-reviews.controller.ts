import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { StaffRoleGuard } from '@/common/guards/staff-role.guard';
import { CurrentUser } from '@/common/decorators/current-user.decorator';
import type { AuthenticatedUser } from '@/common/interfaces/auth-user.interface';
import { ApiProtected } from '@/swagger/decorators/api-protected.decorator';
import {
  AdminProductReviewsQueryDto,
  CreateAdminProductReviewDto,
  ReviewAdminProductReviewDto,
  UpdateAdminProductReviewDto,
} from '../dto/admin-product-reviews.dto';
import { AdminProductReviewsService } from '../services/admin-product-reviews.service';

@ApiTags('admin-product-reviews')
@ApiProtected()
@UseGuards(StaffRoleGuard)
@Controller('admin/product-reviews')
export class AdminProductReviewsController {
  constructor(private readonly adminProductReviewsService: AdminProductReviewsService) {}

  @Get()
  @ApiOperation({ summary: 'List product reviews for moderation' })
  list(@Query() query: AdminProductReviewsQueryDto, @CurrentUser() actor: AuthenticatedUser) {
    return this.adminProductReviewsService.list(query, actor);
  }

  @Patch(':id/review')
  @ApiOperation({ summary: 'Approve or reject a product review' })
  review(
    @Param('id') id: string,
    @Body() payload: ReviewAdminProductReviewDto,
    @CurrentUser() actor: AuthenticatedUser,
  ) {
    return this.adminProductReviewsService.review(id, payload, actor);
  }

  @Post()
  @ApiOperation({ summary: 'Create a product review (admin)' })
  create(@Body() payload: CreateAdminProductReviewDto, @CurrentUser() actor: AuthenticatedUser) {
    return this.adminProductReviewsService.create(payload, actor);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a product review' })
  update(
    @Param('id') id: string,
    @Body() payload: UpdateAdminProductReviewDto,
    @CurrentUser() actor: AuthenticatedUser,
  ) {
    return this.adminProductReviewsService.update(id, payload, actor);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a product review' })
  remove(@Param('id') id: string, @CurrentUser() actor: AuthenticatedUser) {
    return this.adminProductReviewsService.remove(id, actor);
  }
}
