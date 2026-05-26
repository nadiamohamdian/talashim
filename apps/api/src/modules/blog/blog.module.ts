import { Module } from '@nestjs/common';
import { BlogController } from './controllers/blog.controller';
import { BlogRepository } from './repositories/blog.repository';
import { BlogService } from './services/blog.service';

@Module({
  controllers: [BlogController],
  providers: [BlogRepository, BlogService],
})
export class BlogModule {}
