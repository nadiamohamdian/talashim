import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import * as argon2 from 'argon2';
import { tomanBigIntToNumber } from '@/common/finance/toman-amount';
import {
  ADMIN_PERMISSIONS,
} from '@sadafgold/shared/admin-rbac';
import { KycStatus, Role } from '@/generated/prisma';
import type { AuthenticatedUser } from '@/common/interfaces/auth-user.interface';
import { assertAdminPermission } from '@/common/rbac/assert-admin-permission';
import type {
  AdminAuditQueryDto,
  AdminKycQueryDto,
  AdminTradeQueryDto,
  AdminUsersQueryDto,
  AdminWalletTxQueryDto,
  AdminPaymentReceiptQueryDto,
  PaginationQueryDto,
} from '../dto/admin-query.dto';
import type { ReviewKycDto } from '../dto/review-kyc.dto';
import type { AdminUpdateUserContactDto } from '../dto/admin-update-user-contact.dto';
import type { UpdateUserRoleDto } from '../dto/update-user-role.dto';
import type {
  AdminLoginHistoryQueryDto,
  AdminSessionsQueryDto,
} from '../dto/admin-security-query.dto';
import type { CreateStaffUserDto } from '../dto/create-staff-user.dto';
import type { UpdateStaffUserDto } from '../dto/update-staff-user.dto';
import type { UpdateRolePermissionsBatchDto } from '../dto/update-role-permissions.dto';
import { WalletService } from '@/modules/wallet/services/wallet.service';
import type { RejectWalletDepositDto } from '../dto/reject-wallet-deposit.dto';
import type { AdjustUserWalletDto } from '../dto/adjust-user-wallet.dto';
import { AdminRepository } from '../repositories/admin.repository';
import { AdminRbacService } from './admin-rbac.service';

function parseWalletWithdrawalMetadata(metadata: unknown) {
  if (!metadata || typeof metadata !== 'object') {
    return null;
  }
  const record = metadata as Record<string, unknown>;
  if (typeof record.iban !== 'string') {
    return null;
  }
  return {
    iban: record.iban,
    amountToman: typeof record.amountToman === 'string' ? record.amountToman : null,
    rejectionReason:
      typeof record.rejectionReason === 'string' ? record.rejectionReason : null,
  };
}

function parseWalletDepositMetadata(metadata: unknown) {
  if (!metadata || typeof metadata !== 'object') {
    return null;
  }
  const record = metadata as Record<string, unknown>;
  if (typeof record.receiptUrl !== 'string') {
    return null;
  }
  return {
    receiptUrl: record.receiptUrl,
    amountToman: typeof record.amountToman === 'string' ? record.amountToman : null,
    provider: typeof record.provider === 'string' ? record.provider : null,
    rejectionReason:
      typeof record.rejectionReason === 'string' ? record.rejectionReason : null,
  };
}

function mapAdminWalletTransaction(
  tx: Awaited<ReturnType<AdminRepository['listWalletTransactions']>>[0][number],
) {
  return {
    id: tx.id,
    reference: tx.reference,
    type: tx.type,
    status: tx.status,
    description: tx.description,
    userId: tx.userId,
    user: tx.user,
    createdAt:
      tx.createdAt instanceof Date ? tx.createdAt.toISOString() : String(tx.createdAt),
    depositRequest: parseWalletDepositMetadata(tx.metadata),
    withdrawalRequest: parseWalletWithdrawalMetadata(tx.metadata),
    entries: tx.entries.map((e) => ({
      accountCode: e.account.code,
      side: e.side,
      assetType: e.assetType,
      amount: e.amount.toString(),
    })),
  };
}

@Injectable()
export class AdminService {
  constructor(
    private readonly adminRepository: AdminRepository,
    private readonly adminRbacService: AdminRbacService,
    private readonly walletService: WalletService,
  ) {}

