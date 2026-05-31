import argon2 from 'argon2';
import { PrismaClient, ProductCategory, Role } from '../src/generated/prisma';

const prisma = new PrismaClient();

async function main() {
  const adminPasswordHash = await argon2.hash('Admin12345!');

  const admin = await prisma.user.upsert({
    where: { email: 'admin@sadafgold.local' },
    update: {},
    create: {
      email: 'admin@sadafgold.local',
      fullName: 'Sadaf Admin',
      passwordHash: adminPasswordHash,
      role: Role.ADMIN,
    },
  });

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
      sku: 'SG-R-0412-01',
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
      sku: 'SG-R-0480-01',
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
      sku: 'SG-N-1120-01',
      slug: 'sadaf-necklace',
      title: 'گردنبند صدف',
      category: ProductCategory.NECKLACE,
      karat: 18,
      weightGram: '11.20',
      makingFeePercent: 11,
      priceToman: 0,
      imageUrl:
        'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=900&q=80',
      description:
        'گردنبند مینیمال برای فروشگاه طلا با توضیح دقیق محصول و تصویر استاندارد.',
      seoDescription: 'گردنبند طلای صدف با کیفیت ساخت بالا و قیمت روز.',
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
        'تمام محصولات صدف گلد با مشخصات دقیق وزن و عیار عرضه می‌شوند. فاکتور رسمی همراه سفارش ارسال شده و امکان مراجعه به آزمایشگاه معتبر برای کاربران فراهم است.',
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

  await prisma.auditLog.create({
    data: {
      actorId: admin.id,
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
