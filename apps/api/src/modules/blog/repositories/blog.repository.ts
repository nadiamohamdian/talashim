import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/infrastructure/database/prisma.service';

@Injectable()
export class BlogRepository {
  constructor(private readonly prisma: PrismaService) {}

  findLatest(limit = 10, categorySlug?: string) {
    return this.prisma.blogPost.findMany({
      where: {
        isPublished: true,
        publishedAt: { lte: new Date() },
        ...(categorySlug
          ? { category: { slug: categorySlug } }
          : { NOT: { category: { slug: 'faq' } } }),
      },
      orderBy: [{ sortOrder: 'asc' }, { publishedAt: 'desc' }],
      take: limit,
      include: { category: true },
    });
  }

  findBySlug(slug: string) {
    return this.prisma.blogPost.findFirst({
      where: {
        slug,
        isPublished: true,
        publishedAt: { lte: new Date() },
      },
    });
  }
}
