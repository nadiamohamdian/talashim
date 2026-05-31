import { SetMetadata } from '@nestjs/common';

export const HTTP_CACHE_KEY = 'httpCache';

export interface HttpCacheMetadata {
  ttlSeconds?: number;
  key?: string;
}

export const HttpCache = (options: HttpCacheMetadata = {}) =>
  SetMetadata(HTTP_CACHE_KEY, options);
