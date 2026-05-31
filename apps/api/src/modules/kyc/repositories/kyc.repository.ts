import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/infrastructure/database/prisma.service';

@Injectable()
export class KycRepository {
  constructor(private readonly prisma: PrismaService) {}

  findByUserId(userId: string) {
    return this.prisma.kycVerification.findUnique({ where: { userId } });
  }

  findByPhone(phone: string) {
    return this.prisma.kycVerification.findFirst({ where: { phone } });
  }

  create(userId: string, data: {
    nationalId: string;
    phone: string;
    documentType: string;
    documentUrl?: string;
  }) {
    return this.prisma.kycVerification.create({
      data: {
        userId,
        nationalId: data.nationalId,
        phone: data.phone,
        documentType: data.documentType,
        documentUrl: data.documentUrl,
      },
    });
  }

  resubmit(id: string, data: {
    nationalId: string;
    phone: string;
    documentType: string;
    documentUrl?: string;
  }) {
    return this.prisma.kycVerification.update({
      where: { id },
      data: {
        nationalId: data.nationalId,
        phone: data.phone,
        documentType: data.documentType,
        documentUrl: data.documentUrl,
        status: 'PENDING',
        reviewNote: null,
        reviewedAt: null,
        reviewedById: null,
        submittedAt: new Date(),
      },
    });
  }
}
