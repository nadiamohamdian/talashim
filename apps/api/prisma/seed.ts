import argon2 from 'argon2';
import { PrismaClient, ProductCategory, Role } from '../src/generated/prisma';
import {
  DEFAULT_CMS_HERO,
  DEFAULT_CMS_SECTIONS,
  DEFAULT_CMS_SEO,
} from '../src/modules/admin/cms/cms-defaults';
import { getApiEnv } from '../src/config/env';

const prisma = new PrismaClient();

async function main() {
  const staffPasswordHash = await argon2.hash('Admin12345!');

  const staffAccounts: Array<{
    email: string;
    fullName: string;
    role: Role;
  }> = [
    { email: 'admin@talashim.local', fullName: 'سوپر ادمین', role: Role.SUPER_ADMIN },
    { email: 'support@talashim.local', fullName: 'پشتیبان سایت', role: Role.SUPPORT },
    { email: 'accountant@talashim.local', fullName: 'حسابدار', role: Role.ACCOUNTANT },
    { email: 'editor@talashim.local', fullName: 'ادیتور', role: Role.EDITOR },
    { email: 'warehouse@talashim.local', fullName: 'انباردار', role: Role.WAREHOUSE },
  ];

  let superAdminId: string | null = null;

  for (const account of staffAccounts) {
    const user = await prisma.user.upsert({
      where: { email: account.email },
      update: {
        role: account.role,
        fullName: account.fullName,
        passwordHash: staffPasswordHash,
      },
      create: {
        email: account.email,
        fullName: account.fullName,
        passwordHash: staffPasswordHash,
        role: account.role,
      },
    });
    if (account.role === Role.SUPER_ADMIN) {
      superAdminId = user.id;
    }
  }

  await prisma.blogCategory.upsert({
    where: { slug: 'guides' },
    update: {},
    create: {
      slug: 'guides',
      title: 'راهنماها',
    },
  });

  await prisma.blogCategory.upsert({
    where: { slug: 'faq' },
    update: {},
    create: {
      slug: 'faq',
      title: 'سوالات متداول',
    },
  });

  const products = [
    {
      sku: 'TL-R-0412-01',
      slug: 'van-cleef-alhambra-ring',
      title: 'انگشتر طلا زنانه ونکلیف الحمرا',
      category: ProductCategory.RING,
      karat: 18,
      weightGram: '4.12',
      makingFeePercent: 19,
      priceToman: 0,
      imageUrl:
        'https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&w=900&q=80',
      description:
        'انگشتر طلا ۱۸ عیار با الهام از طرح کلاسیک ونکلیف الحمرا؛ قیمت نهایی بر اساس وزن، اجرت و نرخ لحظه‌ای طلا محاسبه می‌شود.',
      seoDescription:
        'انگشتر طلا زنانه ونکلیف الحمرا ۱۸ عیار با وزن ۴.۱۲ گرم و اجرت ۱۹٪.',
      featured: true,
      quantity: 5,
    },
    {
      sku: 'TL-R-0480-01',
      slug: 'royal-ring',
      title: 'انگشتر طلای رویال',
      category: ProductCategory.RING,
      karat: 18,
      weightGram: '4.80',
      makingFeePercent: 9,
      priceToman: 0,
      imageUrl:
        'https://images.unsplash.com/photo-1617038220319-276d3cfab638?auto=format&fit=crop&w=900&q=80',
      description:
        'انگشتر 18 عیار با طراحی کلاسیک و مناسب فروش آنلاین با نمایش قیمت شفاف.',
      seoDescription:
        'انگشتر طلای رویال با نمایش شفاف وزن، اجرت و قیمت روز برای خرید امن.',
      featured: true,
      quantity: 3,
    },
    {
      sku: 'TL-N-1120-01',
      slug: 'talashim-necklace',
      title: 'گردنبند تلاشیم',
      category: ProductCategory.NECKLACE,
      karat: 18,
      weightGram: '11.20',
      makingFeePercent: 11,
      priceToman: 0,
      imageUrl:
        'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=900&q=80',
      description:
        'گردنبند مینیمال برای فروشگاه طلا با توضیح دقیق محصول و تصویر استاندارد.',
      seoDescription: 'گردنبند طلای تلاشیم با کیفیت ساخت بالا و قیمت روز.',
      featured: true,
      quantity: 2,
    },
  ];

  for (const item of products) {
    const product = await prisma.product.upsert({
      where: { slug: item.slug },
      update: {
        sku: item.sku,
        title: item.title,
        description: item.description,
        seoDescription: item.seoDescription,
        category: item.category,
        karat: item.karat,
        weightGram: item.weightGram,
        makingFeePercent: item.makingFeePercent,
        priceToman: item.priceToman,
        imageUrl: item.imageUrl,
        featured: item.featured,
      },
      create: {
        sku: item.sku,
        slug: item.slug,
        title: item.title,
        description: item.description,
        seoDescription: item.seoDescription,
        category: item.category,
        karat: item.karat,
        weightGram: item.weightGram,
        makingFeePercent: item.makingFeePercent,
        priceToman: item.priceToman,
        imageUrl: item.imageUrl,
        featured: item.featured,
      },
    });

    await prisma.inventoryItem.upsert({
      where: { productId: product.id },
      update: {
        quantity: item.quantity,
      },
      create: {
        productId: product.id,
        quantity: item.quantity,
      },
    });
  }

  const guidesCategory = await prisma.blogCategory.findUniqueOrThrow({
    where: { slug: 'guides' },
  });

  await prisma.blogPost.upsert({
    where: { slug: 'how-to-buy-gold-online' },
    update: {},
    create: {
      categoryId: guidesCategory.id,
      slug: 'how-to-buy-gold-online',
      title: 'راهنمای خرید امن طلا از فروشگاه آنلاین',
      excerpt:
        'وزن، عیار، اجرت و سیاست مرجوعی از مهم‌ترین چیزهایی هستند که باید قبل از خرید بررسی شوند.',
      content:
        'قبل از خرید طلا، وزن دقیق، عیار، اجرت ساخت و قیمت لحظه‌ای را از فروشنده درخواست کنید. فاکتور رسمی و امکان استعلام اصالت از الزامات خرید امن است.',
      coverImageUrl:
        'https://images.unsplash.com/photo-1617038220319-276d3cfab638?auto=format&fit=crop&w=1200&q=80',
      publishedAt: new Date('2026-05-01'),
    },
  });

  const faqCategory = await prisma.blogCategory.findUniqueOrThrow({
    where: { slug: 'faq' },
  });

  const faqPosts = [
    {
      slug: 'faq-shipping',
      title: 'زمان ارسال سفارش‌ها چقدر است؟',
      excerpt: 'ارسال سفارش‌های تأییدشده معمولاً ۲ تا ۵ روز کاری زمان می‌برد.',
      content:
        'پس از تأیید پرداخت، سفارش شما آماده‌سازی و از طریق پست پیشتاز یا پیک اختصاصی (در تهران) ارسال می‌شود. کد رهگیری از طریق پنل کاربری و پیامک اطلاع‌رسانی می‌شود.',
    },
    {
      slug: 'faq-authenticity',
      title: 'چگونه اصالت طلا را بررسی کنم؟',
      excerpt: 'هر محصول دارای مشخصات وزن، عیار و فاکتور رسمی است.',
      content:
        'تمام محصولات تلاشیم با مشخصات دقیق وزن و عیار عرضه می‌شوند. فاکتور رسمی همراه سفارش ارسال شده و امکان مراجعه به آزمایشگاه معتبر برای کاربران فراهم است.',
    },
    {
      slug: 'faq-trading-kyc',
      title: 'برای معاملات طلا به چه چیزی نیاز دارم؟',
      excerpt: 'تکمیل احراز هویت (KYC) برای معاملات و برداشت الزامی است.',
      content:
        'پس از ثبت‌نام، از بخش احراز هویت مدارک خود را ارسال کنید. پس از تأیید تیم، دسترسی به معاملات آب‌شده و برداشت از کیف پول فعال می‌شود.',
    },
  ];

  for (const post of faqPosts) {
    await prisma.blogPost.upsert({
      where: { slug: post.slug },
      update: {},
      create: {
        categoryId: faqCategory.id,
        slug: post.slug,
        title: post.title,
        excerpt: post.excerpt,
        content: post.content,
        coverImageUrl:
          'https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&w=1200&q=80',
        publishedAt: new Date('2026-05-15'),
      },
    });
  }

  const apiEnv = getApiEnv();
  await prisma.pricingConfig.upsert({
    where: { id: 'default' },
    update: {},
    create: {
      id: 'default',
      spreadPercent: apiEnv.GOLD_SPREAD_PERCENT,
      tradeCommissionPercent: apiEnv.GOLD_TRADE_COMMISSION_PERCENT,
      defaultMakingFeePercent: 10,
      refreshIntervalMs: apiEnv.GOLD_PRICE_REFRESH_MS,
      brsEnabled: Boolean(apiEnv.BRS_API_KEY),
    },
  });

  await prisma.cmsHomepage.upsert({
    where: { id: 'default' },
    update: {},
    create: {
      id: 'default',
      hero: DEFAULT_CMS_HERO as object,
      sections: DEFAULT_CMS_SECTIONS as object,
    },
  });

  await prisma.cmsSeoSettings.upsert({
    where: { id: 'default' },
    update: {},
    create: {
      id: 'default',
      siteTitle: DEFAULT_CMS_SEO.siteTitle,
      siteDescription: DEFAULT_CMS_SEO.siteDescription,
      defaultOgImageUrl: DEFAULT_CMS_SEO.defaultOgImageUrl,
      robotsIndex: DEFAULT_CMS_SEO.robotsIndex,
      googleAnalyticsId: DEFAULT_CMS_SEO.googleAnalyticsId,
      extraMeta: DEFAULT_CMS_SEO.extraMeta ?? undefined,
    },
  });

  const staticPages = [
    {
      slug: 'about',
      title: 'درباره تلاشیم',
      content:
        'تلاشیم فروشگاه آنلاین طلا و جواهر با تمرکز بر شفافیت قیمت، وزن دقیق و ارسال امن است.',
      isPublished: true,
    },
    {
      slug: 'terms',
      title: 'قوانین و مقررات',
      content: 'متن قوانین استفاده از فروشگاه تلاشیم در این صفحه نمایش داده می‌شود.',
      isPublished: true,
    },
    {
      slug: 'policies',
      title: 'سیاست‌ها',
      content: 'سیاست مرجوعی، حریم خصوصی و شرایط خرید.',
      isPublished: true,
    },
  ];

  for (const page of staticPages) {
    await prisma.cmsStaticPage.upsert({
      where: { slug: page.slug },
      update: {},
      create: page,
    });
  }

  await prisma.cmsBanner.upsert({
    where: { id: 'seed-home-mid-1' },
    update: {},
    create: {
      id: 'seed-home-mid-1',
      title: 'کالکشن بهاره',
      subtitle: 'تا ۱۵٪ اجرت ساخت روی گوشواره‌های منتخب',
      imageUrl:
        'https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&w=1200&q=80',
      linkUrl: '/products',
      placement: 'HOME_MID',
      sortOrder: 0,
      status: 'PUBLISHED',
    },
  });

  const smsTemplate = await prisma.notificationTemplate.upsert({
    where: { key: 'order_paid_sms' },
    update: {},
    create: {
      key: 'order_paid_sms',
      name: 'پرداخت سفارش (پیامک)',
      channel: 'SMS',
      body: 'سفارش {{orderNumber}} با موفقیت پرداخت شد. مبلغ: {{totalToman}} تومان',
      isActive: true,
    },
  });

  const emailTemplate = await prisma.notificationTemplate.upsert({
    where: { key: 'kyc_approved_email' },
    update: {},
    create: {
      key: 'kyc_approved_email',
      name: 'تأیید احراز هویت (ایمیل)',
      channel: 'EMAIL',
      subject: 'احراز هویت شما تأیید شد',
      body: 'کاربر گرامی {{fullName}}، احراز هویت شما در تلاشیم تأیید شد.',
      isActive: true,
    },
  });

  await prisma.notificationRule.upsert({
    where: { id: 'seed-rule-order-paid' },
    update: {},
    create: {
      id: 'seed-rule-order-paid',
      name: 'اطلاع پرداخت سفارش',
      trigger: 'ORDER_PAID',
      templateId: smsTemplate.id,
      channel: 'SMS',
      isEnabled: true,
    },
  });

  await prisma.notificationRule.upsert({
    where: { id: 'seed-rule-kyc' },
    update: {},
    create: {
      id: 'seed-rule-kyc',
      name: 'ایمیل تأیید KYC',
      trigger: 'KYC_APPROVED',
      templateId: emailTemplate.id,
      channel: 'EMAIL',
      isEnabled: true,
    },
  });

  await prisma.staffNotification.createMany({
    data: [
      {
        title: 'خوش آمدید به پنل عملیات',
        body: 'مرکز اعلان‌های تلاشیم فعال است. قوانین و قالب‌ها را از منوی کناری مدیریت کنید.',
        channel: 'IN_APP',
        priority: 'NORMAL',
        category: 'system',
        targetRole: null,
      },
      {
        title: 'هشدار موجودی',
        body: 'حداقل یک SKU در آستانه کم‌موجودی است. گزارش موجودی را بررسی کنید.',
        channel: 'IN_APP',
        priority: 'HIGH',
        category: 'operational',
        targetRole: 'WAREHOUSE',
      },
    ],
    skipDuplicates: true,
  });

  await prisma.notificationDelivery.createMany({
    data: [
      {
        templateId: smsTemplate.id,
        channel: 'SMS',
        recipient: '+989121234567',
        status: 'DELIVERED',
        title: 'پرداخت سفارش',
        body: 'سفارش TL-123 با موفقیت پرداخت شد.',
        sentAt: new Date(),
      },
      {
        channel: 'EMAIL',
        recipient: 'customer@example.com',
        status: 'FAILED',
        title: 'تأیید KYC',
        body: 'احراز هویت تأیید شد.',
        errorMessage: 'SMTP connection timeout (seed demo)',
      },
    ],
    skipDuplicates: true,
  });

  await prisma.auditLog.create({
    data: {
      actorId: superAdminId,
      action: 'seed.completed',
      context: {
        by: 'prisma.seed',
      },
    },
  });
}

main()
  .catch(async (error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
