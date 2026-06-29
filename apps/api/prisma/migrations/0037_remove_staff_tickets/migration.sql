-- Remove deprecated staff ticket system (permissions + tables).

DELETE FROM "StaffRolePermission"
WHERE "permission" IN (
  'admin.tickets.read',
  'admin.tickets.write',
  'admin.tickets.manage'
);

DROP TABLE IF EXISTS "StaffTicketMessage";
DROP TABLE IF EXISTS "StaffTicket";

DROP TYPE IF EXISTS "StaffTicketStatus";
DROP TYPE IF EXISTS "StaffTicketPriority";
