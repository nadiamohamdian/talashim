-- Align default staff permissions with operational responsibilities.

DELETE FROM "StaffRolePermission"
WHERE "role" IN ('SUPPORT', 'ACCOUNTANT', 'EDITOR', 'WAREHOUSE');

INSERT INTO "StaffRolePermission" ("id", "role", "permission")
VALUES
  ('rbac_super_admin_finance_transactions_read', 'SUPER_ADMIN', 'admin.finance.transactions.read'),

  ('rbac_support_dashboard_view', 'SUPPORT', 'admin.dashboard.view'),
  ('rbac_support_users_read', 'SUPPORT', 'admin.users.read'),
  ('rbac_support_kyc_read', 'SUPPORT', 'admin.kyc.read'),
  ('rbac_support_orders_read', 'SUPPORT', 'admin.orders.read'),
  ('rbac_support_tickets_read', 'SUPPORT', 'admin.tickets.read'),
  ('rbac_support_tickets_write', 'SUPPORT', 'admin.tickets.write'),

  ('rbac_accountant_dashboard_view', 'ACCOUNTANT', 'admin.dashboard.view'),
  ('rbac_accountant_products_read', 'ACCOUNTANT', 'admin.products.read'),
  ('rbac_accountant_finance_transactions_read', 'ACCOUNTANT', 'admin.finance.transactions.read'),
  ('rbac_accountant_ledger_read', 'ACCOUNTANT', 'admin.ledger.read'),

  ('rbac_editor_dashboard_view', 'EDITOR', 'admin.dashboard.view'),
  ('rbac_editor_products_read', 'EDITOR', 'admin.products.read'),
  ('rbac_editor_products_write', 'EDITOR', 'admin.products.write'),
  ('rbac_editor_products_publish', 'EDITOR', 'admin.products.publish'),
  ('rbac_editor_products_videos_read', 'EDITOR', 'admin.products.videos.read'),
  ('rbac_editor_cms_read', 'EDITOR', 'admin.cms.read'),
  ('rbac_editor_cms_write', 'EDITOR', 'admin.cms.write'),
  ('rbac_editor_media_read', 'EDITOR', 'admin.media.read'),
  ('rbac_editor_media_write', 'EDITOR', 'admin.media.write'),

  ('rbac_warehouse_dashboard_view', 'WAREHOUSE', 'admin.dashboard.view'),
  ('rbac_warehouse_orders_read', 'WAREHOUSE', 'admin.orders.read'),
  ('rbac_warehouse_orders_ship', 'WAREHOUSE', 'admin.orders.ship'),
  ('rbac_warehouse_inventory_read', 'WAREHOUSE', 'admin.inventory.read')
ON CONFLICT ("role", "permission") DO NOTHING;
