import { Controller, Get, Query } from '@nestjs/common';
import { SkipThrottle } from '@nestjs/throttler';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { HttpCache } from '@/common/decorators/http-cache.decorator';
import { Public } from '@/common/decorators/public.decorator';
import { ApiPublicErrors } from '@/swagger/decorators/api-protected.decorator';
import {
  PublicBannersQueryDto,
  PublicCmsBannerResponseDto,
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
}
