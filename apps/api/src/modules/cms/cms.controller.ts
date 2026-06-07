import { Controller, Get, Param, Query } from '@nestjs/common';
import { SkipThrottle } from '@nestjs/throttler';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { HttpCache } from '@/common/decorators/http-cache.decorator';
import { Public } from '@/common/decorators/public.decorator';
import { ApiPublicErrors } from '@/swagger/decorators/api-protected.decorator';
import {
  PublicBannersQueryDto,
  PublicCmsBannerResponseDto,
  PublicCmsCollectionResponseDto,
  PublicCmsHomepageResponseDto,
  PublicCmsSeoResponseDto,
  PublicCmsStaticPageResponseDto,
  PublicCmsStaticPageSummaryResponseDto,
} from '@/modules/admin/dto/admin-cms.dto';
import { AdminCmsService } from '@/modules/admin/services/admin-cms.service';

@ApiTags('cms')
@Controller('cms')
@Public()
@SkipThrottle()
@ApiPublicErrors()
export class CmsPublicController {
  constructor(private readonly adminCmsService: AdminCmsService) {}

  @Get('banners')
  @HttpCache({ ttlSeconds: 120 })
  @ApiOperation({ summary: 'List published storefront banners' })
  @ApiOkResponse({ type: PublicCmsBannerResponseDto, isArray: true })
  listBanners(@Query() query: PublicBannersQueryDto) {
    return this.adminCmsService.listPublicBanners(query.placement);
  }

  @Get('collections/:id')
  @HttpCache({ ttlSeconds: 120 })
  @ApiOperation({ summary: 'Get published banner product collection by banner id' })
  @ApiOkResponse({ type: PublicCmsCollectionResponseDto })
  getCollection(@Param('id') id: string) {
    return this.adminCmsService.getPublicCollection(id);
  }

  @Get('pages')
  @HttpCache({ ttlSeconds: 120 })
  @ApiOperation({ summary: 'List published static CMS pages' })
  @ApiOkResponse({ type: PublicCmsStaticPageSummaryResponseDto, isArray: true })
  listStaticPages() {
    return this.adminCmsService.listPublicStaticPages();
  }

  @Get('pages/:slug')
  @HttpCache({ ttlSeconds: 120 })
  @ApiOperation({ summary: 'Get published static page by slug' })
  @ApiOkResponse({ type: PublicCmsStaticPageResponseDto })
  getStaticPage(@Param('slug') slug: string) {
    return this.adminCmsService.getPublicStaticPageBySlug(slug);
  }

  @Get('homepage')
  @HttpCache({ ttlSeconds: 120 })
  @ApiOperation({ summary: 'Get storefront homepage CMS config' })
  @ApiOkResponse({ type: PublicCmsHomepageResponseDto })
  getHomepage() {
    return this.adminCmsService.getPublicHomepage();
  }

  @Get('seo')
  @HttpCache({ ttlSeconds: 120 })
  @ApiOperation({ summary: 'Get storefront global SEO settings' })
  @ApiOkResponse({ type: PublicCmsSeoResponseDto })
  getSeo() {
    return this.adminCmsService.getPublicSeo();
  }
}
