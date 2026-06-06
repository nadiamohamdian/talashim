import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import { PrismaClient } from '@/generated/prisma';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  private readonly logger = new Logger(PrismaService.name);
  private readonly pool: Pool;

  constructor() {
    const connectionString = process.env.DATABASE_URL;
    if (!connectionString) {
      throw new Error('DATABASE_URL is required for PrismaService');
    }

    const pool = new Pool({ connectionString });
    super({ adapter: new PrismaPg(pool) });
    this.pool = pool;
  }

  async onModuleInit() {
    const maxAttempts = process.env.NODE_ENV === 'production' ? 1 : 15;
    const delayMs = 2_000;

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        await this.$connect();
        this.logger.log('PostgreSQL connection established');
        return;
      } catch (error) {
        const message = error instanceof Error ? error.message : 'unknown';
        const isLast = attempt === maxAttempts;

        if (isLast) {
          this.logger.error(
            `PostgreSQL connection failed after ${maxAttempts} attempt(s): ${message}`,
          );
          this.logger.error(
            'Start infrastructure: pnpm dev:infra (Docker: postgres, redis, minio)',
          );
          throw error;
        }

        this.logger.warn(
          `PostgreSQL not ready (${attempt}/${maxAttempts}): ${message} — retrying in ${delayMs / 1000}s…`,
        );
        await new Promise((resolve) => setTimeout(resolve, delayMs));
      }
    }
  }

  async onModuleDestroy() {
    await this.$disconnect();
    await this.pool.end();
    this.logger.log('PostgreSQL connection closed');
  }

  async isHealthy(): Promise<boolean> {
    try {
      await this.$queryRaw`SELECT 1`;
      return true;
    } catch {
      return false;
    }
  }
}
