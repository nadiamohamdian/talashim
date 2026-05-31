import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/infrastructure/database/prisma.service';
import type { ContactDto } from '../dto/contact.dto';

@Injectable()
export class ContactService {
  constructor(private readonly prisma: PrismaService) {}

  async submit(payload: ContactDto) {
    await this.prisma.auditLog.create({
      data: {
        action: 'contact.message',
        context: {
          fullName: payload.fullName,
          email: payload.email,
          phone: payload.phone,
          message: payload.message,
        },
      },
    });

    return { success: true };
  }
}
