import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Public } from '@/common/decorators/public.decorator';
import { CatalogQueryDto } from '../dto/catalog-query.dto';
import { CatalogService } from '../services/catalog.service';

@ApiTags('catalog')
@Public()
@Controller('catalog')
export class CatalogController {
  constructor(private readonly catalogService: CatalogService) {}

  @Get()
  findAll(@Query() query: CatalogQueryDto) {
    return this.catalogService.findAll(query);
  }

  @Get('featured')
  findFeatured() {
    return this.catalogService.findFeatured();
  }

  @Get(':slug')
  findBySlug(@Param('slug') slug: string) {
    return this.catalogService.findBySlug(slug);
  }
}
