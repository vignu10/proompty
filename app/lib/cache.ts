/**
 * Redis Cache Service
 *
 * Provides caching layer with automatic TTL support and pattern-based invalidation.
 */

import Redis from 'ioredis';
import { env } from './env';
import { logger } from './logger';
import { CacheError } from './errors';

class CacheService {
  private client: Redis | null = null;
  private enabled: boolean;

  constructor() {
    this.enabled = env.CACHE_ENABLED;
    if (this.enabled) {
      this.client = new Redis(env.REDIS_URL, {
        retryStrategy: (times) => Math.min(times * 50, 2000),
        maxRetriesPerRequest: 3,
        enableReadyCheck: true,
      });
      this.client.on('error', (err) => logger.error('Redis error', { error: err.message }));
      this.client.on('connect', () => logger.info('Redis connected'));
      this.client.on('ready', () => logger.info('Redis ready'));
      this.client.on('close', () => logger.warn('Redis connection closed'));
    }
  }

  /**
   * Get a value from cache
   */
  async get<T>(key: string): Promise<T | null> {
    if (!this.enabled || !this.client) return null;
    try {
      const value = await this.client.get(key);
      return value ? JSON.parse(value) : null;
    } catch (error) {
      logger.warn('Cache get failed', { key, error });
      return null;
    }
  }

  /**
   * Set a value in cache with optional TTL
   */
  async set(key: string, value: unknown, ttl?: number): Promise<void> {
    if (!this.enabled || !this.client) return;
    try {
      const serialized = JSON.stringify(value);
      if (ttl) {
        await this.client.setex(key, ttl, serialized);
      } else {
        await this.client.set(key, serialized);
      }
    } catch (error) {
      logger.warn('Cache set failed', { key, error });
    }
  }

  /**
   * Delete a specific key from cache
   */
  async del(key: string): Promise<void> {
    if (!this.enabled || !this.client) return;
    try {
      await this.client.del(key);
    } catch (error) {
      logger.warn('Cache delete failed', { key, error });
    }
  }

  /**
   * Delete all keys matching a pattern
   */
  async delPattern(pattern: string): Promise<void> {
    if (!this.enabled || !this.client) return;
    try {
      const keys = await this.client.keys(pattern);
      if (keys.length > 0) {
        await this.client.del(...keys);
      }
    } catch (error) {
      logger.warn('Cache pattern delete failed', { pattern, error });
    }
  }

  /**
   * Invalidate all prompt-related caches
   */
  async invalidatePrompts(userId?: string): Promise<void> {
    await this.delPattern('prompts:list:*');
    await this.delPattern('prompts:byUser:*');
    await this.delPattern('search:*');
    if (userId) {
      await this.delPattern(`prompts:user:${userId}:*`);
    }
  }

  /**
   * Invalidate a specific prompt's cache
   */
  async invalidatePrompt(id: string, userId?: string): Promise<void> {
    await this.del(`prompt:${id}`);
    await this.invalidatePrompts(userId);
  }

  /**
   * Check if Redis is connected and ready
   */
  async ping(): Promise<boolean> {
    if (!this.enabled || !this.client) return false;
    try {
      const result = await this.client.ping();
      return result === 'PONG';
    } catch {
      return false;
    }
  }

  /**
   * Close the Redis connection
   */
  async quit(): Promise<void> {
    if (this.client) {
      await this.client.quit();
      this.client = null;
    }
  }

  /**
   * Get the Redis client for advanced usage
   */
  getClient(): Redis | null {
    return this.client;
  }

  /**
   * Execute a Lua script atomically
   */
  async eval(script: string, numKeys: number, ...args: (string | number)[]): Promise<unknown> {
    if (!this.enabled || !this.client) {
      throw new CacheError('Cache is not enabled');
    }
    try {
      return await this.client.eval(script, numKeys, ...args);
    } catch (error) {
      logger.warn('Cache eval failed', { error });
      throw new CacheError('Cache operation failed');
    }
  }

  /**
   * Increment a counter atomically
   */
  async incr(key: string): Promise<number> {
    if (!this.enabled || !this.client) {
      throw new CacheError('Cache is not enabled');
    }
    return await this.client.incr(key);
  }

  /**
   * Set expiration on a key
   */
  async expire(key: string, seconds: number): Promise<void> {
    if (!this.enabled || !this.client) return;
    try {
      await this.client.expire(key, seconds);
    } catch (error) {
      logger.warn('Cache expire failed', { key, error });
    }
  }

  /**
   * Get multiple keys at once
   */
  async mget<T>(keys: string[]): Promise<(T | null)[]> {
    if (!this.enabled || !this.client || keys.length === 0) return keys.map(() => null);
    try {
      const values = await this.client.mget(...keys);
      return values.map((v) => (v ? JSON.parse(v) : null));
    } catch (error) {
      logger.warn('Cache mget failed', { keys, error });
      return keys.map(() => null);
    }
  }

  /**
   * Set multiple keys at once
   */
  async mset(keyValuePairs: Record<string, unknown>): Promise<void> {
    if (!this.enabled || !this.client || Object.keys(keyValuePairs).length === 0) return;
    try {
      const pipeline = this.client.pipeline();
      for (const [key, value] of Object.entries(keyValuePairs)) {
        pipeline.set(key, JSON.stringify(value));
      }
      await pipeline.exec();
    } catch (error) {
      logger.warn('Cache mset failed', { error });
    }
  }

  /**
   * Hash helpers for rate limiter
   */
  async hget(key: string, field: string): Promise<string | null> {
    if (!this.enabled || !this.client) return null;
    try {
      return await this.client.hget(key, field);
    } catch (error) {
      logger.warn('Cache hget failed', { key, field, error });
      return null;
    }
  }

  async hset(key: string, field: string, value: string | number): Promise<void> {
    if (!this.enabled || !this.client) return;
    try {
      await this.client.hset(key, field, value);
    } catch (error) {
      logger.warn('Cache hset failed', { key, field, error });
    }
  }

  async hgetall(key: string): Promise<Record<string, string> | null> {
    if (!this.enabled || !this.client) return null;
    try {
      return await this.client.hgetall(key);
    } catch (error) {
      logger.warn('Cache hgetall failed', { key, error });
      return null;
    }
  }

  async hdel(key: string, field: string): Promise<void> {
    if (!this.enabled || !this.client) return;
    try {
      await this.client.hdel(key, field);
    } catch (error) {
      logger.warn('Cache hdel failed', { key, field, error });
    }
  }
}

export const cache = new CacheService();

/**
 * Create a consistent hash from query parameters for cache keys
 */
export function hashQuery(params: Record<string, unknown>): string {
  const str = JSON.stringify(params);
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash).toString(36);
}
