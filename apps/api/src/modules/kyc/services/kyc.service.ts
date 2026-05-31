import {
  BadRequestException,
  ConflictException,
  Injectable,
} from '@nestjs/common';
import { KycStatus } from '@/generated/prisma';
import type { AuthenticatedUser } from '@/common/interfaces/auth-user.interface';
import { PrismaService } from '@/infrastructure/database/prisma.service';
import type { SubmitKycDto } from '../dto/submit-kyc.dto';
import { KycRepository } from '../repositories/kyc.repository';

@Injectable()
export class KycService {
  constructor(
    private readonly kycRepository: KycRepository,
    private readonly prisma: PrismaService,
  ) {}

  async getStatus(userId: string) {
    const kyc = await this.kycRepository.findByUserId(userId);
    if (!kyc) {
      return { status: 'none' as const };
    }
    return this.toResponse(kyc);
  }

  async submit(user: AuthenticatedUser, payload: SubmitKycDto) {
    const existing = await this.kycRepository.findByUserId(user.id);
    if (existing?.status === KycStatus.APPROVED) {
      throw new ConflictException('KYC already approved');
    }
    if (existing?.status === KycStatus.PENDING) {
      throw new ConflictException('KYC submission is pending review');
    }

    const documentType = payload.documentType ?? 'national_card';
    const data = {
      nationalId: payload.nationalId,
      phone: payload.phone,
      documentType,
      documentUrl: payload.documentUrl,
    };

    const kyc =
      existing?.status === KycStatus.REJECTED
        ? await this.kycRepository.resubmit(existing.id, data)
        : existing
          ? (() => {
              throw new BadRequestException('Invalid KYC state');
            })()
          : await this.kycRepository.create(user.id, data);

    await this.prisma.auditLog.create({
      data: {
        actorId: user.id,
        action: 'kyc.submitted',
        context: { kycId: kyc.id },
      },
    });

    return this.toResponse(kyc);
  }

  async findUserIdByPhone(phone: string): Promise<string | null> {
    const kyc = await this.kycRepository.findByPhone(phone.trim());
    return kyc?.userId ?? null;
  }

  private toResponse(kyc: {
    id: string;
    nationalId: string;
    phone: string;
    documentType: string;
    documentUrl: string | null;
    status: KycStatus;
    reviewNote: string | null;
    submittedAt: Date;
    reviewedAt: Date | null;
  }) {
    return {
      id: kyc.id,
      nationalId: kyc.nationalId,
      phone: kyc.phone,
      documentType: kyc.documentType,
      documentUrl: kyc.documentUrl,
      status: kyc.status.toLowerCase() as 'pending' | 'approved' | 'rejected',
      reviewNote: kyc.reviewNote,
      submittedAt: kyc.submittedAt.toISOString(),
      reviewedAt: kyc.reviewedAt?.toISOString() ?? null,
    };
  }
}
