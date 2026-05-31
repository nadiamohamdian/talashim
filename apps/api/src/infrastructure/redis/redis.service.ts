import { Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
import Redis from 'ioredis';
import { getApiEnv } from '@/config/env';

@Injectable()
export class RedisService implements OnModuleDestroy {
  private readonly logger = new Logger(RedisService.name);
  private readonly client: Redis;

  constructor() {
    const env = getApiEnv();
    this.client = new Redis(env.REDIS_URL, {
      maxRetriesPerRequest: 2,
      lazyConnect: true,
    });
    this.client.on('error', (error) => {
      this.logger.warn(`Redis error: ${error.message}`);
    });
  }

  getClient() {
    return this.client;
  }

  async connect() {
    if (this.client.status === 'ready') return;
    await this.client.connect();
  }

  async get(key: string) {
    await this.connect();
    return this.client.get(key);
  }

  async set(key: string, value: string, ttlSeconds?: number) {
    await this.connect();
    if (ttlSeconds) {
      await this.client.set(key, value, 'EX', ttlSeconds);
      return;
    }
    await this.client.set(key, value);
  }

  async del(...keys: string[]) {
    if (keys.length === 0) return 0;
    await this.connect();
    return this.client.del(...keys);
  }

  async ttl(key: string): Promise<number> {
    await this.connect();
    return this.client.ttl(key);
  }

  async mget(...keys: string[]) {
    if (keys.length === 0) return [];
    await this.connect();
    return this.client.mget(...keys);
  }

  /**
   * SET key value NX EX ttl — returns true when the lock was acquired.
   */
  async setIfNotExists(key: string, value: string, ttlSeconds: number): Promise<boolean> {
    await this.connect();
    const result = await this.client.set(key, value, 'EX', ttlSeconds, 'NX');
    return result === 'OK';
  }

  async ping() {
    await this.connect();
    return this.client.ping();
  }

  isReady() {
    return this.client.status === 'ready';
  }

  async onModuleDestroy() {
    await this.client.quit();
  }
}
