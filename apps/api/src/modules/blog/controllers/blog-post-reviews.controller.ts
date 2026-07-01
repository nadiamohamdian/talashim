import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { Public } from '@/common/decorators/public.decorator';
import { ApiPublicErrors } from '@/swagger/decorators/api-protected.decorator';
import { SubmitBlogPostReviewDto } from '../dto/submit-blog-post-review.dto';
import { BlogPostReviewsService } from '../services/blog-post-reviews.service';

@ApiTags('blog')
@ApiPublicErrors()
@Public()
@Controller('blog/reviews')
export class BlogPostReviewsController {
  constructor(private readonly blogPostReviewsService: BlogPostReviewsService) {}

  @Post(':slug')
  @Throttle({ default: { limit: 5, ttl: 60_000 } })
  @ApiOperation({ summary: 'Submit a blog post review' })
  @ApiOkResponse({ description: 'Review submitted for moderation' })
  submit(@Param('slug') slug: string, @Body() payload: SubmitBlogPostReviewDto) {
    return this.blogPostReviewsService.submit(slug, payload);
  }

  @Get(':slug')
  @ApiOperation({ summary: 'List approved blog post reviews' })
  list(@Param('slug') slug: string) {
    return this.blogPostReviewsService.listApproved(slug);
  }
}
