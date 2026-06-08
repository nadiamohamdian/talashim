import { Injectable, NotFoundException } from '@nestjs/common';
import { assertFeatureEnabled } from '@/common/platform-settings/platform-settings-helpers';
import { CatalogRepository } from '@/modules/catalog/repositories/catalog.repository';
import { CatalogService } from '@/modules/catalog/services/catalog.service';
import { WishlistRepository } from '../repositories/wishlist.repository';

@Injectable()
export class WishlistService {
  constructor(
    private readonly wishlistRepository: WishlistRepository,
    private readonly catalogRepository: CatalogRepository,
    private readonly catalogService: CatalogService,
  ) {}

  async list(userId: string) {
    assertFeatureEnabled('enableWishlist', 'لیست علاقه‌مندی غیرفعال است');
    const items = await this.wishlistRepository.findByUserId(userId);
    if (items.length === 0) {
      return [];
    }

    const products = await this.catalogService.findByIds(items.map((item) => item.productId));
    const productById = new Map(products.map((product) => [product.id, product]));

    return items
      .map((item) => {
        const product = productById.get(item.productId);
        if (!product) {
          return null;
        }

        return {
          id: item.id,
          productId: item.productId,
          createdAt: item.createdAt.toISOString(),
          product,
        };
      })
      .filter((item): item is NonNullable<typeof item> => item !== null);
  }

  async add(userId: string, productId: string) {
    assertFeatureEnabled('enableWishlist', 'لیست علاقه‌مندی غیرفعال است');
    const product = await this.catalogRepository.findById(productId);
    if (!product) {
      throw new NotFoundException('Product not found');
    }
    const existing = await this.wishlistRepository.findEntry(userId, productId);
    if (existing) {
      return { added: false, productId };
    }
    await this.wishlistRepository.add(userId, productId);
    return { added: true, productId };
  }

  async remove(userId: string, productId: string) {
    assertFeatureEnabled('enableWishlist', 'لیست علاقه‌مندی غیرفعال است');
    const existing = await this.wishlistRepository.findEntry(userId, productId);
    if (!existing) {
      throw new NotFoundException('Wishlist item not found');
    }
    await this.wishlistRepository.remove(userId, productId);
    return { removed: true, productId };
  }
}
