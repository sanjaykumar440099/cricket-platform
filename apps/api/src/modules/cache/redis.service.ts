import { Inject, Injectable, Logger } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { randomUUID } from 'crypto';
import Redis from 'ioredis';
@Injectable()
export class RedisService {
  private readonly logger = new Logger(RedisService.name);
  private subscriber!: Redis;
  private publisher!: Redis;

  constructor(
    @Inject(CACHE_MANAGER)
    private readonly cache: Cache,
  ) {
    this.publisher = new Redis({
      host: process.env.REDIS_HOST,
      port: Number(process.env.REDIS_PORT),
    });

    this.subscriber = new Redis({
      host: process.env.REDIS_HOST,
      port: Number(process.env.REDIS_PORT),
    });
  }

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

  async acquireLock(
    key: string,
    ttlMs: number = 5000,
  ): Promise<string | null> {
    const token = randomUUID();
    const success = await this.cache.set(
      key,
      token,
      { ttl: ttlMs / 1000, mode: 'EX', set: 'NX' } as any,
    );
    return success ? token : null;
  }

  async releaseLock(key: string, token: string): Promise<void> {
    const current = await this.cache.get(key);
    if (current === token) {
      await this.cache.del(key);
    }
  }

  publish(channel: string, payload: any) {
    return this.publisher.publish(channel, JSON.stringify(payload));
  }

  subscribe(channel: string, handler: (payload: any) => void) {
    this.subscriber.subscribe(channel);
    this.subscriber.on('message', (ch, msg) => {
      if (ch === channel) {
        handler(JSON.parse(msg));
      }
    });
  }
}
