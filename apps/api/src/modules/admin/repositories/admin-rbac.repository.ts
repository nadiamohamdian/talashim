import { Role } from '@/generated/prisma';
import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/infrastructure/database/prisma.service';

@Injectable()
export class AdminRbacRepository {
  constructor(private readonly prisma: PrismaService) {}

  countPermissions(): Promise<number> {
    return this.prisma.staffRolePermission.count();
  }

  findAllGroupedByRole(): Promise<Array<{ role: Role; permission: string }>> {
    return this.prisma.staffRolePermission.findMany({
      select: { role: true, permission: true },
      orderBy: [{ role: 'asc' }, { permission: 'asc' }],
    });
  }

  async replaceRolePermissions(role: Role, permissions: string[]): Promise<void> {
    await this.prisma.$transaction(async (tx) => {
      await tx.staffRolePermission.deleteMany({ where: { role } });
      if (permissions.length === 0) {
        return;
      }
      await tx.staffRolePermission.createMany({
        data: permissions.map((permission) => ({ role, permission })),
      });
    });
  }

  seedDefaults(rows: Array<{ role: Role; permission: string }>): Promise<{ count: number }> {
    return this.prisma.staffRolePermission.createMany({
      data: rows,
      skipDuplicates: true,
    });
  }
}
