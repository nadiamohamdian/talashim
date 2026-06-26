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
import {
  AdminProductVideosQueryDto,
  AdminProductsQueryDto,
  CreateAdminProductDto,
  UpdateAdminProductDto,
  UpsertAdminProductVideoDto,
} from '../dto/admin-commerce.dto';
import { AdminProductsService } from '../services/admin-products.service';

@ApiTags('admin-products')
@ApiProtected()
@UseGuards(StaffRoleGuard)
@Controller('admin/products')
export class AdminProductsController {
  constructor(private readonly adminProductsService: AdminProductsService) {}

  @Get()
  @ApiOperation({ summary: 'List products (admin)' })
  list(@Query() query: AdminProductsQueryDto, @CurrentUser() actor: AuthenticatedUser) {
    return this.adminProductsService.listProducts(query, actor);
  }

  @Get('videos')
  @ApiOperation({ summary: 'List product videos' })
  listVideos(
    @Query() query: AdminProductVideosQueryDto,
    @CurrentUser() actor: AuthenticatedUser,
  ) {
    return this.adminProductsService.listVideos(query, actor);
  }

  @Post('videos')
  @ApiOperation({ summary: 'Create product video' })
  createVideo(
    @Body() dto: UpsertAdminProductVideoDto,
    @CurrentUser() actor: AuthenticatedUser,
  ) {
    return this.adminProductsService.createVideo(dto, actor);
  }

  @Patch('videos/:videoId')
  @ApiOperation({ summary: 'Update product video' })
  updateVideo(
    @Param('videoId') videoId: string,
    @Body() dto: UpsertAdminProductVideoDto,
    @CurrentUser() actor: AuthenticatedUser,
  ) {
    return this.adminProductsService.updateVideo(videoId, dto, actor);
  }

  @Delete('videos/:videoId')
  @ApiOperation({ summary: 'Delete product video' })
  deleteVideo(@Param('videoId') videoId: string, @CurrentUser() actor: AuthenticatedUser) {
    return this.adminProductsService.deleteVideo(videoId, actor);
  }

  @Post('sync-demo-catalog')
  @ApiOperation({ summary: 'Upsert storefront demo catalog products into the database' })
  syncDemoCatalog(@CurrentUser() actor: AuthenticatedUser) {
    return this.adminProductsService.syncCatalogDemoProducts(actor);
  }

  @Get('by-slug/:slug')
  @ApiOperation({ summary: 'Get product by slug' })
  getBySlug(@Param('slug') slug: string, @CurrentUser() actor: AuthenticatedUser) {
    return this.adminProductsService.getProductBySlug(slug, actor);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get product by id' })
  get(@Param('id') id: string, @CurrentUser() actor: AuthenticatedUser) {
    return this.adminProductsService.getProduct(id, actor);
  }

  @Post()
  @ApiOperation({ summary: 'Create product' })
  create(@Body() dto: CreateAdminProductDto, @CurrentUser() actor: AuthenticatedUser) {
    return this.adminProductsService.createProduct(dto, actor);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update product' })
  update(
    @Param('id') id: string,
    @Body() dto: UpdateAdminProductDto,
    @CurrentUser() actor: AuthenticatedUser,
  ) {
    return this.adminProductsService.updateProduct(id, dto, actor);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete product' })
  remove(@Param('id') id: string, @CurrentUser() actor: AuthenticatedUser) {
    return this.adminProductsService.deleteProduct(id, actor);
  }
}
