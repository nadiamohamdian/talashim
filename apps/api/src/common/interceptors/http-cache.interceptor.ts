import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable, of, tap } from 'rxjs';
import {
  HTTP_CACHE_KEY,
  type HttpCacheMetadata,
} from '@/common/decorators/http-cache.decorator';
import { CacheService } from '@/infrastructure/cache/cache.service';
import { getApiEnv } from '@/config/env';
import type { RequestWithContext } from '@/common/types/request-context';

@Injectable()
export class HttpCacheInterceptor implements NestInterceptor {
  constructor(
    private readonly reflector: Reflector,
    private readonly cacheService: CacheService,
  ) {}

  async intercept(context: ExecutionContext, next: CallHandler): Promise<Observable<unknown>> {
    const meta = this.reflector.getAllAndOverride<HttpCacheMetadata | undefined>(
      HTTP_CACHE_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!meta) {
      return next.handle();
    }

    const request = context.switchToHttp().getRequest<RequestWithContext>();
    if (request.method !== 'GET') {
      return next.handle();
    }

    const env = getApiEnv();
    const ttl = meta.ttlSeconds ?? env.HTTP_CACHE_TTL_SECONDS;
    const cacheKey =
      meta.key ??
      `http:${request.method}:${request.path}:${JSON.stringify(request.query ?? {})}`;

    const cached = await this.cacheService.get<unknown>(cacheKey);
    const response = context.switchToHttp().getResponse<{ setHeader(name: string, value: string): void }>();

    if (cached !== null) {
      response.setHeader('X-Cache', 'HIT');
      return of(cached);
    }

    response.setHeader('X-Cache', 'MISS');
    return next.handle().pipe(
      tap((body) => {
        void this.cacheService.set(cacheKey, body, ttl);
      }),
    );
  }
}
