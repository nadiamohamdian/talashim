import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { ADMIN_PERMISSIONS } from '@sadafgold/shared/admin-rbac';
import type {
  AdminInventoryMovementDto,
  AdminInventoryRowDto,
} from '@sadafgold/types';
import type { AuthenticatedUser } from '@/common/interfaces/auth-user.interface';
import { assertAdminPermission } from '@/common/rbac/assert-admin-permission';
import type {
  AdjustInventoryDto,
  AdminInventoryHistoryQueryDto,
  AdminInventoryQueryDto,
  AdminInventoryReportQueryDto,
} from '../dto/admin-commerce.dto';
import { AdminReportsService } from './admin-reports.service';
import { AdminInventoryRepository } from '../repositories/admin-inventory.repository';
import { revalidateStorefrontProducts } from '@/infrastructure/storefront/storefront-cache.util';
import { PrismaService } from '@/infrastructure/database/prisma.service';

const LOW_STOCK_THRESHOLD = 5;

@Injectable()
export class AdminInventoryService {
  constructor(
    private readonly inventoryRepository: AdminInventoryRepository,
    private readonly adminReportsService: AdminReportsService,
    private readonly prisma: PrismaService,
  ) {}

  async listStock(query: AdminInventoryQueryDto, actor: AuthenticatedUser) {
    assertAdminPermission(actor.role, ADMIN_PERMISSIONS.inventory.read);

    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const skip = (page - 1) * limit;

    const [items, total] = await this.inventoryRepository.listStock(skip, limit, {
      search: query.search,
      category: query.category,
      lowStockOnly: query.lowStockOnly,
    });

    return {
      page,
      limit,
      total,
      items: items.map((p) => this.mapStockRow(p)),
    };
  }

  async listHistory(query: AdminInventoryHistoryQueryDto, actor: AuthenticatedUser) {
    assertAdminPermission(actor.role, ADMIN_PERMISSIONS.inventory.read);

    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const skip = (page - 1) * limit;

    const [items, total] = await this.inventoryRepository.listMovements(skip, limit, {
      productId: query.productId,
      type: query.type,
    });

    return {
      page,
      limit,
      total,
      items: items.map((m) => this.mapMovement(m)),
    };
  }

  async adjust(dto: AdjustInventoryDto, actor: AuthenticatedUser) {
    assertAdminPermission(actor.role, ADMIN_PERMISSIONS.inventory.adjust);

    if (dto.quantityDelta === 0) {
      throw new BadRequestException('Adjustment delta cannot be zero');
    }

    try {
      const updated = await this.inventoryRepository.adjustStock(
        dto.productId,
        dto.quantityDelta,
        actor.id,
        dto.note,
      );
      if (!updated) {
        throw new NotFoundException('Inventory item not found');
      }

      const product = await this.prisma.product.findUnique({
        where: { id: dto.productId },
        select: { slug: true },
      });
      if (product?.slug) {
        void revalidateStorefrontProducts(product.slug);
      }

      return {
        productId: updated.productId,
        quantity: updated.quantity,
        reserved: updated.reserved,
        available: updated.quantity - updated.reserved,
      };
    } catch (error) {
      if (error instanceof Error) {
        if (error.message === 'INSUFFICIENT_STOCK') {
          throw new BadRequestException('Resulting quantity cannot be negative');
        }
        if (error.message === 'BELOW_RESERVED') {
          throw new BadRequestException('Quantity cannot fall below reserved amount');
        }
      }
      throw error;
    }
  }

  getReport(query: AdminInventoryReportQueryDto, actor: AuthenticatedUser) {
    assertAdminPermission(actor.role, ADMIN_PERMISSIONS.inventory.read);
    return this.adminReportsService.getInventoryReport(query, actor);
  }

  private mapStockRow(
    product: Awaited<ReturnType<AdminInventoryRepository['listStock']>>[0][number],
  ): AdminInventoryRowDto {
    const inv = product.inventoryItem!;
    const available = inv.quantity - inv.reserved;
    return {
      productId: product.id,
      sku: product.sku,
      title: product.title,
      category: product.category,
      quantity: inv.quantity,
      reserved: inv.reserved,
      available,
      lowStock: available <= LOW_STOCK_THRESHOLD,
      updatedAt: inv.updatedAt.toISOString(),
    };
  }

  private mapMovement(
    row: Awaited<ReturnType<AdminInventoryRepository['listMovements']>>[0][number],
  ): AdminInventoryMovementDto {
    return {
      id: row.id,
      productId: row.productId,
      productTitle: row.product.title,
      productSku: row.product.sku,
      type: row.type,
      quantityDelta: row.quantityDelta,
      quantityBefore: row.quantityBefore,
      quantityAfter: row.quantityAfter,
      reservedBefore: row.reservedBefore,
      reservedAfter: row.reservedAfter,
      note: row.note,
      actorName: row.actor?.fullName ?? null,
      createdAt: row.createdAt.toISOString(),
    };
  }
}
