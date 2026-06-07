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
import { OrdersService } from '@/modules/orders/services/orders.service';

function parseAdminFilterDate(value: string, endOfDay = false): Date {
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    const date = new Date(`${value}T00:00:00`);
    if (endOfDay) {
      date.setHours(23, 59, 59, 999);
    }
    return date;
  }
  const date = new Date(value);
  if (endOfDay) {
    date.setHours(23, 59, 59, 999);
  }
  return date;
}

type OrderListRow = Awaited<ReturnType<AdminOrdersRepository['listOrders']>>[0][number];
type OrderDetailRow = NonNullable<
  Awaited<ReturnType<AdminOrdersRepository['findOrderById']>>
>;

@Injectable()
export class AdminOrdersService {
  constructor(
    private readonly ordersRepository: AdminOrdersRepository,
    private readonly ordersService: OrdersService,
  ) {}

  async listOrders(query: AdminOrdersQueryDto, actor: AuthenticatedUser) {
    assertAdminPermission(actor.role, ADMIN_PERMISSIONS.orders.read);

    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const skip = (page - 1) * limit;

    const [items, total] = await this.ordersRepository.listOrders(skip, limit, {
      search: query.search,
      status: query.status,
      from: query.from ? parseAdminFilterDate(query.from) : undefined,
      to: query.to ? parseAdminFilterDate(query.to, true) : undefined,
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

  async approvePaymentReceipt(
    orderId: string,
    paymentId: string,
    actor: AuthenticatedUser,
  ) {
    assertAdminPermission(actor.role, ADMIN_PERMISSIONS.orders.write);
    await this.ordersService.approvePaymentReceipt(orderId, paymentId, actor.id);
    return this.getOrder(orderId, actor);
  }

  async rejectPaymentReceipt(
    orderId: string,
    paymentId: string,
    dto: { reason: string },
    actor: AuthenticatedUser,
  ) {
    assertAdminPermission(actor.role, ADMIN_PERMISSIONS.orders.write);
    await this.ordersService.rejectPaymentReceipt(orderId, paymentId, actor.id, dto.reason);
    return this.getOrder(orderId, actor);
  }

  private mapUser(
    user: OrderDetailRow['user'],
    shippingAddress: OrderDetailRow['shippingAddress'],
  ): AdminOrderDetailDto['user'] {
    if (!user) {
      return null;
    }

    return {
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      phone: shippingAddress?.phone ?? user.kycVerification?.phone ?? null,
      nationalId: user.kycVerification?.nationalId ?? null,
    };
  }

  private mapShippingAddress(
    address: OrderDetailRow['shippingAddress'],
  ): AdminOrderDetailDto['shippingAddress'] {
    if (!address) {
      return null;
    }

    return {
      id: address.id,
      title: address.title,
      recipient: address.recipient,
      phone: address.phone,
      line1: address.line1,
      city: address.city,
      state: address.state,
      postalCode: address.postalCode,
    };
  }

  private mapListItem(order: OrderListRow): AdminOrderListItemDto {
    const payment = order.payments[0] ?? null;
    return {
      id: order.id,
      orderNumber: order.orderNumber,
      status: order.status,
      subtotalToman: tomanBigIntToNumber(order.subtotalToman),
      taxToman: tomanBigIntToNumber(order.taxToman),
      isInsured: order.isInsured,
      insuranceFeeToman: tomanBigIntToNumber(order.insuranceFeeToman),
      totalToman: tomanBigIntToNumber(order.totalToman),
      itemCount: order._count.items,
      paymentStatus: payment?.status ?? null,
      primaryPayment: payment
        ? {
            id: payment.id,
            status: payment.status,
            receiptUrl: payment.receiptUrl ?? null,
          }
        : null,
      user: order.user,
      createdAt: order.createdAt.toISOString(),
    };
  }

  private mapDetail(order: OrderDetailRow): AdminOrderDetailDto {
    const payment = order.payments[0] ?? null;
    const shippingAddress = this.mapShippingAddress(order.shippingAddress);
    return {
      id: order.id,
      orderNumber: order.orderNumber,
      status: order.status,
      subtotalToman: tomanBigIntToNumber(order.subtotalToman),
      taxToman: tomanBigIntToNumber(order.taxToman),
      isInsured: order.isInsured,
      insuranceFeeToman: tomanBigIntToNumber(order.insuranceFeeToman),
      totalToman: tomanBigIntToNumber(order.totalToman),
      itemCount: order.items.length,
      paymentStatus: payment?.status ?? null,
      primaryPayment: payment
        ? {
            id: payment.id,
            status: payment.status,
            receiptUrl: payment.receiptUrl ?? null,
          }
        : null,
      user: this.mapUser(order.user, order.shippingAddress),
      shippingAddress,
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
        receiptUrl: payment.receiptUrl ?? null,
        receiptUploadedAt: payment.receiptUploadedAt?.toISOString() ?? null,
        rejectionReason: payment.rejectionReason ?? null,
        createdAt: payment.createdAt.toISOString(),
      })),
    };
  }
}
