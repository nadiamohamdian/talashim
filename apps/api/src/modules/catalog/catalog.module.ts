import { Module } from '@nestjs/common';
import { PricingModule } from '@/modules/pricing/pricing.module';
import { CatalogController } from './controllers/catalog.controller';
import { CatalogRepository } from './repositories/catalog.repository';
import { CatalogService } from './services/catalog.service';

@Module({
  imports: [PricingModule],
  controllers: [CatalogController],
  providers: [CatalogRepository, CatalogService],
  exports: [CatalogRepository, CatalogService],
})
export class CatalogModule {}
