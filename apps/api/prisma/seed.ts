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

  const products = [
    {
      slug: 'royal-ring',
      title: 'انگشتر طلای رویال',
      category: ProductCategory.RING,
      karat: 18,
      weightGram: '4.80',
      makingFeePercent: 9,
      priceToman: 32750000,
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
      slug: 'sadaf-necklace',
      title: 'گردنبند صدف',
      category: ProductCategory.NECKLACE,
      karat: 18,
      weightGram: '11.20',
      makingFeePercent: 11,
      priceToman: 71900000,
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
        'این seed صرفا برای راه‌اندازی سریع محیط توسعه است و بعدا می‌تواند با CMS یا data pipeline واقعی جایگزین شود.',
      coverImageUrl:
        'https://images.unsplash.com/photo-1617038220319-276d3cfab638?auto=format&fit=crop&w=1200&q=80',
      publishedAt: new Date('2026-05-01'),
    },
  });

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
