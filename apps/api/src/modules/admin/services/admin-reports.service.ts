import { Injectable } from '@nestjs/common';
import { ADMIN_PERMISSIONS } from '@talashim/shared/admin-rbac';
import type { AuthenticatedUser } from '@/common/interfaces/auth-user.interface';
import { assertAdminPermission } from '@/common/rbac/assert-admin-permission';
import type {
  FinancialReportQueryDto,
  InventoryReportQueryDto,
  SalesReportQueryDto,
  TradingReportQueryDto,
  UsersReportQueryDto,
} from '../dto/admin-reports-query.dto';
import { AdminReportsRepository } from '../repositories/admin-reports.repository';

const LOW_STOCK_THRESHOLD = 2;

@Injectable()
export class AdminReportsService {
  constructor(private readonly reportsRepository: AdminReportsRepository) {}

  async getSalesReport(query: SalesReportQueryDto, actor: AuthenticatedUser) {
    assertAdminPermission(actor.role, ADMIN_PERMISSIONS.reports.view);

    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const skip = (page - 1) * limit;

    const [summary, [orders, total]] = await Promise.all([
      this.reportsRepository.getSalesSummary(query.from, query.to),
      this.reportsRepository.listSalesOrders(
        skip,
        limit,
        query.from,
        query.to,
        query.status,
      ),
    ]);

    return {
      summary: {
        period: {
          from: summary.period.from,
          to: summary.period.to,
        },
        kpis: [
          { key: 'revenue', label: 'درآمد (تومان)', value: summary.totalRevenue },
          {
            key: 'paidOrders',
            label: 'سفارش‌های پرداخت‌شده',
            value: summary.orderCount,
          },
          { key: 'allOrders', label: 'کل سفارش‌ها', value: summary.allCount },
          { key: 'aov', label: 'میانگین سفارش', value: summary.avgOrder },
        ],
        byStatus: summary.byStatus,
        dailySeries: summary.dailySeries,
      },
      page,
      limit,
      total,
      items: orders.map((order) => ({
        id: order.id,
        orderNumber: order.orderNumber,
        status: order.status,
        totalToman: order.totalToman,
        subtotalToman: order.subtotalToman,
        taxToman: order.taxToman,
        itemCount: order._count.items,
        user: order.user,
        createdAt: order.createdAt.toISOString(),
      })),
    };
  }

  async getInventoryReport(query: InventoryReportQueryDto, actor: AuthenticatedUser) {
    assertAdminPermission(actor.role, ADMIN_PERMISSIONS.reports.view);

    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const skip = (page - 1) * limit;

    const summary = await this.reportsRepository.getInventorySummary();

    if (query.lowStockOnly) {
      const [products, total] = await this.reportsRepository.listInventory(
        0,
        500,
        query.category,
        query.search,
        false,
      );
      const filtered = products.filter((p) => {
        if (!p.inventoryItem) {
          return false;
        }
        const available = p.inventoryItem.quantity - p.inventoryItem.reserved;
        return available <= LOW_STOCK_THRESHOLD;
      });
      const slice = filtered.slice(skip, skip + limit);
      return {
        summary: this.mapInventorySummary(summary),
        page,
        limit,
        total: filtered.length,
        items: slice.map((p) => this.mapInventoryRow(p)),
      };
    }

    const [products, total] = await this.reportsRepository.listInventory(
      skip,
      limit,
      query.category,
      query.search,
      false,
    );

    return {
      summary: this.mapInventorySummary(summary),
      page,
      limit,
      total,
      items: products.map((p) => this.mapInventoryRow(p)),
    };
  }

  async getUsersReport(query: UsersReportQueryDto, actor: AuthenticatedUser) {
    assertAdminPermission(actor.role, ADMIN_PERMISSIONS.reports.view);

    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const skip = (page - 1) * limit;

    const [summary, [users, total]] = await Promise.all([
      this.reportsRepository.getUsersSummary(query.from, query.to),
      this.reportsRepository.listUsersReport(
        skip,
        limit,
        query.from,
        query.to,
        query.role,
        query.search,
      ),
    ]);

    return {
      summary: {
        period: { from: summary.period.from, to: summary.period.to },
        kpis: [
          { key: 'total', label: 'کل کاربران', value: summary.totalUsers },
          { key: 'new', label: 'ثبت‌نام در بازه', value: summary.newUsers },
          { key: 'customers', label: 'مشتری', value: summary.customers },
          { key: 'staff', label: 'پرسنل', value: summary.staff },
          { key: 'kycPending', label: 'KYC در انتظار', value: summary.kycPending },
        ],
        byRole: summary.byRole,
        kycByStatus: [
          { key: 'APPROVED', label: 'تأیید شده', count: summary.kycApproved },
          { key: 'PENDING', label: 'در انتظار', count: summary.kycPending },
          { key: 'REJECTED', label: 'رد شده', count: summary.kycRejected },
        ],
        registrationSeries: summary.registrationSeries,
      },
      page,
      limit,
      total,
      items: users.map((user) => ({
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
        createdAt: user.createdAt.toISOString(),
        kycStatus: user.kycVerification?.status ?? null,
        orderCount: user._count.orders,
      })),
    };
  }

