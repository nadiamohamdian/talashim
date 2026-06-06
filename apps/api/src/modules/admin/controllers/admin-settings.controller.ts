import { Body, Controller, Get, Patch, UseGuards } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ApiProtected } from '@/swagger/decorators/api-protected.decorator';
import { StaffRoleGuard } from '@/common/guards/staff-role.guard';
import { CurrentUser } from '@/common/decorators/current-user.decorator';
import type { AuthenticatedUser } from '@/common/interfaces/auth-user.interface';
import {
  PatchPlatformSettingsDto,
  PlatformSettingsResponseDto,
} from '../dto/platform-settings.dto';
import { AdminSettingsService } from '../services/admin-settings.service';

@ApiTags('admin')
@ApiProtected()
@UseGuards(StaffRoleGuard)
@Controller('admin/settings')
export class AdminSettingsController {
  constructor(private readonly adminSettingsService: AdminSettingsService) {}

  @Get()
  @ApiOperation({ summary: 'Get platform settings' })
  @ApiOkResponse({ type: PlatformSettingsResponseDto })
  getSettings(@CurrentUser() actor: AuthenticatedUser) {
    return this.adminSettingsService.getSettings(actor);
  }

  @Patch()
  @ApiOperation({ summary: 'Update platform settings (partial)' })
  @ApiOkResponse({ type: PlatformSettingsResponseDto })
  patchSettings(
    @Body() payload: PatchPlatformSettingsDto,
    @CurrentUser() actor: AuthenticatedUser,
  ) {
    return this.adminSettingsService.patchSettings(payload, actor);
  }
}
