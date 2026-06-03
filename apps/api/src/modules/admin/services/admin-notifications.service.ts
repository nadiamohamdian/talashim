import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ADMIN_PERMISSIONS } from '@talashim/shared/admin-rbac';
import { Role } from '@/generated/prisma';
import type {
  NotificationDeliveryDto,
  NotificationRuleDto,
  NotificationTemplateDto,
  StaffNotificationDto,
} from '@talashim/types';
import type { AuthenticatedUser } from '@/common/interfaces/auth-user.interface';
import { assertAdminPermission } from '@/common/rbac/assert-admin-permission';
import type {
  AdminDeliveryQueryDto,
  AdminNotificationsInboxQueryDto,
  AdminRulesQueryDto,
  AdminTemplatesQueryDto,
  CreateStaffNotificationDto,
  UpsertNotificationRuleDto,
  UpsertNotificationTemplateDto,
} from '../dto/admin-notifications.dto';
import { AdminNotificationsRepository } from '../repositories/admin-notifications.repository';

@Injectable()
export class AdminNotificationsService {
  constructor(private readonly notificationsRepository: AdminNotificationsRepository) {}

  async listInbox(query: AdminNotificationsInboxQueryDto, actor: AuthenticatedUser) {
    assertAdminPermission(actor.role, ADMIN_PERMISSIONS.notifications.read);

    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const skip = (page - 1) * limit;
    const role = this.staffRole(actor.role);

    const [items, total, unreadCount] = await this.notificationsRepository.listInbox(
      actor.id,
      role,
      skip,
      limit,
      {
        unreadOnly: query.unreadOnly,
        channel: query.channel,
        category: query.category,
      },
    );

    return {
      page,
      limit,
      total,
      summary: { unreadCount, totalCount: total },
      items: items.map((n) => this.mapNotification(n)),
    };
  }

  async markRead(id: string, actor: AuthenticatedUser) {
    assertAdminPermission(actor.role, ADMIN_PERMISSIONS.notifications.read);

    const role = this.staffRole(actor.role);
    const item = await this.notificationsRepository.findInboxItem(id, actor.id, role);
    if (!item) {
      throw new NotFoundException('Notification not found');
    }

    const updated = await this.notificationsRepository.markRead(id);
    return this.mapNotification(updated);
  }

  async markAllRead(actor: AuthenticatedUser) {
    assertAdminPermission(actor.role, ADMIN_PERMISSIONS.notifications.read);

    const role = this.staffRole(actor.role);
    const result = await this.notificationsRepository.markAllRead(actor.id, role);
    return { updated: result.count };
  }

  async broadcast(dto: CreateStaffNotificationDto, actor: AuthenticatedUser) {
    assertAdminPermission(actor.role, ADMIN_PERMISSIONS.notifications.manage);

    const created = await this.notificationsRepository.createInboxItem({
      title: dto.title,
      body: dto.body,
      channel: dto.channel,
      priority: dto.priority,
      category: dto.category ?? 'operational',
      targetRole: dto.targetRole,
      recipient: dto.recipientUserId ? { connect: { id: dto.recipientUserId } } : undefined,
    });

    return this.mapNotification(created);
  }

  async listTemplates(query: AdminTemplatesQueryDto, actor: AuthenticatedUser) {
    assertAdminPermission(actor.role, ADMIN_PERMISSIONS.notifications.manage);

    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const skip = (page - 1) * limit;

    const [items, total] = await this.notificationsRepository.listTemplates(skip, limit, {
      search: query.search,
      channel: query.channel,
    });

    return {
      page,
      limit,
      total,
      items: items.map((t) => this.mapTemplate(t)),
    };
  }

  async createTemplate(dto: UpsertNotificationTemplateDto, actor: AuthenticatedUser) {
    assertAdminPermission(actor.role, ADMIN_PERMISSIONS.notifications.manage);

    const existing = await this.notificationsRepository.findTemplateByKey(dto.key);
    if (existing) {
      throw new ConflictException('Template key already exists');
    }

    const template = await this.notificationsRepository.createTemplate({
      key: dto.key,
      name: dto.name,
      channel: dto.channel,
      subject: dto.subject,
      body: dto.body,
      isActive: dto.isActive ?? true,
    });

    return this.mapTemplate(template);
  }

  async updateTemplate(
    id: string,
    dto: UpsertNotificationTemplateDto,
    actor: AuthenticatedUser,
  ) {
    assertAdminPermission(actor.role, ADMIN_PERMISSIONS.notifications.manage);

    const existing = await this.notificationsRepository.findTemplateById(id);
    if (!existing) {
      throw new NotFoundException('Template not found');
    }

    const template = await this.notificationsRepository.updateTemplate(id, {
      name: dto.name,
      channel: dto.channel,
      subject: dto.subject,
      body: dto.body,
      isActive: dto.isActive,
    });

    return this.mapTemplate(template);
  }

  async deleteTemplate(id: string, actor: AuthenticatedUser) {
    assertAdminPermission(actor.role, ADMIN_PERMISSIONS.notifications.manage);

    const existing = await this.notificationsRepository.findTemplateById(id);
    if (!existing) {
      throw new NotFoundException('Template not found');
    }

    await this.notificationsRepository.deleteTemplate(id);
    return { ok: true };
  }

