import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { StaffRoleGuard } from '@/common/guards/staff-role.guard';
import { CurrentUser } from '@/common/decorators/current-user.decorator';
import type { AuthenticatedUser } from '@/common/interfaces/auth-user.interface';
import { ApiProtected } from '@/swagger/decorators/api-protected.decorator';
import {
  AdminBannersQueryDto,
  AdminBlogQueryDto,
  AdminMediaQueryDto,
  AdminStaticPagesQueryDto,
  RegisterMediaAssetDto,
  UpdateCmsHomepageDto,
  UpdateCmsSeoDto,
  UpsertBlogPostDto,
  UpsertCmsBannerDto,
  UpsertCmsStaticPageDto,
} from '../dto/admin-cms.dto';
import { AdminCmsService } from '../services/admin-cms.service';

@ApiTags('admin-cms')
@ApiProtected()
@UseGuards(StaffRoleGuard)
@Controller('admin/cms')
export class AdminCmsController {
  constructor(private readonly adminCmsService: AdminCmsService) {}

  @Get('blog/categories')
  @ApiOperation({ summary: 'List blog categories' })
  listBlogCategories(@CurrentUser() actor: AuthenticatedUser) {
    return this.adminCmsService.listBlogCategories(actor);
  }

  @Get('blog')
  @ApiOperation({ summary: 'List blog posts (admin)' })
  listBlog(
    @Query() query: AdminBlogQueryDto,
    @CurrentUser() actor: AuthenticatedUser,
  ) {
    return this.adminCmsService.listBlogPosts(query, actor);
  }

  @Get('blog/:id')
  @ApiOperation({ summary: 'Get blog post by id' })
  getBlog(@Param('id') id: string, @CurrentUser() actor: AuthenticatedUser) {
    return this.adminCmsService.getBlogPost(id, actor);
  }

  @Post('blog')
  @ApiOperation({ summary: 'Create blog post' })
  createBlog(
    @Body() dto: UpsertBlogPostDto,
    @CurrentUser() actor: AuthenticatedUser,
  ) {
    return this.adminCmsService.createBlogPost(dto, actor);
  }

  @Patch('blog/:id')
  @ApiOperation({ summary: 'Update blog post' })
  updateBlog(
    @Param('id') id: string,
    @Body() dto: UpsertBlogPostDto,
    @CurrentUser() actor: AuthenticatedUser,
  ) {
    return this.adminCmsService.updateBlogPost(id, dto, actor);
  }

  @Delete('blog/:id')
  @ApiOperation({ summary: 'Delete blog post' })
  deleteBlog(@Param('id') id: string, @CurrentUser() actor: AuthenticatedUser) {
    return this.adminCmsService.deleteBlogPost(id, actor);
  }

  @Get('faq')
  @ApiOperation({ summary: 'List FAQ entries' })
  listFaq(
    @Query() query: AdminBlogQueryDto,
    @CurrentUser() actor: AuthenticatedUser,
  ) {
    return this.adminCmsService.listFaq(query, actor);
  }

  @Post('faq')
  @ApiOperation({ summary: 'Create FAQ entry' })
  createFaq(
    @Body() dto: UpsertBlogPostDto,
    @CurrentUser() actor: AuthenticatedUser,
  ) {
    return this.adminCmsService.createFaqPost(dto, actor);
  }

  @Patch('faq/:id')
  @ApiOperation({ summary: 'Update FAQ entry' })
  updateFaq(
    @Param('id') id: string,
    @Body() dto: UpsertBlogPostDto,
    @CurrentUser() actor: AuthenticatedUser,
  ) {
    return this.adminCmsService.updateBlogPost(id, dto, actor);
  }

  @Delete('faq/:id')
  @ApiOperation({ summary: 'Delete FAQ entry' })
  deleteFaq(@Param('id') id: string, @CurrentUser() actor: AuthenticatedUser) {
    return this.adminCmsService.deleteBlogPost(id, actor);
  }

  @Get('homepage')
  @ApiOperation({ summary: 'Get homepage CMS config' })
  getHomepage(@CurrentUser() actor: AuthenticatedUser) {
    return this.adminCmsService.getHomepage(actor);
  }

