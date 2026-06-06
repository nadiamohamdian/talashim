import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { getPlatformSettings } from '@/common/platform-settings/platform-settings-runtime';
import { InventoryRepository } from '../repositories/inventory.repository';
import type { ReserveInventoryDto } from '../dto/reserve-inventory.dto';

@Injectable()
export class InventoryService {
  constructor(private readonly inventoryRepository: InventoryRepository) {}

  async findByProductId(productId: string) {
    const item = await this.inventoryRepository.findByProductId(productId);

    if (!item) {
      throw new NotFoundException('Inventory item not found');
    }

    return {
      productId: item.productId,
      quantity: item.quantity,
      reserved: item.reserved,
      available: item.quantity - item.reserved,
    };
  }

  async reserve(payload: ReserveInventoryDto) {
    if (!getPlatformSettings().featureFlags.enableInventoryReservation) {
      throw new ForbiddenException('رزرو موجودی هنگام پرداخت غیرفعال است');
    }
    const item = await this.inventoryRepository.findByProductId(
      payload.productId,
    );

    if (!item) {
      throw new NotFoundException('Inventory item not found');
    }

    if (item.quantity - item.reserved < payload.quantity) {
      throw new BadRequestException('Insufficient inventory');
    }

    return this.inventoryRepository.updateReserved(
      payload.productId,
      payload.quantity,
    );
  }
}
