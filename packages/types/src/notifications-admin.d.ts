export interface StaffNotificationDto {
    id: string;
    title: string;
    body: string;
    channel: string;
    priority: string;
    category: string;
    targetRole: string | null;
    readAt: string | null;
    createdAt: string;
    metadata?: Record<string, unknown> | null;
}
export interface NotificationTemplateDto {
    id: string;
    key: string;
    name: string;
    channel: string;
    subject: string | null;
    body: string;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}
export interface NotificationRuleDto {
    id: string;
    name: string;
    trigger: string;
    templateId: string;
    templateName: string;
    channel: string;
    isEnabled: boolean;
    createdAt: string;
    updatedAt: string;
}
export interface NotificationDeliveryDto {
    id: string;
    channel: string;
    recipient: string;
    status: string;
    title: string | null;
    body: string;
    errorMessage: string | null;
    templateName: string | null;
    ruleName: string | null;
    sentAt: string | null;
    createdAt: string;
}
export interface NotificationInboxSummary {
    unreadCount: number;
    totalCount: number;
}
//# sourceMappingURL=notifications-admin.d.ts.map