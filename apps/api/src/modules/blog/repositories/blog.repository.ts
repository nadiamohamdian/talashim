import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/infrastructure/database/prisma.service';

@Injectable()
export class BlogRepository {
  constructor(private readonly prisma: PrismaService) {}

  findLatest(limit = 10, categorySlug?: string) {
    return this.prisma.blogPost.findMany({
      where: categorySlug
        ? { category: { slug: categorySlug } }
        : undefined,
      orderBy: { publishedAt: 'desc' },
      take: limit,
      include: { category: true },
    });
  }

  findBySlug(slug: string) {
    return this.prisma.blogPost.findUnique({
      where: { slug },
    });
  }
}
