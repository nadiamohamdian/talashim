import { Module } from '@nestjs/common';
import { CatalogModule } from '@/modules/catalog/catalog.module';
import { WishlistController } from './controllers/wishlist.controller';
import { WishlistRepository } from './repositories/wishlist.repository';
import { WishlistService } from './services/wishlist.service';

@Module({
  imports: [CatalogModule],
  controllers: [WishlistController],
  providers: [WishlistRepository, WishlistService],
})
export class WishlistModule {}
