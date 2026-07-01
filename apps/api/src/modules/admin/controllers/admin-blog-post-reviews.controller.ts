import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { StaffRoleGuard } from '@/common/guards/staff-role.guard';
import { CurrentUser } from '@/common/decorators/current-user.decorator';
import type { AuthenticatedUser } from '@/common/interfaces/auth-user.interface';
import { ApiProtected } from '@/swagger/decorators/api-protected.decorator';
import {
  AdminBlogPostReviewsQueryDto,
  CreateAdminBlogPostReviewDto,
  ReviewAdminBlogPostReviewDto,
  UpdateAdminBlogPostReviewDto,
} from '../dto/admin-blog-post-reviews.dto';
import { AdminBlogPostReviewsService } from '../services/admin-blog-post-reviews.service';

@ApiTags('admin-blog-post-reviews')
@ApiProtected()
@UseGuards(StaffRoleGuard)
@Controller('admin/blog-post-reviews')
export class AdminBlogPostReviewsController {
  constructor(private readonly adminBlogPostReviewsService: AdminBlogPostReviewsService) {}

  @Get()
  @ApiOperation({ summary: 'List blog post reviews for moderation' })
  list(@Query() query: AdminBlogPostReviewsQueryDto, @CurrentUser() actor: AuthenticatedUser) {
    return this.adminBlogPostReviewsService.list(query, actor);
  }

  @Patch(':id/review')
  @ApiOperation({ summary: 'Approve or reject a blog post review' })
  review(
    @Param('id') id: string,
    @Body() payload: ReviewAdminBlogPostReviewDto,
    @CurrentUser() actor: AuthenticatedUser,
  ) {
    return this.adminBlogPostReviewsService.review(id, payload, actor);
  }

  @Post()
  @ApiOperation({ summary: 'Create a blog post review (admin)' })
  create(@Body() payload: CreateAdminBlogPostReviewDto, @CurrentUser() actor: AuthenticatedUser) {
    return this.adminBlogPostReviewsService.create(payload, actor);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a blog post review' })
  update(
    @Param('id') id: string,
    @Body() payload: UpdateAdminBlogPostReviewDto,
    @CurrentUser() actor: AuthenticatedUser,
  ) {
    return this.adminBlogPostReviewsService.update(id, payload, actor);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a blog post review' })
  remove(@Param('id') id: string, @CurrentUser() actor: AuthenticatedUser) {
    return this.adminBlogPostReviewsService.remove(id, actor);
  }
}
