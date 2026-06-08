import { Injectable, NotFoundException } from '@nestjs/common';
import { BlogRepository } from '../repositories/blog.repository';
import type { BlogQueryDto } from '../dto/blog-query.dto';

@Injectable()
export class BlogService {
  constructor(private readonly blogRepository: BlogRepository) {}

  async findLatest(query: BlogQueryDto) {
    const limit = query.limit ?? 10;
    const posts = await this.blogRepository.findLatest(limit, query.category);
    const includeContent = query.category === 'faq';

    return posts
      .filter((post) => post.isPublished && post.publishedAt <= new Date())
      .map((post) => ({
      id: post.id,
      slug: post.slug,
      title: post.title,
      excerpt: post.excerpt,
      ...(includeContent ? { content: post.content } : {}),
      coverImageUrl: post.coverImageUrl,
      publishedAt: post.publishedAt.toISOString(),
      isPublished: post.isPublished,
      sortOrder: post.sortOrder,
    }));
  }

  async findBySlug(slug: string) {
    const post = await this.blogRepository.findBySlug(slug);

    if (!post) {
      throw new NotFoundException('Blog post not found');
    }

    return {
      id: post.id,
      slug: post.slug,
      title: post.title,
      excerpt: post.excerpt,
      content: post.content,
      coverImageUrl: post.coverImageUrl,
      publishedAt: post.publishedAt.toISOString(),
      isPublished: post.isPublished,
      sortOrder: post.sortOrder,
    };
  }
}
