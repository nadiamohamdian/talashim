import { Controller, Get, Param, Query } from '@nestjs/common';
import { SkipThrottle } from '@nestjs/throttler';
import { assertFeatureEnabled } from '@/common/platform-settings/platform-settings-helpers';
import { ApiTags } from '@nestjs/swagger';
import { HttpCache } from '@/common/decorators/http-cache.decorator';
import { Public } from '@/common/decorators/public.decorator';
import { ApiPublicErrors } from '@/swagger/decorators/api-protected.decorator';
import { BlogQueryDto } from '../dto/blog-query.dto';
import { BlogService } from '../services/blog.service';

@ApiTags('blog')
@ApiPublicErrors()
@Public()
@SkipThrottle()
@Controller('blog')
export class BlogController {
  constructor(private readonly blogService: BlogService) {}

  @Get()
  @HttpCache({ ttlSeconds: 120 })
  findLatest(@Query() query: BlogQueryDto) {
    assertFeatureEnabled('enableBlog', 'بخش وبلاگ و محتوا غیرفعال است');
    return this.blogService.findLatest(query);
  }

  @Get(':slug')
  findBySlug(@Param('slug') slug: string) {
    assertFeatureEnabled('enableBlog', 'بخش وبلاگ و محتوا غیرفعال است');
    return this.blogService.findBySlug(slug);
  }
}
