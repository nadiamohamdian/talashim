export interface RequiredEndpoint {
  method: 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE';
  path: string;
  description: string;
}

export interface ApiRequirementBlock {
  title: string;
  summary: string;
  endpoints: RequiredEndpoint[];
}

export const API_REQUIREMENTS = {
  notifications: {
    title: 'اعلان‌های ادمین',
    summary: 'فید اعلان realtime و تاریخچه اعلان‌های عملیاتی.',
    endpoints: [
      { method: 'GET', path: '/admin/notifications', description: 'List admin notifications' },
      { method: 'PATCH', path: '/admin/notifications/:id/read', description: 'Mark as read' },
    ],
  },
  productsCreate: {
    title: 'ایجاد محصول',
    summary: 'CRUD ادمین برای کاتالوگ — فعلاً فقط خواندن عمومی موجود است.',
    endpoints: [
      {
        method: 'POST',
        path: '/admin/products',
        description: 'Create product with SKU, gallery, SEO',
      },
      { method: 'POST', path: '/admin/products/:id/images', description: 'Upload gallery images' },
    ],
  },
  productsEdit: {
    title: 'ویرایش محصول',
    summary: 'به‌روزرسانی فیلدهای محصول، variants و SEO.',
    endpoints: [
      { method: 'GET', path: '/admin/products/:id', description: 'Admin product detail' },
      { method: 'PATCH', path: '/admin/products/:id', description: 'Update product fields' },
      { method: 'DELETE', path: '/admin/products/:id', description: 'Soft delete product' },
    ],
  },
  inventory: {
    title: 'مدیریت موجودی',
    summary: 'ردیابی، تعدیل و گزارش موجودی انبار.',
    endpoints: [
      { method: 'GET', path: '/admin/inventory', description: 'Paginated stock overview' },
      {
        method: 'POST',
        path: '/admin/inventory/adjustments',
        description: 'Stock adjustment with audit',
      },
      { method: 'GET', path: '/admin/inventory/history', description: 'Movement history' },
      { method: 'GET', path: '/admin/inventory/reports', description: 'Inventory reports export' },
    ],
  },
  orders: {
    title: 'مدیریت سفارش',
    summary: 'لیست، جزئیات، وضعیت، فاکتور، مرجوعی و ارسال.',
    endpoints: [
      { method: 'GET', path: '/admin/orders', description: 'Paginated order list' },
      { method: 'GET', path: '/admin/orders/:id', description: 'Order detail with line items' },
      { method: 'PATCH', path: '/admin/orders/:id/status', description: 'Status transitions' },
      { method: 'GET', path: '/admin/orders/:id/invoice', description: 'Invoice PDF/JSON' },
      { method: 'POST', path: '/admin/orders/:id/refunds', description: 'Process refund' },
      { method: 'PATCH', path: '/admin/orders/:id/shipment', description: 'Shipment tracking' },
    ],
  },
  userDetail: {
    title: 'جزئیات کاربر',
    summary: 'پروفایل کامل، فعالیت و کیف پول کاربر.',
    endpoints: [
      { method: 'GET', path: '/admin/users/:id', description: 'User profile + wallets summary' },
      { method: 'GET', path: '/admin/users/:id/activity', description: 'Activity timeline' },
    ],
  },
  permissions: {
    title: 'دسترسی‌های granular',
    summary: 'RBAC فراتر از CUSTOMER/ADMIN.',
    endpoints: [
      { method: 'GET', path: '/admin/permissions', description: 'Permission catalog' },
      { method: 'PATCH', path: '/admin/users/:id/permissions', description: 'Assign permissions' },
    ],
  },
  vendors: {
    title: 'بازارچه — فروشندگان',
    summary: 'آماده برای multi-vendor؛ مدل Vendor در Prisma و ماژول NestJS.',
    endpoints: [
      { method: 'GET', path: '/admin/vendors', description: 'Vendor directory' },
      { method: 'GET', path: '/admin/vendors/applications', description: 'Pending applications' },
      { method: 'PATCH', path: '/admin/vendors/:id/approve', description: 'Approve vendor' },
      { method: 'PATCH', path: '/admin/vendors/:id/verify', description: 'Verification workflow' },
      { method: 'GET', path: '/admin/vendors/:id/products', description: 'Vendor catalog' },
      { method: 'GET', path: '/admin/vendors/:id/reports', description: 'Vendor performance' },
      { method: 'GET', path: '/admin/vendors/:id/wallet', description: 'Vendor wallet' },
    ],
  },
  tradingSettlement: {
    title: 'تسویه معاملات',
    summary: 'رهگیری settlement و تطبیق معاملات ذوب‌شده.',
    endpoints: [
      { method: 'GET', path: '/admin/trading/settlements', description: 'Settlement queue' },
      { method: 'PATCH', path: '/admin/trading/settlements/:id', description: 'Mark settled' },
    ],
  },
  tradingReports: {
    title: 'گزارش معاملات',
    summary: 'گزارش‌های تجمیعی معاملات طلا.',
    endpoints: [
      { method: 'GET', path: '/admin/reports/trading', description: 'Trading analytics export' },
    ],
  },
  pricingAdmin: {
    title: 'تنظیمات قیمت‌گذاری',
    summary: 'مدیریت provider، margin، commission و override — فعلاً فقط live/history عمومی.',
    endpoints: [
      { method: 'GET', path: '/admin/pricing/providers', description: 'Provider health & config' },
      { method: 'PATCH', path: '/admin/pricing/margins', description: 'Margin rules' },
      { method: 'PATCH', path: '/admin/pricing/commissions', description: 'Commission rules' },
      { method: 'POST', path: '/admin/pricing/overrides', description: 'Manual price override' },
      {
        method: 'POST',
        path: '/admin/pricing/refresh',
        description: 'Admin-only refresh (move from public)',
      },
    ],
  },
  financeLedger: {
    title: 'دفتر کل و حسابداری',
    summary: 'دسترسی read-only به ledger دوطرفه.',
    endpoints: [
      { method: 'GET', path: '/admin/ledger/entries', description: 'Journal entries' },
      { method: 'GET', path: '/admin/accounting/records', description: 'Accounting records' },
      { method: 'GET', path: '/admin/reports/financial', description: 'P&L and balance reports' },
    ],
  },
  cms: {
    title: 'مدیریت محتوا',
    summary: 'CRUD برای homepage، بنر، FAQ، SEO و صفحات ثابت.',
    endpoints: [
      { method: 'GET', path: '/admin/cms/homepage', description: 'Homepage blocks' },
      { method: 'PATCH', path: '/admin/cms/homepage', description: 'Update homepage' },
      { method: 'GET', path: '/admin/cms/banners', description: 'List banners' },
      { method: 'POST', path: '/admin/cms/banners', description: 'Create banner' },
      { method: 'POST', path: '/admin/blog', description: 'Create blog post' },
      { method: 'PATCH', path: '/admin/blog/:id', description: 'Update blog post' },
      { method: 'GET', path: '/admin/cms/faq', description: 'List FAQ entries' },
      { method: 'GET', path: '/admin/cms/pages', description: 'List static pages' },
      { method: 'PATCH', path: '/admin/cms/seo', description: 'Global SEO settings' },
    ],
  },
  reports: {
    title: 'گزارش‌های تحلیلی',
    summary: 'گزارش فروش، موجودی، کاربر، فروشنده، معامله و مالی با بازه تاریخ.',
    endpoints: [
      { method: 'GET', path: '/admin/reports/sales', description: 'Sales report' },
      { method: 'GET', path: '/admin/reports/inventory', description: 'Inventory report' },
      { method: 'GET', path: '/admin/reports/users', description: 'User growth report' },
      { method: 'GET', path: '/admin/reports/vendors', description: 'Vendor report' },
    ],
  },
  security: {
    title: 'امنیت پیشرفته',
    summary: 'نشست‌ها، تاریخچه ورود و permission matrix.',
    endpoints: [
      { method: 'GET', path: '/admin/sessions', description: 'Active admin sessions' },
      { method: 'DELETE', path: '/admin/sessions/:id', description: 'Revoke session' },
      { method: 'GET', path: '/admin/login-history', description: 'Login audit' },
      { method: 'GET', path: '/admin/roles', description: 'Custom roles' },
      { method: 'POST', path: '/admin/roles', description: 'Create role' },
    ],
  },
} as const satisfies Record<string, ApiRequirementBlock>;
