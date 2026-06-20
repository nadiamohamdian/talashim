import { Injectable, NotFoundException } from '@nestjs/common';
import { ADMIN_PERMISSIONS } from '@sadafgold/shared/admin-rbac';
import type {
  AdminTradeOrderDetailDto,
  AdminTradeOrderDto,
  TradingSettlementSummary,
} from '@sadafgold/types';
import type { AuthenticatedUser } from '@/common/interfaces/auth-user.interface';
import { assertAdminPermission } from '@/common/rbac/assert-admin-permission';
import { TradingService } from '@/modules/trading/services/trading.service';
import type { TradingReportQueryDto } from '../dto/admin-reports-query.dto';
import type {
  AdminCancelTradeOrderDto,
  AdminTradingOrdersQueryDto,
  AdminTradingReportQueryDto,
} from '../dto/admin-trading.dto';
import { AdminReportsService } from './admin-reports.service';
import { AdminTradingRepository } from '../repositories/admin-trading.repository';

type OrderListRow = Awaited<
  ReturnType<AdminTradingRepository['listOrders']>
>[0][number];

type OrderDetailRow = NonNullable<
  Awaited<ReturnType<AdminTradingRepository['findOrderById']>>
>;

@Injectable()
export class AdminTradingService {
  constructor(
    private readonly tradingRepository: AdminTradingRepository,
    private readonly tradingService: TradingService,
    private readonly adminReportsService: AdminReportsService,
  ) {}

  async listOrders(query: AdminTradingOrdersQueryDto, actor: AuthenticatedUser) {
    assertAdminPermission(actor.role, ADMIN_PERMISSIONS.trading.read);

    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const skip = (page - 1) * limit;

    const [items, total] = await this.tradingRepository.listOrders(skip, limit, {
      side: query.side,
      status: query.status,
      userId: query.userId,
      search: query.search,
      from: query.from ? new Date(query.from) : undefined,
      to: query.to ? new Date(query.to) : undefined,
    });

    return {
      page,
      limit,
      total,
      items: items.map((order) => this.mapOrder(order)),
    };
  }

  async getOrder(orderId: string, actor: AuthenticatedUser): Promise<AdminTradeOrderDetailDto> {
    assertAdminPermission(actor.role, ADMIN_PERMISSIONS.trading.read);

    const order = await this.tradingRepository.findOrderById(orderId);
    if (!order) {
      throw new NotFoundException('Trade order not found');
    }

    return this.mapOrderDetail(order);
  }

  async getSettlementSummary(actor: AuthenticatedUser): Promise<TradingSettlementSummary> {
    assertAdminPermission(actor.role, ADMIN_PERMISSIONS.trading.settle);

    const [pendingCount, failedCount, filledTodayCount] =
      await this.tradingRepository.getSettlementSummary();

    return { pendingCount, failedCount, filledTodayCount };
  }

  listSettlementQueue(query: AdminTradingOrdersQueryDto, actor: AuthenticatedUser) {
    return this.listOrders(query, actor);
  }

  async settleOrder(orderId: string, actor: AuthenticatedUser) {
    assertAdminPermission(actor.role, ADMIN_PERMISSIONS.trading.settle);
    await this.tradingService.adminSettlePendingOrder(orderId, actor.id);
    return this.getOrder(orderId, actor);
  }

  async cancelOrder(
    orderId: string,
    dto: AdminCancelTradeOrderDto,
    actor: AuthenticatedUser,
  ) {
    assertAdminPermission(actor.role, ADMIN_PERMISSIONS.trading.settle);
    await this.tradingService.adminCancelPendingOrder(orderId, actor.id, dto.reason);
    return this.getOrder(orderId, actor);
  }

  async getTradingReport(query: AdminTradingReportQueryDto, actor: AuthenticatedUser) {
    assertAdminPermission(actor.role, ADMIN_PERMISSIONS.reports.view);
    return this.adminReportsService.getTradingReport(query as TradingReportQueryDto, actor);
  }

  private mapOrder(order: OrderListRow | OrderDetailRow): AdminTradeOrderDto {
    return {
      id: order.id,
      orderNumber: order.orderNumber,
      userId: order.userId,
      user: order.user,
      side: order.side,
      status: order.status,
      symbol: order.symbol,
      karat: order.karat,
      quantityGram: order.quantityGram.toString(),
      unitPriceToman: order.unitPriceToman.toString(),
      grossRial: order.grossRial.toString(),
      commissionRial: order.commissionRial.toString(),
      netRial: order.netRial.toString(),
      commissionPercent: order.commissionPercent.toString(),
      failureReason: order.failureReason,
      walletTransactionId: order.walletTransactionId,
      createdAt: order.createdAt.toISOString(),
      filledAt: order.filledAt?.toISOString() ?? null,
    };
  }

  private mapOrderDetail(order: OrderDetailRow): AdminTradeOrderDetailDto {
    return {
      ...this.mapOrder(order),
      transaction: order.walletTransaction
        ? {
            id: order.walletTransaction.id,
            reference: order.walletTransaction.reference,
            type: order.walletTransaction.type,
            status: order.walletTransaction.status,
            description: order.walletTransaction.description,
            createdAt: order.walletTransaction.createdAt.toISOString(),
          }
        : undefined,
      auditLogs: order.auditLogs.map((log) => ({
        id: log.id,
        action: log.action,
        createdAt: log.createdAt.toISOString(),
        context:
          log.context && typeof log.context === 'object' && !Array.isArray(log.context)
            ? (log.context as Record<string, unknown>)
            : null,
      })),
    };
  }

}
