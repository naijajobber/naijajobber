import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(RedisService.name);
  private client: Redis | null = null;
  private readonly memory = new Map<
    string,
    { value: string; expiresAt?: number }
  >();
  private useMemory = false;

  constructor(private readonly config: ConfigService) {}

  async onModuleInit(): Promise<void> {
    try {
      this.client = new Redis({
        host: this.config.get<string>('redis.host'),
        port: this.config.get<number>('redis.port'),
        password: this.config.get<string>('redis.password') || undefined,
        maxRetriesPerRequest: 1,
        connectTimeout: 3000,
        lazyConnect: true,
        retryStrategy: () => null,
      });

      await this.client.connect();
      await this.client.ping();
      this.logger.log('Redis connected');
    } catch (error) {
      this.useMemory = true;
      this.logger.warn(
        `Redis unavailable; using in-memory store (${(error as Error).message})`,
      );
      if (this.client) {
        this.client.disconnect();
        this.client = null;
      }
    }
  }

  async onModuleDestroy(): Promise<void> {
    if (this.client) {
      await this.client.quit();
    }
  }

  async set(key: string, value: string, ttlSeconds?: number): Promise<void> {
    if (this.useMemory || !this.client) {
      this.memory.set(key, {
        value,
        expiresAt: ttlSeconds ? Date.now() + ttlSeconds * 1000 : undefined,
      });
      return;
    }
    if (ttlSeconds) {
      await this.client.set(key, value, 'EX', ttlSeconds);
      return;
    }
    await this.client.set(key, value);
  }

  async get(key: string): Promise<string | null> {
    if (this.useMemory || !this.client) {
      const entry = this.memory.get(key);
      if (!entry) return null;
      if (entry.expiresAt && entry.expiresAt < Date.now()) {
        this.memory.delete(key);
        return null;
      }
      return entry.value;
    }
    return this.client.get(key);
  }

  async del(key: string): Promise<void> {
    if (this.useMemory || !this.client) {
      this.memory.delete(key);
      return;
    }
    await this.client.del(key);
  }

  async incr(key: string, ttlSeconds?: number): Promise<number> {
    if (this.useMemory || !this.client) {
      const entry = this.memory.get(key);
      const next = entry ? parseInt(entry.value, 10) + 1 : 1;
      this.memory.set(key, {
        value: String(next),
        expiresAt:
          entry?.expiresAt ||
          (ttlSeconds ? Date.now() + ttlSeconds * 1000 : undefined),
      });
      return next;
    }
    const next = await this.client.incr(key);
    if (ttlSeconds && next === 1) {
      await this.client.expire(key, ttlSeconds);
    }
    return next;
  }

  async ping(): Promise<string> {
    if (this.useMemory || !this.client) {
      return 'PONG';
    }
    return this.client.ping();
  }
}