  async getTradingReport(query: TradingReportQueryDto, actor: AuthenticatedUser) {
    assertAdminPermission(actor.role, ADMIN_PERMISSIONS.reports.view);

    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const skip = (page - 1) * limit;

    const [summary, [trades, total]] = await Promise.all([
      this.reportsRepository.getTradingSummary(query.from, query.to),
      this.reportsRepository.listTradingReport(
        skip,
        limit,
        query.from,
        query.to,
        query.side,
        query.status,
      ),
    ]);

    return {
      summary: {
        period: { from: summary.period.from, to: summary.period.to },
        kpis: [
          { key: 'total', label: 'کل معاملات', value: summary.total },
          { key: 'filled', label: 'تکمیل‌شده', value: summary.filled },
          { key: 'volume', label: 'حجم (گرم)', value: summary.volumeGram },
          { key: 'commission', label: 'کارمزد (تومان)', value: summary.commissionTotal },
        ],
        bySide: summary.bySide,
        byStatus: summary.byStatus,
        dailySeries: summary.dailySeries,
      },
      page,
      limit,
      total,
      items: trades.map((t) => ({
        id: t.id,
        orderNumber: t.orderNumber,
        side: t.side,
        status: t.status,
        quantityGram: t.quantityGram.toString(),
        netRial: t.netRial.toString(),
        commissionRial: t.commissionRial.toString(),
        user: t.user,
        createdAt: t.createdAt.toISOString(),
        filledAt: t.filledAt?.toISOString() ?? null,
      })),
    };
  }

  async getFinancialReport(query: FinancialReportQueryDto, actor: AuthenticatedUser) {
    assertAdminPermission(actor.role, ADMIN_PERMISSIONS.reports.view);

    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const skip = (page - 1) * limit;

    const [summary, [transactions, total]] = await Promise.all([
      this.reportsRepository.getFinancialSummary(query.from, query.to),
      this.reportsRepository.listFinancialReport(
        skip,
        limit,
        query.from,
        query.to,
        query.type,
      ),
    ]);

    return {
      summary: {
        period: { from: summary.period.from, to: summary.period.to },
        kpis: [
          { key: 'total', label: 'کل تراکنش‌ها', value: summary.total },
          { key: 'posted', label: 'ثبت‌شده', value: summary.posted },
        ],
        byType: summary.byType,
        byStatus: summary.byStatus,
        dailySeries: summary.dailySeries,
      },
      page,
      limit,
      total,
      items: transactions.map((tx) => ({
        id: tx.id,
        reference: tx.reference,
        type: tx.type,
        status: tx.status,
        description: tx.description,
        user: tx.user,
        createdAt: tx.createdAt.toISOString(),
      })),
    };
  }

  private mapInventorySummary(summary: Awaited<
    ReturnType<AdminReportsRepository['getInventorySummary']>
  >) {
    return {
      kpis: [
        { key: 'products', label: 'محصولات', value: summary.productCount },
        { key: 'units', label: 'کل واحد', value: summary.totalUnits },
        { key: 'available', label: 'قابل فروش', value: summary.availableUnits },
        { key: 'low', label: 'کم‌موجود', value: summary.lowStockCount },
        { key: 'out', label: 'ناموجود', value: summary.outOfStockCount },
      ],
      byCategory: summary.byCategory,
      lowStockThreshold: summary.lowStockThreshold,
    };
  }

  private mapInventoryRow(
    product: Awaited<
      ReturnType<AdminReportsRepository['listInventory']>
    >[0][number],
  ) {
    const inv = product.inventoryItem;
    const quantity = inv?.quantity ?? 0;
    const reserved = inv?.reserved ?? 0;
    const available = quantity - reserved;
    return {
      productId: product.id,
      sku: product.sku,
      title: product.title,
      category: product.category,
      quantity,
      reserved,
      available,
      lowStock: available <= LOW_STOCK_THRESHOLD && available > 0,
      updatedAt: inv?.updatedAt.toISOString() ?? product.updatedAt.toISOString(),
    };
  }
}
