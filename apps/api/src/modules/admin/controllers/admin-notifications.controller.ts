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
  AdminDeliveryQueryDto,
  AdminNotificationsInboxQueryDto,
  AdminRulesQueryDto,
  AdminTemplatesQueryDto,
  CreateStaffNotificationDto,
  UpsertNotificationRuleDto,
  UpsertNotificationTemplateDto,
} from '../dto/admin-notifications.dto';
import { AdminNotificationsService } from '../services/admin-notifications.service';

@ApiTags('admin-notifications')
@ApiProtected()
@UseGuards(StaffRoleGuard)
@Controller('admin/notifications')
export class AdminNotificationsController {
  constructor(private readonly adminNotificationsService: AdminNotificationsService) {}

  @Get()
  @ApiOperation({ summary: 'Staff notification inbox' })
  listInbox(
    @Query() query: AdminNotificationsInboxQueryDto,
    @CurrentUser() actor: AuthenticatedUser,
  ) {
    return this.adminNotificationsService.listInbox(query, actor);
  }

  @Post()
  @ApiOperation({ summary: 'Broadcast staff notification' })
  broadcast(@Body() dto: CreateStaffNotificationDto, @CurrentUser() actor: AuthenticatedUser) {
    return this.adminNotificationsService.broadcast(dto, actor);
  }

  @Patch('read-all')
  @ApiOperation({ summary: 'Mark all inbox notifications as read' })
  markAllRead(@CurrentUser() actor: AuthenticatedUser) {
    return this.adminNotificationsService.markAllRead(actor);
  }

  @Patch(':id/read')
  @ApiOperation({ summary: 'Mark notification as read' })
  markRead(@Param('id') id: string, @CurrentUser() actor: AuthenticatedUser) {
    return this.adminNotificationsService.markRead(id, actor);
  }

  @Get('templates')
  @ApiOperation({ summary: 'List notification templates' })
  listTemplates(
    @Query() query: AdminTemplatesQueryDto,
    @CurrentUser() actor: AuthenticatedUser,
  ) {
    return this.adminNotificationsService.listTemplates(query, actor);
  }

  @Post('templates')
  @ApiOperation({ summary: 'Create notification template' })
  createTemplate(
    @Body() dto: UpsertNotificationTemplateDto,
    @CurrentUser() actor: AuthenticatedUser,
  ) {
    return this.adminNotificationsService.createTemplate(dto, actor);
  }

  @Patch('templates/:id')
  @ApiOperation({ summary: 'Update notification template' })
  updateTemplate(
    @Param('id') id: string,
    @Body() dto: UpsertNotificationTemplateDto,
    @CurrentUser() actor: AuthenticatedUser,
  ) {
    return this.adminNotificationsService.updateTemplate(id, dto, actor);
  }

  @Delete('templates/:id')
  @ApiOperation({ summary: 'Delete notification template' })
  deleteTemplate(@Param('id') id: string, @CurrentUser() actor: AuthenticatedUser) {
    return this.adminNotificationsService.deleteTemplate(id, actor);
  }

  @Get('rules')
  @ApiOperation({ summary: 'List notification rules' })
  listRules(@Query() query: AdminRulesQueryDto, @CurrentUser() actor: AuthenticatedUser) {
    return this.adminNotificationsService.listRules(query, actor);
  }

  @Post('rules')
  @ApiOperation({ summary: 'Create notification rule' })
  createRule(@Body() dto: UpsertNotificationRuleDto, @CurrentUser() actor: AuthenticatedUser) {
    return this.adminNotificationsService.createRule(dto, actor);
  }

  @Patch('rules/:id')
  @ApiOperation({ summary: 'Update notification rule' })
  updateRule(
    @Param('id') id: string,
    @Body() dto: UpsertNotificationRuleDto,
    @CurrentUser() actor: AuthenticatedUser,
  ) {
    return this.adminNotificationsService.updateRule(id, dto, actor);
  }

  @Delete('rules/:id')
  @ApiOperation({ summary: 'Delete notification rule' })
  deleteRule(@Param('id') id: string, @CurrentUser() actor: AuthenticatedUser) {
    return this.adminNotificationsService.deleteRule(id, actor);
  }

  @Get('delivery')
  @ApiOperation({ summary: 'Outbound delivery log' })
  listDeliveries(
    @Query() query: AdminDeliveryQueryDto,
    @CurrentUser() actor: AuthenticatedUser,
  ) {
    return this.adminNotificationsService.listDeliveries(query, actor);
  }
}