  async getAnalytics(actor: AuthenticatedUser) {
    assertAdminPermission(actor.role, ADMIN_PERMISSIONS.dashboard.view);

    const [
      totalUsers,
      staffUsers,
      pendingKyc,
      walletTx24h,
      trades24h,
      walletByType,
      tradesBySide,
    ] = await this.adminRepository.getAnalytics();

    return {
      totalUsers,
      adminUsers: staffUsers,
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

  async listUsers(query: AdminUsersQueryDto, actor: AuthenticatedUser) {
    assertAdminPermission(actor.role, ADMIN_PERMISSIONS.users.read);

    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const skip = (page - 1) * limit;
    const [items, total] = await this.adminRepository.listUsers(
      skip,
      limit,
      query.search,
      query.role,
      query.staffOnly,
    );
    return { page, limit, total, items };
  }

  async getUserDetail(userId: string, actor: AuthenticatedUser) {
    assertAdminPermission(actor.role, ADMIN_PERMISSIONS.users.read);

    const user = await this.adminRepository.findUserById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const [balances, [ordersCount, tradesCount], recentOrders, recentWalletTransactions, recentTrades] =
      await Promise.all([
        this.adminRepository.getUserWalletSnapshot(userId),
        this.adminRepository.getUserOrderStats(userId),
        this.adminRepository.getUserRecentOrders(userId),
        this.adminRepository.getUserRecentWalletTransactions(userId),
        this.adminRepository.getUserRecentTrades(userId),
      ]);

    return {
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        phone: user.phone,
        role: user.role.toLowerCase(),
        createdAt: user.createdAt.toISOString(),
      },
      balances,
      stats: { orders: ordersCount, goldTrades: tradesCount },
      kyc: user.kycVerification
        ? {
            id: user.kycVerification.id,
            status: user.kycVerification.status,
            nationalId: user.kycVerification.nationalId,
            phone: user.kycVerification.phone,
            submittedAt: user.kycVerification.submittedAt.toISOString(),
            reviewNote: user.kycVerification.reviewNote,
          }
        : null,
      addresses: user.addresses.map((address) => ({
        id: address.id,
        title: address.title,
        recipient: address.recipient,
        phone: address.phone,
        line1: address.line1,
        city: address.city,
        state: address.state,
        postalCode: address.postalCode,
        createdAt: address.createdAt.toISOString(),
      })),
      recentOrders: recentOrders.map((order) => ({
        id: order.id,
        orderNumber: order.orderNumber,
        totalToman: tomanBigIntToNumber(order.totalToman),
        status: order.status,
      })),
      recentWalletTransactions: recentWalletTransactions.map((tx) => ({
        id: tx.id,
        type: tx.type,
        reference: tx.reference,
      })),
      recentTrades: recentTrades.map((trade) => ({
        id: trade.id,
        orderNumber: trade.orderNumber,
        side: trade.side,
        quantityGram: trade.quantityGram.toString(),
      })),
    };
  }

  async updateUserContact(
    userId: string,
    payload: AdminUpdateUserContactDto,
    actor: AuthenticatedUser,
  ) {
    assertAdminPermission(actor.role, ADMIN_PERMISSIONS.users.write);

    const user = await this.adminRepository.findUserById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (!payload.phone && !payload.address) {
      throw new BadRequestException('No contact fields to update');
    }

    if (payload.phone) {
      const phoneTaken = await this.adminRepository.findKycByPhoneForOtherUser(
        payload.phone,
        userId,
      );
      if (phoneTaken) {
        throw new BadRequestException('This phone number is already registered');
      }

      if (user.kycVerification) {
        await this.adminRepository.updateKycPhone(userId, payload.phone);
      } else {
        if (!payload.nationalId?.trim()) {
          throw new BadRequestException(
            'National ID is required when setting phone for a user without KYC',
          );
        }
        await this.adminRepository.createKycForUser(userId, {
          phone: payload.phone,
          nationalId: payload.nationalId.trim(),
        });
      }
    }

    if (payload.address) {
      const patch = payload.address;
      const existing = patch.id
        ? await this.adminRepository.findUserAddressById(userId, patch.id)
        : await this.adminRepository.findPrimaryUserAddress(userId);

      const merged = {
        title: patch.title ?? existing?.title ?? 'آدرس اصلی',
        recipient: patch.recipient ?? existing?.recipient ?? user.fullName,
        phone: patch.phone ?? existing?.phone ?? user.kycVerification?.phone ?? '',
        line1: patch.line1 ?? existing?.line1 ?? '',
        city: patch.city ?? existing?.city ?? '',
        state: patch.state ?? existing?.state ?? '',
        postalCode: patch.postalCode ?? existing?.postalCode ?? '',
      };

      const required = [
        merged.title,
        merged.recipient,
        merged.phone,
        merged.line1,
        merged.city,
        merged.state,
        merged.postalCode,
      ];
      if (required.some((value) => !value.trim())) {
        throw new BadRequestException('All address fields are required');
      }

      if (!/^09\d{9}$/.test(merged.phone)) {
        throw new BadRequestException('Address phone must be a valid Iranian mobile');
      }

      if (existing) {
        await this.adminRepository.updateUserAddress(existing.id, merged);
      } else {
        await this.adminRepository.createUserAddress(userId, merged);
      }
    }

    await this.adminRepository.createAuditLog('admin.user.contact_updated', actor.id, {
      userId,
      fields: {
        phone: Boolean(payload.phone),
        address: Boolean(payload.address),
      },
    });

    return this.getUserDetail(userId, actor);
  }

  async getUserActivity(
    userId: string,
    query: PaginationQueryDto,
    actor: AuthenticatedUser,
  ) {
    assertAdminPermission(actor.role, ADMIN_PERMISSIONS.users.read);

    const exists = await this.adminRepository.findUserById(userId);
    if (!exists) {
      throw new NotFoundException('User not found');
    }

    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const skip = (page - 1) * limit;
    const [items, total] = await this.adminRepository.listUserActivity(userId, skip, limit);

    return {
      page,
      limit,
      total,
      items: items.map((item) => ({
        id: item.id,
        source: item.source,
        action: item.action,
        context: item.context ?? undefined,
        createdAt: item.createdAt.toISOString(),
      })),
    };
  }

  async updateUserRole(
    userId: string,
    payload: UpdateUserRoleDto,
    actor: AuthenticatedUser,
  ) {
    assertAdminPermission(actor.role, ADMIN_PERMISSIONS.security.rbac);

    if (payload.role === Role.SUPER_ADMIN && actor.role !== Role.SUPER_ADMIN) {
      throw new ForbiddenException('Only super admin can assign super admin role');
    }

    const user = await this.adminRepository.updateUserRole(userId, payload.role);
    await this.adminRepository.createAuditLog('admin.user.role_updated', actor.id, {
      userId,
      role: payload.role,
    });
    return user;
  }

  async listKyc(query: AdminKycQueryDto, actor: AuthenticatedUser) {
    assertAdminPermission(actor.role, ADMIN_PERMISSIONS.kyc.read);

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
    assertAdminPermission(actor.role, ADMIN_PERMISSIONS.kyc.review);

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

  async listWalletTransactions(
    query: AdminWalletTxQueryDto,
    actor: AuthenticatedUser,
  ) {
    assertAdminPermission(actor.role, ADMIN_PERMISSIONS.finance.transactions);

    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const skip = (page - 1) * limit;
    const [items, total] = await this.adminRepository.listWalletTransactions(
      skip,
      limit,
      query.type,
      query.userId,
      query.status,
      query.hasReceipt === 'true' || query.hasReceipt === '1',
      query.hasWithdrawalRequest === 'true' || query.hasWithdrawalRequest === '1',
    );
    return {
      page,
      limit,
      total,
      items: items.map((tx) => mapAdminWalletTransaction(tx)),
    };
  }

  async approveWalletDeposit(transactionId: string, actor: AuthenticatedUser) {
    assertAdminPermission(actor.role, ADMIN_PERMISSIONS.finance.transactions);
    const transaction = await this.walletService.approveRialDepositRequest(
      transactionId,
      actor.id,
    );
    return mapAdminWalletTransaction(transaction);
  }

  async rejectWalletDeposit(
    transactionId: string,
    dto: RejectWalletDepositDto,
    actor: AuthenticatedUser,
  ) {
    assertAdminPermission(actor.role, ADMIN_PERMISSIONS.finance.transactions);
    const transaction = await this.walletService.rejectRialDepositRequest(
      transactionId,
      actor.id,
      dto.reason,
    );
    return mapAdminWalletTransaction(transaction);
  }

  async approveWalletWithdrawal(transactionId: string, actor: AuthenticatedUser) {
    assertAdminPermission(actor.role, ADMIN_PERMISSIONS.finance.transactions);
    const transaction = await this.walletService.approveRialWithdrawalRequest(
      transactionId,
      actor.id,
    );
    return mapAdminWalletTransaction(transaction);
  }

  async rejectWalletWithdrawal(
    transactionId: string,
    dto: RejectWalletDepositDto,
    actor: AuthenticatedUser,
  ) {
    assertAdminPermission(actor.role, ADMIN_PERMISSIONS.finance.transactions);
    const transaction = await this.walletService.rejectRialWithdrawalRequest(
      transactionId,
      actor.id,
      dto.reason,
    );
    return mapAdminWalletTransaction(transaction);
  }

  async listTradeOrders(query: AdminTradeQueryDto, actor: AuthenticatedUser) {
    assertAdminPermission(actor.role, ADMIN_PERMISSIONS.trading.read);

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

  async listPaymentReceipts(
    query: AdminPaymentReceiptQueryDto,
    actor: AuthenticatedUser,
  ) {
    assertAdminPermission(actor.role, ADMIN_PERMISSIONS.finance.transactions);

    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const skip = (page - 1) * limit;
    const [items, total] = await this.adminRepository.listPaymentReceipts(
      skip,
      limit,
      query.status,
    );

    return {
      page,
      limit,
      total,
      items: items.map((payment) => ({
        id: payment.id,
        orderId: payment.orderId,
        status: payment.status,
        provider: payment.provider,
        reference: payment.reference,
        amountToman: tomanBigIntToNumber(payment.amountToman),
        receiptUrl: payment.receiptUrl!,
        receiptUploadedAt: payment.receiptUploadedAt?.toISOString() ?? null,
        reviewedAt: payment.reviewedAt?.toISOString() ?? null,
        rejectionReason: payment.rejectionReason,
        createdAt: payment.createdAt.toISOString(),
        order: {
          id: payment.order.id,
          orderNumber: payment.order.orderNumber,
          status: payment.order.status,
          user: payment.order.user,
        },
      })),
    };
  }

  async listWallets(
    query: PaginationQueryDto & { search?: string },
    actor: AuthenticatedUser,
  ) {
    assertAdminPermission(actor.role, ADMIN_PERMISSIONS.finance.read);

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

  async adjustUserWallet(dto: AdjustUserWalletDto, actor: AuthenticatedUser) {
    assertAdminPermission(actor.role, ADMIN_PERMISSIONS.finance.adjust);

    const user = await this.adminRepository.findUserById(dto.userId);
    if (!user) {
      throw new NotFoundException('کاربر یافت نشد');
    }

    const idempotencyKey = dto.idempotencyKey?.trim() || `admin-wallet-adjust-${randomUUID()}`;
    const description =
      dto.direction === 'CREDIT'
        ? `شارژ دستی کیف پول: ${dto.reason.trim()}`
        : `برداشت دستی کیف پول: ${dto.reason.trim()}`;

    const transaction = await this.walletService.adminAdjustWallet({
      userId: dto.userId,
      assetType: dto.assetType,
      direction: dto.direction,
      amount: dto.amount.trim(),
      description,
      idempotencyKey,
      actorId: actor.id,
    });

    const balances = await this.adminRepository.getUserWalletSnapshot(dto.userId);

    await this.adminRepository.createAuditLog('admin.wallet.adjusted', actor.id, {
      userId: dto.userId,
      userEmail: user.email,
      assetType: dto.assetType,
      direction: dto.direction,
      amount: dto.amount,
      reason: dto.reason.trim(),
      transactionId: transaction.id,
      balances,
    });

    return {
      transactionId: transaction.id,
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
      },
      balances,
    };
  }

  async listAuditLogs(query: AdminAuditQueryDto, actor: AuthenticatedUser) {
    assertAdminPermission(actor.role, ADMIN_PERMISSIONS.security.audit);

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

  async listSessions(query: AdminSessionsQueryDto, actor: AuthenticatedUser) {
    assertAdminPermission(actor.role, ADMIN_PERMISSIONS.security.sessions);

    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const skip = (page - 1) * limit;
    const [rows, total] = await this.adminRepository.listSessions(
      skip,
      limit,
      query.search,
      query.status ?? 'all',
    );

    const now = Date.now();
    const items = rows.map((row) => {
      let status: 'active' | 'revoked' | 'expired' = 'active';
      if (row.revokedAt) {
        status = 'revoked';
      } else if (row.expiresAt.getTime() <= now) {
        status = 'expired';
      }

      return {
        id: row.id,
        userId: row.userId,
        user: row.user,
        status,
        expiresAt: row.expiresAt.toISOString(),
        revokedAt: row.revokedAt?.toISOString() ?? null,
        createdAt: row.createdAt.toISOString(),
      };
    });

    return { page, limit, total, items };
  }

  async revokeSession(sessionId: string, actor: AuthenticatedUser) {
    assertAdminPermission(actor.role, ADMIN_PERMISSIONS.security.sessions);

    const updated = await this.adminRepository.revokeSession(sessionId);
    if (!updated) {
      throw new NotFoundException('Session not found');
    }
    await this.adminRepository.createAuditLog('admin.session.revoked', actor.id, {
      sessionId,
    });
    return { success: true };
  }

  async revokeUserSessions(userId: string, actor: AuthenticatedUser) {
    assertAdminPermission(actor.role, ADMIN_PERMISSIONS.security.sessions);

    const result = await this.adminRepository.revokeAllUserSessions(userId);
    await this.adminRepository.createAuditLog('admin.sessions.revoked_all', actor.id, {
      userId,
      count: result.count,
    });
    return { success: true, revokedCount: result.count };
  }

  async listLoginHistory(query: AdminLoginHistoryQueryDto, actor: AuthenticatedUser) {
    assertAdminPermission(actor.role, ADMIN_PERMISSIONS.security.audit);

    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const skip = (page - 1) * limit;
    const [rows, total] = await this.adminRepository.listLoginHistory(
      skip,
      limit,
      query.search,
      query.action,
    );

    const items = rows.map((row) => ({
      id: row.id,
      action: row.action,
      actorId: row.actorId,
      actor: row.actor,
      context: row.context,
      createdAt: row.createdAt.toISOString(),
    }));

    return { page, limit, total, items };
  }

  getPermissionRegistry(actor: AuthenticatedUser) {
    return this.adminRbacService.getPermissionRegistry(actor);
  }

  getMyPermissions(actor: AuthenticatedUser) {
    return this.adminRbacService.getMyPermissions(actor);
  }

  updateRolePermissions(payload: UpdateRolePermissionsBatchDto, actor: AuthenticatedUser) {
    return this.adminRbacService.updateRolePermissions(payload, actor);
  }

  async createStaffUser(payload: CreateStaffUserDto, actor: AuthenticatedUser) {
    assertAdminPermission(actor.role, ADMIN_PERMISSIONS.security.rbac);

    if (payload.role === Role.SUPER_ADMIN && actor.role !== Role.SUPER_ADMIN) {
      throw new ForbiddenException('Only super admin can create super admin users');
    }

    const existing = await this.adminRepository.listUsers(0, 1, payload.email);
    if (existing[1] > 0) {
      throw new BadRequestException('Email already registered');
    }

    const passwordHash = await argon2.hash(payload.password);
    const user = await this.adminRepository.createStaffUser({
      email: payload.email,
      fullName: payload.fullName,
      passwordHash,
      role: payload.role,
    });

    await this.adminRepository.createAuditLog('admin.staff.created', actor.id, {
      userId: user.id,
      role: payload.role,
    });

    return {
      ...user,
      role: user.role.toLowerCase(),
      createdAt: user.createdAt.toISOString(),
    };
  }

  async updateStaffUser(
    userId: string,
    payload: UpdateStaffUserDto,
    actor: AuthenticatedUser,
  ) {
    assertAdminPermission(actor.role, ADMIN_PERMISSIONS.security.rbac);

    const staff = await this.adminRepository.findStaffUserById(userId);
    if (!staff) {
      throw new NotFoundException('Staff user not found');
    }

    if (payload.role === Role.SUPER_ADMIN && actor.role !== Role.SUPER_ADMIN) {
      throw new ForbiddenException('Only super admin can assign super admin role');
    }

    if (staff.role === Role.SUPER_ADMIN && actor.role !== Role.SUPER_ADMIN) {
      throw new ForbiddenException('Only super admin can modify super admin users');
    }

    const data: {
      email?: string;
      fullName?: string;
      passwordHash?: string;
      role?: Role;
    } = {};

    if (payload.email !== undefined) {
      data.email = payload.email;
    }
    if (payload.fullName !== undefined) {
      data.fullName = payload.fullName;
    }
    if (payload.role !== undefined) {
      data.role = payload.role;
    }
    if (payload.password !== undefined && payload.password !== '') {
      data.passwordHash = await argon2.hash(payload.password);
    }

    const user = await this.adminRepository.updateStaffUser(userId, data);
    await this.adminRepository.createAuditLog('admin.staff.updated', actor.id, {
      userId,
      changes: Object.keys(data),
    });

    return {
      ...user,
      role: user.role.toLowerCase(),
      createdAt: user.createdAt.toISOString(),
    };
  }
}
