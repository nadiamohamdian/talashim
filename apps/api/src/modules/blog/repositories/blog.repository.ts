import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/infrastructure/database/prisma.service';

@Injectable()
export class BlogRepository {
  constructor(private readonly prisma: PrismaService) {}

  findLatest(limit = 10) {
    return this.prisma.blogPost.findMany({
      orderBy: { publishedAt: 'desc' },
      take: limit,
    });
  }

  findBySlug(slug: string) {
    return this.prisma.blogPost.findUnique({
      where: { slug },
    });
  }
}
