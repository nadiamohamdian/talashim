import { Module } from '@nestjs/common';
import { BlogController } from './controllers/blog.controller';
import { BlogPostReviewsController } from './controllers/blog-post-reviews.controller';
import { BlogRepository } from './repositories/blog.repository';
import { BlogPostReviewsRepository } from './repositories/blog-post-reviews.repository';
import { BlogService } from './services/blog.service';
import { BlogPostReviewsService } from './services/blog-post-reviews.service';

@Module({
  controllers: [BlogController, BlogPostReviewsController],
  providers: [
    BlogRepository,
    BlogPostReviewsRepository,
    BlogService,
    BlogPostReviewsService,
  ],
  exports: [BlogPostReviewsRepository, BlogPostReviewsService],
})
export class BlogModule {}
