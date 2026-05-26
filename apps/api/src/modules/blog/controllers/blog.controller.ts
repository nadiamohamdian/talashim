import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Public } from '@/common/decorators/public.decorator';
import { BlogQueryDto } from '../dto/blog-query.dto';
import { BlogService } from '../services/blog.service';

@ApiTags('blog')
@Public()
@Controller('blog')
export class BlogController {
  constructor(private readonly blogService: BlogService) {}

  @Get()
  findLatest(@Query() query: BlogQueryDto) {
    return this.blogService.findLatest(query);
  }

  @Get(':slug')
  findBySlug(@Param('slug') slug: string) {
    return this.blogService.findBySlug(slug);
  }
}
