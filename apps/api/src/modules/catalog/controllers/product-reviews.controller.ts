import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { Public } from '@/common/decorators/public.decorator';
import { ApiPublicErrors } from '@/swagger/decorators/api-protected.decorator';
import { SubmitProductReviewDto } from '../dto/submit-product-review.dto';
import { ProductReviewsService } from '../services/product-reviews.service';

@ApiTags('catalog')
@ApiPublicErrors()
@Public()
@Controller('catalog/reviews')
export class ProductReviewsController {
  constructor(private readonly productReviewsService: ProductReviewsService) {}

  @Post(':slug')
  @Throttle({ default: { limit: 5, ttl: 60_000 } })
  @ApiOperation({ summary: 'Submit a product review' })
  @ApiOkResponse({ description: 'Review submitted for moderation' })
  submit(@Param('slug') slug: string, @Body() payload: SubmitProductReviewDto) {
    return this.productReviewsService.submit(slug, payload);
  }

  @Get(':slug')
  @ApiOperation({ summary: 'List approved product reviews' })
  list(@Param('slug') slug: string) {
    return this.productReviewsService.listApproved(slug);
  }
}
