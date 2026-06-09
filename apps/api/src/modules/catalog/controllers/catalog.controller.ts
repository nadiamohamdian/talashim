import { Controller, Get, Param, Query } from '@nestjs/common';
import { SkipThrottle } from '@nestjs/throttler';
import { ApiTags } from '@nestjs/swagger';
import { HttpCache } from '@/common/decorators/http-cache.decorator';
import { Public } from '@/common/decorators/public.decorator';
import { ApiPublicErrors } from '@/swagger/decorators/api-protected.decorator';
import { CatalogQueryDto } from '../dto/catalog-query.dto';
import { CatalogService } from '../services/catalog.service';

@ApiTags('catalog')
@ApiPublicErrors()
@Public()
@SkipThrottle()
@Controller('catalog')
export class CatalogController {
  constructor(private readonly catalogService: CatalogService) {}

  /** No HTTP cache — live pricing and filter query params must stay fresh. */
  @Get()
  findAll(@Query() query: CatalogQueryDto) {
    return this.catalogService.findAll(query);
  }

  @Get('categories')
  @HttpCache({ key: 'catalog:categories', ttlSeconds: 300 })
  findCategories() {
    return this.catalogService.findCategories();
  }

  @Get('bestsellers')
  @HttpCache({ key: 'catalog:bestsellers', ttlSeconds: 120 })
  findBestsellers() {
    return this.catalogService.findBestsellers();
  }

  @Get('featured')
  @HttpCache({ key: 'catalog:featured', ttlSeconds: 120 })
  findFeatured() {
    return this.catalogService.findFeatured();
  }

  @Get(':slug')
  findBySlug(@Param('slug') slug: string) {
    return this.catalogService.findBySlug(slug);
  }
}
