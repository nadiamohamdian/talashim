import { Injectable, NotFoundException } from '@nestjs/common';
import { assertFeatureEnabled } from '@/common/platform-settings/platform-settings-helpers';
import { CatalogRepository } from '@/modules/catalog/repositories/catalog.repository';
import { WishlistRepository } from '../repositories/wishlist.repository';

@Injectable()
export class WishlistService {
  constructor(
    private readonly wishlistRepository: WishlistRepository,
    private readonly catalogRepository: CatalogRepository,
  ) {}

  async list(userId: string) {
    assertFeatureEnabled('enableWishlist', 'لیست علاقه‌مندی غیرفعال است');
    const items = await this.wishlistRepository.findByUserId(userId);
    return items.map((item) => ({
      id: item.id,
      productId: item.productId,
      createdAt: item.createdAt.toISOString(),
      product: {
        id: item.product.id,
        sku: item.product.sku,
        slug: item.product.slug,
        title: item.product.title,
        category: item.product.category.toLowerCase(),
        karat: item.product.karat,
        weightGram: Number(item.product.weightGram),
        makingFeePercent: item.product.makingFeePercent,
        priceToman: item.product.priceToman,
        imageUrl: item.product.imageUrl,
        inventory:
          (item.product.inventoryItem?.quantity ?? 0) -
          (item.product.inventoryItem?.reserved ?? 0),
      },
    }));
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
