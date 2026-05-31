import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { KycStatus } from '@/generated/prisma';
import type { AuthenticatedUser } from '@/common/interfaces/auth-user.interface';
import type {
  AdminAuditQueryDto,
  AdminKycQueryDto,
  AdminTradeQueryDto,
  AdminUsersQueryDto,
  AdminWalletTxQueryDto,
  PaginationQueryDto,
} from '../dto/admin-query.dto';
import type { ReviewKycDto } from '../dto/review-kyc.dto';
import type { UpdateUserRoleDto } from '../dto/update-user-role.dto';
import { AdminRepository } from '../repositories/admin.repository';

@Injectable()
export class AdminService {
  constructor(private readonly adminRepository: AdminRepository) {}

  async getAnalytics() {
    const [
      totalUsers,
      adminUsers,
      pendingKyc,
      walletTx24h,
      trades24h,
      walletByType,
      tradesBySide,
    ] = await this.adminRepository.getAnalytics();

    return {
      totalUsers,
      adminUsers,
      pendingKyc,
      walletTransactions24h: walletTx24h,
      goldTrades24h: trades24h,
      walletVolumeByType: walletByType.map((row) => ({
        type: row.type,
        count: row._count.id,
      })),
      tradesBySide: tradesBySide.map((row) => ({
        side: row.side,
        count: row._count.id,
      })),
    };
  }

  async listUsers(query: AdminUsersQueryDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const skip = (page - 1) * limit;
    const [items, total] = await this.adminRepository.listUsers(
      skip,
      limit,
      query.search,
      query.role,
    );
    return { page, limit, total, items };
  }

  async updateUserRole(
    userId: string,
    payload: UpdateUserRoleDto,
    actor: AuthenticatedUser,
  ) {
    const user = await this.adminRepository.updateUserRole(userId, payload.role);
    await this.adminRepository.createAuditLog('admin.user.role_updated', actor.id, {
      userId,
      role: payload.role,
    });
    return user;
  }

  async listKyc(query: AdminKycQueryDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const skip = (page - 1) * limit;
    const [items, total] = await this.adminRepository.listKyc(
      skip,
      limit,
      query.status,
    );
    return { page, limit, total, items };
  }

  async reviewKyc(id: string, payload: ReviewKycDto, actor: AuthenticatedUser) {
    if (payload.status === KycStatus.PENDING) {
      throw new BadRequestException('Use APPROVED or REJECTED for review');
    }

    try {
      const result = await this.adminRepository.reviewKyc(
        id,
        payload.status,
        actor.id,
        payload.reviewNote,
      );
      await this.adminRepository.createAuditLog('admin.kyc.reviewed', actor.id, {
        kycId: id,
        status: payload.status,
      });
      return result;
    } catch {
      throw new NotFoundException('KYC record not found');
    }
  }

  async listWalletTransactions(query: AdminWalletTxQueryDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const skip = (page - 1) * limit;
    const [items, total] = await this.adminRepository.listWalletTransactions(
      skip,
      limit,
      query.type,
      query.userId,
    );
    return {
      page,
      limit,
      total,
      items: items.map((tx) => ({
        id: tx.id,
        reference: tx.reference,
        type: tx.type,
        status: tx.status,
        description: tx.description,
        userId: tx.userId,
        user: tx.user,
        createdAt: tx.createdAt,
        entries: tx.entries.map((e) => ({
          accountCode: e.account.code,
          side: e.side,
          assetType: e.assetType,
          amount: e.amount.toString(),
        })),
      })),
    };
  }

  async listTradeOrders(query: AdminTradeQueryDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const skip = (page - 1) * limit;
    const [items, total] = await this.adminRepository.listTradeOrders(
      skip,
      limit,
      query.side,
      query.userId,
    );
    return {
      page,
      limit,
      total,
      items: items.map((order) => ({
        id: order.id,
        orderNumber: order.orderNumber,
        userId: order.userId,
        user: order.user,
        side: order.side,
        status: order.status,
        quantityGram: order.quantityGram.toString(),
        netRial: order.netRial.toString(),
        createdAt: order.createdAt,
      })),
    };
  }

  async listWallets(query: PaginationQueryDto & { search?: string }) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const skip = (page - 1) * limit;
    const [users, total] = await this.adminRepository.listWallets(
      skip,
      limit,
      query.search,
    );

    const items = await Promise.all(
      users.map(async (user) => ({
        user,
        balances: await this.adminRepository.getUserWalletSnapshot(user.id),
      })),
    );

    return { page, limit, total, items };
  }

  async listAuditLogs(query: AdminAuditQueryDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const skip = (page - 1) * limit;
    const { items, total } = await this.adminRepository.listAuditLogs(
      skip,
      limit,
      query.source,
    );
    return { page, limit, total, items };
  }
}