  @Patch('homepage')
  @ApiOperation({ summary: 'Update homepage CMS config' })
  updateHomepage(
    @Body() dto: UpdateCmsHomepageDto,
    @CurrentUser() actor: AuthenticatedUser,
  ) {
    return this.adminCmsService.updateHomepage(dto, actor);
  }

  @Get('banners')
  @ApiOperation({ summary: 'List CMS banners' })
  listBanners(
    @Query() query: AdminBannersQueryDto,
    @CurrentUser() actor: AuthenticatedUser,
  ) {
    return this.adminCmsService.listBanners(query, actor);
  }

  @Post('banners')
  @ApiOperation({ summary: 'Create banner' })
  createBanner(
    @Body() dto: UpsertCmsBannerDto,
    @CurrentUser() actor: AuthenticatedUser,
  ) {
    return this.adminCmsService.createBanner(dto, actor);
  }

  @Patch('banners/:id')
  @ApiOperation({ summary: 'Update banner' })
  updateBanner(
    @Param('id') id: string,
    @Body() dto: UpsertCmsBannerDto,
    @CurrentUser() actor: AuthenticatedUser,
  ) {
    return this.adminCmsService.updateBanner(id, dto, actor);
  }

  @Delete('banners/:id')
  @ApiOperation({ summary: 'Delete banner' })
  deleteBanner(
    @Param('id') id: string,
    @CurrentUser() actor: AuthenticatedUser,
  ) {
    return this.adminCmsService.deleteBanner(id, actor);
  }

  @Get('pages')
  @ApiOperation({ summary: 'List static pages' })
  listPages(
    @Query() query: AdminStaticPagesQueryDto,
    @CurrentUser() actor: AuthenticatedUser,
  ) {
    return this.adminCmsService.listStaticPages(query, actor);
  }

  @Post('pages')
  @ApiOperation({ summary: 'Create static page' })
  createPage(
    @Body() dto: UpsertCmsStaticPageDto,
    @CurrentUser() actor: AuthenticatedUser,
  ) {
    return this.adminCmsService.createStaticPage(dto, actor);
  }

  @Patch('pages/:id')
  @ApiOperation({ summary: 'Update static page' })
  updatePage(
    @Param('id') id: string,
    @Body() dto: UpsertCmsStaticPageDto,
    @CurrentUser() actor: AuthenticatedUser,
  ) {
    return this.adminCmsService.updateStaticPage(id, dto, actor);
  }

  @Delete('pages/:id')
  @ApiOperation({ summary: 'Delete static page' })
  deletePage(@Param('id') id: string, @CurrentUser() actor: AuthenticatedUser) {
    return this.adminCmsService.deleteStaticPage(id, actor);
  }

  @Get('seo')
  @ApiOperation({ summary: 'Get global SEO settings' })
  getSeo(@CurrentUser() actor: AuthenticatedUser) {
    return this.adminCmsService.getSeo(actor);
  }

  @Put('seo')
  @ApiOperation({ summary: 'Update global SEO settings' })
  updateSeo(
    @Body() dto: UpdateCmsSeoDto,
    @CurrentUser() actor: AuthenticatedUser,
  ) {
    return this.adminCmsService.updateSeo(dto, actor);
  }
}

@ApiTags('admin-media')
@ApiProtected()
@UseGuards(StaffRoleGuard)
@Controller('admin/media')
export class AdminMediaController {
  constructor(private readonly adminCmsService: AdminCmsService) {}

  @Get()
  @ApiOperation({ summary: 'List media library assets' })
  listMedia(
    @Query() query: AdminMediaQueryDto,
    @CurrentUser() actor: AuthenticatedUser,
  ) {
    return this.adminCmsService.listMedia(query, actor);
  }

  @Post()
  @ApiOperation({ summary: 'Register media asset (URL)' })
  registerMedia(
    @Body() dto: RegisterMediaAssetDto,
    @CurrentUser() actor: AuthenticatedUser,
  ) {
    return this.adminCmsService.registerMedia(dto, actor);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete media asset' })
  deleteMedia(
    @Param('id') id: string,
    @CurrentUser() actor: AuthenticatedUser,
  ) {
    return this.adminCmsService.deleteMedia(id, actor);
  }
}
