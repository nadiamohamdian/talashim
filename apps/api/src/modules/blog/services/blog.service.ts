import { Injectable, NotFoundException } from '@nestjs/common';
import { BlogRepository } from '../repositories/blog.repository';
import type { BlogQueryDto } from '../dto/blog-query.dto';

@Injectable()
export class BlogService {
  constructor(private readonly blogRepository: BlogRepository) {}

  async findLatest(query: BlogQueryDto) {
    return this.blogRepository.findLatest(query.limit);
  }

  async findBySlug(slug: string) {
    const post = await this.blogRepository.findBySlug(slug);

    if (!post) {
      throw new NotFoundException('Blog post not found');
    }

    return post;
  }
}
