import { Controller, Get } from '@nestjs/common';
import { SkipThrottle } from '@nestjs/throttler';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Public } from '@/common/decorators/public.decorator';
import { ApiPublicErrors } from '@/swagger/decorators/api-protected.decorator';
import {
  SiteConfigResponseDto,
  SiteStatusResponseDto,
} from '@/modules/admin/dto/platform-settings.dto';
import { AdminSettingsService } from '@/modules/admin/services/admin-settings.service';

@ApiTags('site')
@Controller('site')
@Public()
@SkipThrottle()
export class SiteController {
  constructor(private readonly adminSettingsService: AdminSettingsService) {}

  @Get('status')
  @ApiOperation({ summary: 'Public storefront status (maintenance mode)' })
  @ApiOkResponse({ type: SiteStatusResponseDto })
  @ApiPublicErrors()
  getStatus() {
    return this.adminSettingsService.getPublicSiteStatus();
  }

  @Get('config')
  @ApiOperation({ summary: 'Public storefront configuration' })
  @ApiOkResponse({ type: SiteConfigResponseDto })
  @ApiPublicErrors()
  getConfig() {
    return this.adminSettingsService.getPublicSiteConfig();
  }
}
