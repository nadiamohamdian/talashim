import { axiosClient } from '@/shared/api/axios-client';
import type {
  NotificationDeliveryDto,
  NotificationRuleDto,
  NotificationTemplateDto,
  StaffNotificationDto,
} from '@sadafgold/types';
import type { PaginatedResponse } from '@sadafgold/types';

export interface InboxResponse extends PaginatedResponse<StaffNotificationDto> {
  summary: { unreadCount: number; totalCount: number };
}

export function fetchNotificationInbox(params?: {
  page?: number;
  unreadOnly?: boolean;
  channel?: string;
  category?: string;
}) {
  return axiosClient.get<InboxResponse>('/admin/notifications', { params }).then((r) => r.data);
}

export function markNotificationRead(id: string) {
  return axiosClient
    .patch<StaffNotificationDto>(`/admin/notifications/${id}/read`)
    .then((r) => r.data);
}

export function markAllNotificationsRead() {
  return axiosClient
    .patch<{ updated: number }>('/admin/notifications/read-all')
    .then((r) => r.data);
}

export function broadcastNotification(body: {
  title: string;
  body: string;
  channel?: string;
  priority?: string;
  category?: string;
  targetRole?: string;
}) {
  return axiosClient.post<StaffNotificationDto>('/admin/notifications', body).then((r) => r.data);
}

export function fetchNotificationTemplates(params?: {
  page?: number;
  search?: string;
  channel?: string;
}) {
  return axiosClient
    .get<PaginatedResponse<NotificationTemplateDto>>('/admin/notifications/templates', { params })
    .then((r) => r.data);
}

export function createNotificationTemplate(body: Record<string, unknown>) {
  return axiosClient
    .post<NotificationTemplateDto>('/admin/notifications/templates', body)
    .then((r) => r.data);
}

export function updateNotificationTemplate(id: string, body: Record<string, unknown>) {
  return axiosClient
    .patch<NotificationTemplateDto>(`/admin/notifications/templates/${id}`, body)
    .then((r) => r.data);
}

export function deleteNotificationTemplate(id: string) {
  return axiosClient
    .delete<{ ok: boolean }>(`/admin/notifications/templates/${id}`)
    .then((r) => r.data);
}

export function fetchNotificationRules(params?: {
  page?: number;
  search?: string;
  trigger?: string;
}) {
  return axiosClient
    .get<PaginatedResponse<NotificationRuleDto>>('/admin/notifications/rules', { params })
    .then((r) => r.data);
}

export function createNotificationRule(body: Record<string, unknown>) {
  return axiosClient
    .post<NotificationRuleDto>('/admin/notifications/rules', body)
    .then((r) => r.data);
}

export function updateNotificationRule(id: string, body: Record<string, unknown>) {
  return axiosClient
    .patch<NotificationRuleDto>(`/admin/notifications/rules/${id}`, body)
    .then((r) => r.data);
}

export function deleteNotificationRule(id: string) {
  return axiosClient
    .delete<{ ok: boolean }>(`/admin/notifications/rules/${id}`)
    .then((r) => r.data);
}

export interface DeliveryListResponse extends PaginatedResponse<NotificationDeliveryDto> {
  summary: { byStatus: Array<{ status: string; count: number }> };
}

export function fetchNotificationDeliveries(params?: {
  page?: number;
  status?: string;
  channel?: string;
  search?: string;
}) {
  return axiosClient
    .get<DeliveryListResponse>('/admin/notifications/delivery', { params })
    .then((r) => r.data);
}
