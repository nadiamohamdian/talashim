import { Injectable, Logger } from '@nestjs/common';
import { getApiEnv } from '@/config/env';
import { RedisService } from '@/infrastructure/redis/redis.service';

const KEY_PREFIX = 'api:cache:';

@Injectable()
export class CacheService {
  private readonly logger = new Logger(CacheService.name);
  private readonly defaultTtl: number;

  constructor(private readonly redis: RedisService) {
    this.defaultTtl = getApiEnv().HTTP_CACHE_TTL_SECONDS;
  }

  private scopedKey(key: string) {
    return `${KEY_PREFIX}${key}`;
  }

  async get<T>(key: string): Promise<T | null> {
    try {
      const raw = await this.redis.get(this.scopedKey(key));
      if (!raw) return null;
      return JSON.parse(raw) as T;
    } catch (error) {
      this.logger.warn(
        `Cache get failed for ${key}: ${error instanceof Error ? error.message : 'unknown'}`,
      );
      return null;
    }
  }

  async set<T>(key: string, value: T, ttlSeconds = this.defaultTtl) {
    try {
      await this.redis.set(this.scopedKey(key), JSON.stringify(value), ttlSeconds);
    } catch (error) {
      this.logger.warn(
        `Cache set failed for ${key}: ${error instanceof Error ? error.message : 'unknown'}`,
      );
    }
  }

  async del(key: string) {
    try {
      await this.redis.del(this.scopedKey(key));
    } catch (error) {
      this.logger.warn(
        `Cache del failed for ${key}: ${error instanceof Error ? error.message : 'unknown'}`,
      );
    }
  }

  async remember<T>(key: string, factory: () => Promise<T>, ttlSeconds = this.defaultTtl) {
    const cached = await this.get<T>(key);
    if (cached !== null) {
      return { value: cached, hit: true as const };
    }

    const value = await factory();
    await this.set(key, value, ttlSeconds);
    return { value, hit: false as const };
  }
}
