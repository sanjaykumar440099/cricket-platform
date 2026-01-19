import { Injectable } from '@nestjs/common';
import { InjectRedis } from '@nestjs-modules/ioredis';
import Redis from 'ioredis';

@Injectable()
export class CacheService {
  constructor(@InjectRedis() private readonly redis: Redis) {}

  async addToSet(key: string, value: string) {
    await this.redis.sadd(key, value);
  }

  async removeFromSet(key: string, value: string) {
    await this.redis.srem(key, value);
  }

  async countSet(key: string): Promise<number> {
    return this.redis.scard(key);
  }

  async setJSON(key: string, value: any) {
    await this.redis.set(key, JSON.stringify(value));
  }

  async getJSON<T>(key: string): Promise<T | null> {
    const data = await this.redis.get(key);
    return data ? JSON.parse(data) : null;
  }

  async del(key: string) {
    await this.redis.del(key);
  }
}