  async listRules(query: AdminRulesQueryDto, actor: AuthenticatedUser) {
    assertAdminPermission(actor.role, ADMIN_PERMISSIONS.notifications.manage);

    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const skip = (page - 1) * limit;

    const [items, total] = await this.notificationsRepository.listRules(skip, limit, {
      search: query.search,
      trigger: query.trigger,
    });

    return {
      page,
      limit,
      total,
      items: items.map((r) => this.mapRule(r)),
    };
  }

  async createRule(dto: UpsertNotificationRuleDto, actor: AuthenticatedUser) {
    assertAdminPermission(actor.role, ADMIN_PERMISSIONS.notifications.manage);

    const template = await this.notificationsRepository.findTemplateById(dto.templateId);
    if (!template) {
      throw new NotFoundException('Template not found');
    }

    const rule = await this.notificationsRepository.createRule({
      name: dto.name,
      trigger: dto.trigger,
      channel: dto.channel,
      isEnabled: dto.isEnabled ?? true,
      template: { connect: { id: dto.templateId } },
    });

    return this.mapRule(rule);
  }

  async updateRule(id: string, dto: UpsertNotificationRuleDto, actor: AuthenticatedUser) {
    assertAdminPermission(actor.role, ADMIN_PERMISSIONS.notifications.manage);

    const existing = await this.notificationsRepository.findRuleById(id);
    if (!existing) {
      throw new NotFoundException('Rule not found');
    }

    const rule = await this.notificationsRepository.updateRule(id, {
      name: dto.name,
      trigger: dto.trigger,
      channel: dto.channel,
      isEnabled: dto.isEnabled,
      template: { connect: { id: dto.templateId } },
    });

    return this.mapRule(rule);
  }

  async deleteRule(id: string, actor: AuthenticatedUser) {
    assertAdminPermission(actor.role, ADMIN_PERMISSIONS.notifications.manage);

    const existing = await this.notificationsRepository.findRuleById(id);
    if (!existing) {
      throw new NotFoundException('Rule not found');
    }

    await this.notificationsRepository.deleteRule(id);
    return { ok: true };
  }

  async listDeliveries(query: AdminDeliveryQueryDto, actor: AuthenticatedUser) {
    assertAdminPermission(actor.role, ADMIN_PERMISSIONS.notifications.read);

    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const skip = (page - 1) * limit;

    const [items, total] = await this.notificationsRepository.listDeliveries(skip, limit, {
      status: query.status,
      channel: query.channel,
      search: query.search,
    });

    const statusCounts = await this.notificationsRepository.countDeliveriesByStatus();

    return {
      page,
      limit,
      total,
      summary: {
        byStatus: statusCounts.map((row) => ({
          status: row.status,
          count: row._count.id,
        })),
      },
      items: items.map((d) => this.mapDelivery(d)),
    };
  }

  private staffRole(role: string): Role {
    const upper = role.toUpperCase();
    if (upper === 'ADMIN') {
      return Role.SUPER_ADMIN;
    }
    if ((Object.values(Role) as string[]).includes(upper)) {
      return upper as Role;
    }
    return Role.SUPPORT;
  }

  private mapNotification(
    n: Awaited<ReturnType<AdminNotificationsRepository['createInboxItem']>>,
  ): StaffNotificationDto {
    return {
      id: n.id,
      title: n.title,
      body: n.body,
      channel: n.channel,
      priority: n.priority,
      category: n.category,
      targetRole: n.targetRole,
      readAt: n.readAt?.toISOString() ?? null,
      createdAt: n.createdAt.toISOString(),
    };
  }

  private mapTemplate(
    t: Awaited<ReturnType<AdminNotificationsRepository['createTemplate']>>,
  ): NotificationTemplateDto {
    return {
      id: t.id,
      key: t.key,
      name: t.name,
      channel: t.channel,
      subject: t.subject,
      body: t.body,
      isActive: t.isActive,
      createdAt: t.createdAt.toISOString(),
      updatedAt: t.updatedAt.toISOString(),
    };
  }

  private mapRule(
    r: Awaited<ReturnType<AdminNotificationsRepository['createRule']>>,
  ): NotificationRuleDto {
    return {
      id: r.id,
      name: r.name,
      trigger: r.trigger,
      templateId: r.templateId,
      templateName: r.template.name,
      channel: r.channel,
      isEnabled: r.isEnabled,
      createdAt: r.createdAt.toISOString(),
      updatedAt: r.updatedAt.toISOString(),
    };
  }

  private mapDelivery(
    d: Awaited<ReturnType<AdminNotificationsRepository['listDeliveries']>>[0][number],
  ): NotificationDeliveryDto {
    return {
      id: d.id,
      channel: d.channel,
      recipient: d.recipient,
      status: d.status,
      title: d.title,
      body: d.body,
      errorMessage: d.errorMessage,
      templateName: d.template?.name ?? null,
      ruleName: d.rule?.name ?? null,
      sentAt: d.sentAt?.toISOString() ?? null,
      createdAt: d.createdAt.toISOString(),
    };
  }
}
