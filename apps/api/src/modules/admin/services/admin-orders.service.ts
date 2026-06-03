import { Injectable, NotFoundException } from '@nestjs/common';
import { ADMIN_PERMISSIONS } from '@talashim/shared/admin-rbac';
import type { AdminOrderDetailDto, AdminOrderListItemDto } from '@talashim/types';
import type { AuthenticatedUser } from '@/common/interfaces/auth-user.interface';
import { assertAdminPermission } from '@/common/rbac/assert-admin-permission';
import { tomanBigIntToNumber } from '@/common/finance/toman-amount';
import type {
  AdminOrdersQueryDto,
  UpdateAdminOrderStatusDto,
} from '../dto/admin-commerce.dto';
import { AdminOrdersRepository } from '../repositories/admin-orders.repository';

type OrderListRow = Awaited<ReturnType<AdminOrdersRepository['listOrders']>>[0][number];
type OrderDetailRow = NonNullable<
  Awaited<ReturnType<AdminOrdersRepository['findOrderById']>>
>;

@Injectable()
export class AdminOrdersService {
  constructor(private readonly ordersRepository: AdminOrdersRepository) {}

  async listOrders(query: AdminOrdersQueryDto, actor: AuthenticatedUser) {
    assertAdminPermission(actor.role, ADMIN_PERMISSIONS.orders.read);

    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const skip = (page - 1) * limit;

    const [items, total] = await this.ordersRepository.listOrders(skip, limit, {
      search: query.search,
      status: query.status,
      from: query.from ? new Date(query.from) : undefined,
      to: query.to ? new Date(query.to) : undefined,
    });

    return {
      page,
      limit,
      total,
      items: items.map((order) => this.mapListItem(order)),
    };
  }

  async getOrder(id: string, actor: AuthenticatedUser): Promise<AdminOrderDetailDto> {
    assertAdminPermission(actor.role, ADMIN_PERMISSIONS.orders.read);

    const order = await this.ordersRepository.findOrderById(id);
    if (!order) {
      throw new NotFoundException('Order not found');
    }

    return this.mapDetail(order);
  }

  async updateStatus(
    id: string,
    dto: UpdateAdminOrderStatusDto,
    actor: AuthenticatedUser,
  ) {
    assertAdminPermission(actor.role, ADMIN_PERMISSIONS.orders.write);

    const order = await this.ordersRepository.findOrderById(id);
    if (!order) {
      throw new NotFoundException('Order not found');
    }

    const updated = await this.ordersRepository.updateOrderStatus(id, dto.status);
    return this.mapDetail(updated);
  }

  private mapListItem(order: OrderListRow): AdminOrderListItemDto {
    return {
      id: order.id,
      orderNumber: order.orderNumber,
      status: order.status,
      subtotalToman: tomanBigIntToNumber(order.subtotalToman),
      taxToman: tomanBigIntToNumber(order.taxToman),
      totalToman: tomanBigIntToNumber(order.totalToman),
      itemCount: order._count.items,
      paymentStatus: order.payments[0]?.status ?? null,
      user: order.user,
      createdAt: order.createdAt.toISOString(),
    };
  }

  private mapDetail(order: OrderDetailRow): AdminOrderDetailDto {
    return {
      id: order.id,
      orderNumber: order.orderNumber,
      status: order.status,
      subtotalToman: tomanBigIntToNumber(order.subtotalToman),
      taxToman: tomanBigIntToNumber(order.taxToman),
      totalToman: tomanBigIntToNumber(order.totalToman),
      itemCount: order.items.length,
      paymentStatus: order.payments[0]?.status ?? null,
      user: order.user,
      createdAt: order.createdAt.toISOString(),
      updatedAt: order.updatedAt.toISOString(),
      items: order.items.map((item) => ({
        id: item.id,
        productId: item.productId,
        productTitle: item.product.title,
        productSlug: item.product.slug,
        productSku: item.product.sku,
        quantity: item.quantity,
        unitPriceToman: tomanBigIntToNumber(item.unitPriceToman),
        lineTotalToman: item.quantity * tomanBigIntToNumber(item.unitPriceToman),
      })),
      payments: order.payments.map((payment) => ({
        id: payment.id,
        status: payment.status,
        provider: payment.provider,
        reference: payment.reference,
        amountToman: tomanBigIntToNumber(payment.amountToman),
        createdAt: payment.createdAt.toISOString(),
      })),
    };
  }
}
