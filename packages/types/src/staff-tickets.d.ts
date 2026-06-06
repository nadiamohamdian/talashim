export type StaffTicketStatus = 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';
export type StaffTicketPriority = 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT';
export interface StaffTicketAuthor {
    id: string;
    email: string;
    fullName: string;
    role: string;
}
export interface StaffTicketListItem {
    id: string;
    ticketNumber: string;
    subject: string;
    status: StaffTicketStatus;
    priority: StaffTicketPriority;
    category: string;
    createdBy: StaffTicketAuthor;
    messageCount: number;
    lastMessageAt: string | null;
    createdAt: string;
    updatedAt: string;
}
export interface StaffTicketMessage {
    id: string;
    body: string;
    author: StaffTicketAuthor;
    createdAt: string;
}
export interface StaffTicketDetail {
    id: string;
    ticketNumber: string;
    subject: string;
    body: string;
    status: StaffTicketStatus;
    priority: StaffTicketPriority;
    category: string;
    createdBy: StaffTicketAuthor;
    closedBy: StaffTicketAuthor | null;
    closedAt: string | null;
    createdAt: string;
    updatedAt: string;
    messages: StaffTicketMessage[];
}
export interface CreateStaffTicketPayload {
    subject: string;
    body: string;
    priority?: StaffTicketPriority;
    category?: string;
}
export interface ReplyStaffTicketPayload {
    body: string;
    status?: StaffTicketStatus;
}
export interface UpdateStaffTicketPayload {
    status?: StaffTicketStatus;
    priority?: StaffTicketPriority;
}
