import { Inject, Injectable, Logger } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';

@Injectable()
export class RedisService {
  private readonly logger = new Logger(RedisService.name);

  constructor(
    @Inject(CACHE_MANAGER)
    private readonly cache: Cache,
  ) {}

  async get<T>(key: string): Promise<T | null> {
    try {
      return (await this.cache.get<T>(key)) ?? null;
    } catch {
      this.logger.warn(`Redis GET failed: ${key}`);
      return null;
    }
  }

  async set(key: string, value: any, ttlSeconds?: number) {
    try {
      await this.cache.set(key, value, ttlSeconds);
    } catch {
      this.logger.warn(`Redis SET failed: ${key}`);
    }
  }

  async del(key: string) {
    try {
      await this.cache.del(key);
    } catch {
      this.logger.warn(`Redis DEL failed: ${key}`);
    }
  }
}
