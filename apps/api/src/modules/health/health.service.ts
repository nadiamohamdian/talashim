import { Injectable, ServiceUnavailableException } from '@nestjs/common';
import { PrismaService } from '@/infrastructure/database/prisma.service';
import { RedisService } from '@/infrastructure/redis/redis.service';
import { MarketCacheHealthService } from '@/modules/market/services/market-cache-health.service';
import type { MarketCacheHealthReport } from '@/modules/market/interfaces/market-cache.types';

export interface HealthCheckResult {
  status: 'ok' | 'degraded' | 'error';
  checks: {
    database: 'up' | 'down';
    redis: 'up' | 'down';
    marketCache: 'ok' | 'degraded' | 'down';
  };
  market?: MarketCacheHealthReport;
  timestamp: string;
}

@Injectable()
export class HealthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
    private readonly marketCacheHealth: MarketCacheHealthService,
  ) {}

  async getHealth(): Promise<HealthCheckResult> {
    const [databaseUp, redisUp, marketHealth] = await Promise.all([
      this.prisma.isHealthy(),
      this.redis.ping().then((pong) => pong === 'PONG').catch(() => false),
      this.marketCacheHealth.getHealth(),
    ]);

    const checks = {
      database: databaseUp ? ('up' as const) : ('down' as const),
      redis: redisUp ? ('up' as const) : ('down' as const),
      marketCache: marketHealth.status,
    };

    const timestamp = new Date().toISOString();

    if (!databaseUp || !redisUp) {
      throw new ServiceUnavailableException({
        status: 'error',
        checks,
        market: marketHealth,
        timestamp,
      });
    }

    const status =
      marketHealth.status === 'ok'
        ? ('ok' as const)
        : marketHealth.status === 'degraded'
          ? ('degraded' as const)
          : ('error' as const);

    if (status === 'error') {
      throw new ServiceUnavailableException({
        status: 'error',
        checks,
        market: marketHealth,
        timestamp,
      });
    }

    return {
      status,
      checks,
      market: marketHealth,
      timestamp,
    };
  }
}
