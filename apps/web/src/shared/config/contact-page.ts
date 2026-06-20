export const CONTACT_PAGE_META = {
  title: 'تماس با ما',
  description: 'راه‌های ارتباط با تیم فروش و پشتیبانی طلاشیم.',
} as const;

export const CONTACT_SOCIAL_LINKS = {
  whatsapp: {
    label: 'پیام در واتساپ',
    href: 'https://wa.me/989825678413',
    display: '+9825678413',
  },
  support: {
    label: 'پشتیبانی',
    href: 'tel:+9825678413',
    display: '+9825678413',
  },
  telegram: {
    label: 'کانال تلگرام',
    href: 'https://t.me/talashim-a',
    display: '@talashim-a',
  },
  instagram: {
    label: 'اینستاگرام',
    href: 'https://instagram.com/talashim',
    display: '@talashim',
  },
} as const;

export const CONTACT_PAGE_COPY = {
  heroTitle: 'تماس با طلاشیم',
  channelsTitle: 'راه‌های ارتباطی',
  channelsLead:
    'برای مشاوره خرید، پیگیری سفارش و... ، تیم طلاشیم همراه شماست.',
  faqTitle: 'سوالی دارید؟',
  faqLead:
    'پاسخ بسیاری از سوالات درباره سفارش، ارسال، پرداخت و محصولات را در بخش سوالات متداول آماده کرده‌ایم.',
  faqButton: 'سوالات متداول',
  formTitle: 'پیام شما را می‌شنویم',
  formLead: 'سؤال یا درخواستی دارید؟ پیام خود را ارسال کنید.',
  submitLabel: 'ارسال',
  submitPendingLabel: 'در حال ارسال...',
  successMessage: 'پیام شما ثبت شد. به‌زودی با شما تماس می‌گیریم.',
} as const;
