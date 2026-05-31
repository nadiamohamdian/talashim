import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/infrastructure/database/prisma.service';

@Injectable()
export class AddressesRepository {
  constructor(private readonly prisma: PrismaService) {}

  findByUserId(userId: string) {
    return this.prisma.address.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  findByIdForUser(id: string, userId: string) {
    return this.prisma.address.findFirst({ where: { id, userId } });
  }

  create(userId: string, data: {
    title: string;
    recipient: string;
    phone: string;
    line1: string;
    city: string;
    state: string;
    postalCode: string;
  }) {
    return this.prisma.address.create({ data: { userId, ...data } });
  }

  update(id: string, data: Partial<{
    title: string;
    recipient: string;
    phone: string;
    line1: string;
    city: string;
    state: string;
    postalCode: string;
  }>) {
    return this.prisma.address.update({ where: { id }, data });
  }

  delete(id: string) {
    return this.prisma.address.delete({ where: { id } });
  }
}
