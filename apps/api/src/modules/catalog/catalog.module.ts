import { Module } from '@nestjs/common';
import { PricingModule } from '@/modules/pricing/pricing.module';
import { CatalogController } from './controllers/catalog.controller';
import { ProductReviewsController } from './controllers/product-reviews.controller';
import { CatalogRepository } from './repositories/catalog.repository';
import { CatalogCategoryPageRepository } from './repositories/catalog-category-page.repository';
import { ProductReviewsRepository } from './repositories/product-reviews.repository';
import { CatalogService } from './services/catalog.service';
import { CatalogCategoryPageService } from './services/catalog-category-page.service';
import { ProductReviewsService } from './services/product-reviews.service';

@Module({
  imports: [PricingModule],
  controllers: [CatalogController, ProductReviewsController],
  providers: [
    CatalogRepository,
    CatalogCategoryPageRepository,
    CatalogService,
    CatalogCategoryPageService,
    ProductReviewsRepository,
    ProductReviewsService,
  ],
  exports: [
    CatalogRepository,
    CatalogCategoryPageRepository,
    CatalogService,
    CatalogCategoryPageService,
    ProductReviewsRepository,
    ProductReviewsService,
  ],
})
export class CatalogModule {}
