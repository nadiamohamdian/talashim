import argon2 from 'argon2';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import { KycStatus, OrderStatus, PaymentStatus, PrismaClient, ProductCategory, Role } from '../src/generated/prisma';
import {
  DEFAULT_CMS_HERO,
  DEFAULT_CMS_SECTIONS,
  DEFAULT_CMS_SEO,
} from '../src/modules/admin/cms/cms-defaults';
import {
  DEV_CUSTOMER_ACCOUNT,
  DEV_PASSWORD_CUSTOMER,
  DEV_PASSWORD_STAFF,
  DEV_STAFF_ACCOUNTS,
} from '../src/modules/auth/constants/dev-test-accounts';
import { getApiEnv } from '../src/config/env';
import { ensureSeedMediaAssets } from './seed-media';
import { seedCatalogDemoProducts } from './seed-demo-products';

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error('DATABASE_URL is required for seed');
}

const pool = new Pool({ connectionString });
const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });

async function main() {
  const seedMedia = await ensureSeedMediaAssets(prisma);
  const staffPasswordHash = await argon2.hash(DEV_PASSWORD_STAFF);
  const customerPasswordHash = await argon2.hash(DEV_PASSWORD_CUSTOMER);

  const staffAccounts = Object.entries(DEV_STAFF_ACCOUNTS).map(([email, account]) => ({
    email,
    fullName: account.fullName,
    role: account.role,
  }));

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

  const customer = await prisma.user.upsert({
    where: { email: DEV_CUSTOMER_ACCOUNT.email },
    update: {
      role: DEV_CUSTOMER_ACCOUNT.role,
      fullName: DEV_CUSTOMER_ACCOUNT.fullName,
      passwordHash: customerPasswordHash,
    },
    create: {
      email: DEV_CUSTOMER_ACCOUNT.email,
      fullName: DEV_CUSTOMER_ACCOUNT.fullName,
      passwordHash: customerPasswordHash,
      role: DEV_CUSTOMER_ACCOUNT.role,
    },
  });

  await prisma.kycVerification.upsert({
    where: { userId: customer.id },
    update: {
      phone: DEV_CUSTOMER_ACCOUNT.otpPhone,
      nationalId: DEV_CUSTOMER_ACCOUNT.nationalId,
      status: KycStatus.APPROVED,
      reviewedAt: new Date(),
      reviewedById: superAdminId ?? undefined,
    },
    create: {
      userId: customer.id,
      phone: DEV_CUSTOMER_ACCOUNT.otpPhone,
      nationalId: DEV_CUSTOMER_ACCOUNT.nationalId,
      status: KycStatus.APPROVED,
      reviewedAt: new Date(),
      reviewedById: superAdminId ?? undefined,
    },
  });

  console.info('\n--- Dev test accounts (see docs/DEV_ACCOUNTS.md) ---');
  for (const account of staffAccounts) {
    console.info(`  [${account.role}] ${account.email} | ${DEV_PASSWORD_STAFF}`);
  }
  console.info(
    `  [CUSTOMER] ${DEV_CUSTOMER_ACCOUNT.email} | ${DEV_PASSWORD_CUSTOMER} | OTP: ${DEV_CUSTOMER_ACCOUNT.otpPhone}`,
  );
  console.info('  Smoke test: pnpm --filter @sadafgold/api smoke:roles');
  console.info('--------------------------------------------------------\n');

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
      imageUrl: seedMedia.product,
      hoverImageUrl: seedMedia.product,
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
      imageUrl: seedMedia.product,
      hoverImageUrl: seedMedia.product,
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
      imageUrl: seedMedia.product,
      hoverImageUrl: seedMedia.product,
      description:
        'گردنبند مینیمال برای فروشگاه طلا با توضیح دقیق محصول و تصویر استاندارد.',
      seoDescription: 'گردنبند طلای تلاشیم با کیفیت ساخت بالا و قیمت روز.',
      featured: true,
      quantity: 2,
    },
    {
      sku: 'TL-WR-0320-01',
      slug: 'classic-wedding-ring',
      title: 'حلقه ازدواج کلاسیک',
      category: ProductCategory.WEDDING_RING,
      karat: 18,
      weightGram: '3.20',
      makingFeePercent: 12,
      priceToman: 0,
      imageUrl: seedMedia.product,
      hoverImageUrl: seedMedia.product,
      description:
        'حلقه ازدواج طلای ۱۸ عیار با طراحی ماندگار و مناسب ست عروسی.',
      seoDescription: 'حلقه ازدواج کلاسیک ۱۸ عیار با قیمت شفاف و ضمانت اصالت.',
      featured: true,
      quantity: 4,
    },
    {
      sku: 'TL-WR-0280-02',
      slug: 'eternity-wedding-ring',
      title: 'حلقه ازدواج eternity',
      category: ProductCategory.WEDDING_RING,
      karat: 18,
      weightGram: '2.80',
      makingFeePercent: 14,
      priceToman: 0,
      imageUrl: seedMedia.product,
      hoverImageUrl: seedMedia.product,
      description:
        'حلقه ازدواج با نگین‌های ظریف برای ست کامل عروسی.',
      seoDescription: 'حلقه ازدواج eternity ۱۸ عیار با طراحی لوکس.',
      featured: false,
      quantity: 3,
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
        hoverImageUrl: item.hoverImageUrl,
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
        hoverImageUrl: item.hoverImageUrl,
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

  await seedCatalogDemoProducts(prisma, seedMedia);

  const customerAddress = await prisma.address.upsert({
    where: { id: 'seed-customer-address-1' },
    update: {
      userId: customer.id,
      title: 'منزل',
      recipient: customer.fullName,
      phone: DEV_CUSTOMER_ACCOUNT.otpPhone,
      line1: 'خیابان ولیعصر، پلاک ۱۲۳',
      city: 'تهران',
      state: 'تهران',
      postalCode: '1234567890',
    },
    create: {
      id: 'seed-customer-address-1',
      userId: customer.id,
      title: 'منزل',
      recipient: customer.fullName,
      phone: DEV_CUSTOMER_ACCOUNT.otpPhone,
      line1: 'خیابان ولیعصر، پلاک ۱۲۳',
      city: 'تهران',
      state: 'تهران',
      postalCode: '1234567890',
    },
  });

  const seedProduct = await prisma.product.findFirstOrThrow({
    where: { slug: 'van-cleef-alhambra-ring' },
  });

  const fakeReceiptUrl = seedMedia.receipt;

  const seedOrders = [
    {
      orderNumber: 'TL-SEED-C2C-001',
      status: OrderStatus.PENDING,
      paymentStatus: PaymentStatus.AWAITING_RECEIPT,
      receiptUrl: null as string | null,
      note: 'در انتظار بارگذاری فیش',
    },
    {
      orderNumber: 'TL-SEED-C2C-002',
      status: OrderStatus.PENDING,
      paymentStatus: PaymentStatus.RECEIPT_SUBMITTED,
      receiptUrl: fakeReceiptUrl,
      note: 'فیش ارسال شده — آماده تأیید ادمین',
    },
    {
      orderNumber: 'TL-SEED-C2C-003',
      status: OrderStatus.PENDING,
      paymentStatus: PaymentStatus.REJECTED,
      receiptUrl: fakeReceiptUrl,
      rejectionReason: 'مبلغ واریزی با سفارش مطابقت ندارد.',
      note: 'فیش رد شده — مشتری می‌تواند دوباره ارسال کند',
    },
  ] as const;

  for (const [index, seedOrder] of seedOrders.entries()) {
    const unitPriceToman = 12_500_000n + BigInt(index) * 500_000n;
    const subtotalToman = unitPriceToman;
    const taxToman = 1_125_000n;
    const totalToman = subtotalToman + taxToman;

    await prisma.order.upsert({
      where: { orderNumber: seedOrder.orderNumber },
      update: {
        userId: customer.id,
        shippingAddressId: customerAddress.id,
        status: seedOrder.status,
        subtotalToman,
        taxToman,
        totalToman,
      },
      create: {
        orderNumber: seedOrder.orderNumber,
        userId: customer.id,
        shippingAddressId: customerAddress.id,
        status: seedOrder.status,
        subtotalToman,
        taxToman,
        totalToman,
        items: {
          create: {
            productId: seedProduct.id,
            quantity: 1,
            unitPriceToman,
          },
        },
        payments: {
          create: {
            provider: 'card_to_card',
            status: seedOrder.paymentStatus,
            amountToman: totalToman,
            reference: `C2C-${seedOrder.orderNumber}`,
            receiptUrl: seedOrder.receiptUrl,
            receiptUploadedAt: seedOrder.receiptUrl ? new Date() : null,
            rejectionReason:
              'rejectionReason' in seedOrder ? seedOrder.rejectionReason : null,
          },
        },
      },
    });

    const existingPayment = await prisma.payment.findFirst({
      where: { order: { orderNumber: seedOrder.orderNumber } },
    });

    if (existingPayment) {
      await prisma.payment.update({
        where: { id: existingPayment.id },
        data: {
          provider: 'card_to_card',
          status: seedOrder.paymentStatus,
          amountToman: totalToman,
          reference: `C2C-${seedOrder.orderNumber}`,
          receiptUrl: seedOrder.receiptUrl,
          receiptUploadedAt: seedOrder.receiptUrl ? new Date() : null,
          rejectionReason:
            'rejectionReason' in seedOrder ? seedOrder.rejectionReason : null,
        },
      });
    }

    console.info(`  [ORDER] ${seedOrder.orderNumber} — ${seedOrder.note}`);
  }

  const guidesCategory = await prisma.blogCategory.findUniqueOrThrow({
    where: { slug: 'guides' },
  });

  await prisma.blogPost.upsert({
    where: { slug: 'how-to-buy-gold-online' },
    update: {
      content:
        '<p>قبل از خرید طلا، وزن دقیق، عیار، اجرت ساخت و قیمت لحظه‌ای را از فروشنده درخواست کنید. فاکتور رسمی و امکان استعلام اصالت از الزامات خرید امن است. در خرید آنلاین، حتماً مشخصات کامل محصول شامل وزن خالص، درصد عیار، نوع سنگ، اجرت ساخت و مالیات را در صفحه محصول بررسی کنید. قیمت نهایی باید بر اساس نرخ روز طلا و فرمول شفاف محاسبه شود؛ از فروشگاه‌هایی خرید کنید که جزئیات محاسبه قیمت را به‌صورت شفاف نمایش می‌دهند.</p><p>پس از ثبت سفارش، کد رهگیری و فاکتور رسمی را نگه دارید. در زمان تحویل، وزن و ظاهر محصول را با مشخصات درج‌شده در فاکتور مقایسه کنید. برای انگشتر و زیورآلات، اندازه و بسته‌بندی را قبل از پذیرش مرسوله کنترل کنید. در صورت هرگونه مغایرت، در اسرع وقت با پشتیبانی فروشگاه تماس بگیرید. خرید امن طلا مستلزم انتخاب فروشگاه معتبر، بررسی مجوزها، مطالعه دقیق شرایط مرجوعی و استفاده از درگاه پرداخت امن است.</p>',
    },
    create: {
      categoryId: guidesCategory.id,
      slug: 'how-to-buy-gold-online',
      title: 'راهنمای خرید امن طلا از فروشگاه آنلاین',
      excerpt:
        'وزن، عیار، اجرت و سیاست مرجوعی از مهم‌ترین چیزهایی هستند که باید قبل از خرید بررسی شوند.',
      content:
        '<p>قبل از خرید طلا، وزن دقیق، عیار، اجرت ساخت و قیمت لحظه‌ای را از فروشنده درخواست کنید. فاکتور رسمی و امکان استعلام اصالت از الزامات خرید امن است. در خرید آنلاین، حتماً مشخصات کامل محصول شامل وزن خالص، درصد عیار، نوع سنگ، اجرت ساخت و مالیات را در صفحه محصول بررسی کنید. قیمت نهایی باید بر اساس نرخ روز طلا و فرمول شفاف محاسبه شود؛ از فروشگاه‌هایی خرید کنید که جزئیات محاسبه قیمت را به‌صورت شفاف نمایش می‌دهند.</p><p>پس از ثبت سفارش، کد رهگیری و فاکتور رسمی را نگه دارید. در زمان تحویل، وزن و ظاهر محصول را با مشخصات درج‌شده در فاکتور مقایسه کنید. برای انگشتر و زیورآلات، اندازه و بسته‌بندی را قبل از پذیرش مرسوله کنترل کنید. در صورت هرگونه مغایرت، در اسرع وقت با پشتیبانی فروشگاه تماس بگیرید. خرید امن طلا مستلزم انتخاب فروشگاه معتبر، بررسی مجوزها، مطالعه دقیق شرایط مرجوعی و استفاده از درگاه پرداخت امن است.</p>',
      coverImageUrl: seedMedia.blog,
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
      update: {
        title: post.title,
        excerpt: post.excerpt,
        content: post.content,
        publishedAt: new Date(),
      },
      create: {
        categoryId: faqCategory.id,
        slug: post.slug,
        title: post.title,
        excerpt: post.excerpt,
        content: post.content,
        coverImageUrl: seedMedia.blog,
        publishedAt: new Date(),
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
      imageUrl: seedMedia.banner,
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
    await pool.end();
  });
