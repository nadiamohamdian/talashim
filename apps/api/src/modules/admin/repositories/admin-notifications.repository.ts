import { Injectable } from '@nestjs/common';
import {
  NotificationChannel,
  NotificationDeliveryStatus,
  NotificationRuleTrigger,
  Prisma,
  Role,
} from '@/generated/prisma';
import { PrismaService } from '@/infrastructure/database/prisma.service';

@Injectable()
export class AdminNotificationsRepository {
  constructor(private readonly prisma: PrismaService) {}

  private inboxWhere(
    userId: string,
    role: Role,
    filters: {
      unreadOnly?: boolean;
      channel?: NotificationChannel;
      category?: string;
    },
  ): Prisma.StaffNotificationWhereInput {
    const visibility: Prisma.StaffNotificationWhereInput = {
      OR: [
        { recipientUserId: userId },
        {
          recipientUserId: null,
          OR: [{ targetRole: null }, { targetRole: role }],
        },
      ],
    };

    const where: Prisma.StaffNotificationWhereInput = {
      AND: [
        visibility,
        filters.unreadOnly ? { readAt: null } : {},
        filters.channel ? { channel: filters.channel } : {},
        filters.category ? { category: filters.category } : {},
      ],
    };

    return where;
  }

  listInbox(
    userId: string,
    role: Role,
    skip: number,
    take: number,
    filters: {
      unreadOnly?: boolean;
      channel?: NotificationChannel;
      category?: string;
    },
  ) {
    const where = this.inboxWhere(userId, role, filters);
    return this.prisma.$transaction([
      this.prisma.staffNotification.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.staffNotification.count({ where }),
      this.prisma.staffNotification.count({
        where: { ...where, readAt: null },
      }),
    ]);
  }

  findInboxItem(id: string, userId: string, role: Role) {
    return this.prisma.staffNotification.findFirst({
      where: {
        id,
        OR: [
          { recipientUserId: userId },
          {
            recipientUserId: null,
            OR: [{ targetRole: null }, { targetRole: role }],
          },
        ],
      },
    });
  }

  markRead(id: string) {
    return this.prisma.staffNotification.update({
      where: { id },
      data: { readAt: new Date() },
    });
  }

  markAllRead(userId: string, role: Role) {
    return this.prisma.staffNotification.updateMany({
      where: {
        readAt: null,
        OR: [
          { recipientUserId: userId },
          {
            recipientUserId: null,
            OR: [{ targetRole: null }, { targetRole: role }],
          },
        ],
      },
      data: { readAt: new Date() },
    });
  }

  createInboxItem(data: Prisma.StaffNotificationCreateInput) {
    return this.prisma.staffNotification.create({ data });
  }

  listTemplates(
    skip: number,
    take: number,
    filters: { search?: string; channel?: NotificationChannel },
  ) {
    const where: Prisma.NotificationTemplateWhereInput = {};
    if (filters.channel) {
      where.channel = filters.channel;
    }
    if (filters.search?.trim()) {
      where.OR = [
        { name: { contains: filters.search.trim(), mode: 'insensitive' } },
        { key: { contains: filters.search.trim(), mode: 'insensitive' } },
      ];
    }

    return this.prisma.$transaction([
      this.prisma.notificationTemplate.findMany({
        where,
        skip,
        take,
        orderBy: { updatedAt: 'desc' },
      }),
      this.prisma.notificationTemplate.count({ where }),
    ]);
  }

  findTemplateById(id: string) {
    return this.prisma.notificationTemplate.findUnique({ where: { id } });
  }

  findTemplateByKey(key: string) {
    return this.prisma.notificationTemplate.findUnique({ where: { key } });
  }

  createTemplate(data: Prisma.NotificationTemplateCreateInput) {
    return this.prisma.notificationTemplate.create({ data });
  }

  updateTemplate(id: string, data: Prisma.NotificationTemplateUpdateInput) {
    return this.prisma.notificationTemplate.update({ where: { id }, data });
  }

  deleteTemplate(id: string) {
    return this.prisma.notificationTemplate.delete({ where: { id } });
  }

  listRules(skip: number, take: number, filters: { search?: string; trigger?: NotificationRuleTrigger }) {
    const where: Prisma.NotificationRuleWhereInput = {};
    if (filters.trigger) {
      where.trigger = filters.trigger;
    }
    if (filters.search?.trim()) {
      where.name = { contains: filters.search.trim(), mode: 'insensitive' };
    }

    return this.prisma.$transaction([
      this.prisma.notificationRule.findMany({
        where,
        skip,
        take,
        orderBy: { updatedAt: 'desc' },
        include: { template: { select: { id: true, name: true } } },
      }),
      this.prisma.notificationRule.count({ where }),
    ]);
  }

  findRuleById(id: string) {
    return this.prisma.notificationRule.findUnique({
      where: { id },
      include: { template: true },
    });
  }

  createRule(data: Prisma.NotificationRuleCreateInput) {
    return this.prisma.notificationRule.create({
      data,
      include: { template: { select: { id: true, name: true } } },
    });
  }

  updateRule(id: string, data: Prisma.NotificationRuleUpdateInput) {
    return this.prisma.notificationRule.update({
      where: { id },
      data,
      include: { template: { select: { id: true, name: true } } },
    });
  }

  deleteRule(id: string) {
    return this.prisma.notificationRule.delete({ where: { id } });
  }

  listDeliveries(
    skip: number,
    take: number,
    filters: {
      status?: NotificationDeliveryStatus;
      channel?: NotificationChannel;
      search?: string;
    },
  ) {
    const where: Prisma.NotificationDeliveryWhereInput = {};
    if (filters.status) {
      where.status = filters.status;
    }
    if (filters.channel) {
      where.channel = filters.channel;
    }
    if (filters.search?.trim()) {
      where.OR = [
        { recipient: { contains: filters.search.trim(), mode: 'insensitive' } },
        { title: { contains: filters.search.trim(), mode: 'insensitive' } },
      ];
    }

    return this.prisma.$transaction([
      this.prisma.notificationDelivery.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: 'desc' },
        include: {
          template: { select: { name: true } },
          rule: { select: { name: true } },
        },
      }),
      this.prisma.notificationDelivery.count({ where }),
    ]);
  }

  countDeliveriesByStatus() {
    return this.prisma.notificationDelivery.groupBy({
      by: ['status'],
      _count: { id: true },
    });
  }
}
