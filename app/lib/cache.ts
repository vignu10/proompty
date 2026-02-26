/**
 * No-Op Cache Service
 *
 * Cache operations are disabled. All methods return without doing anything.
 */

class CacheService {
  /**
   * Get a value from cache (always returns null)
   */
  async get<T>(_key: string): Promise<T | null> {
    return null;
  }

  /**
   * Set a value in cache (no-op)
   */
  async set(_key: string, _value: unknown, _ttl?: number): Promise<void> {
    // No-op
  }

  /**
   * Delete a specific key from cache (no-op)
   */
  async del(_key: string): Promise<void> {
    // No-op
  }

  /**
   * Delete all keys matching a pattern (no-op)
   */
  async delPattern(_pattern: string): Promise<void> {
    // No-op
  }

  /**
   * Invalidate all prompt-related caches (no-op)
   */
  async invalidatePrompts(_userId?: string): Promise<void> {
    // No-op
  }

  /**
   * Invalidate a specific prompt's cache (no-op)
   */
  async invalidatePrompt(_id: string, _userId?: string): Promise<void> {
    // No-op
  }

  /**
   * Check if cache is healthy (always true for no-op)
   */
  async ping(): Promise<boolean> {
    return true;
  }

  /**
   * Close the cache connection (no-op)
   */
  async quit(): Promise<void> {
    // No-op
  }

  /**
   * Get the cache client (always null)
   */
  getClient(): null {
    return null;
  }

  /**
   * Execute a Lua script (no-op)
   */
  async eval(): Promise<unknown> {
    return null;
  }

  /**
   * Increment a counter (returns 0)
   */
  async incr(): Promise<number> {
    return 0;
  }

  /**
   * Set expiration on a key (no-op)
   */
  async expire(): Promise<void> {
    // No-op
  }

  /**
   * Get multiple keys at once
   */
  async mget<T>(_keys: string[]): Promise<(T | null)[]> {
    return [];
  }

  /**
   * Set multiple keys at once (no-op)
   */
  async mset(): Promise<void> {
    // No-op
  }

  /**
   * Hash helpers for rate limiter
   */
  async hget(): Promise<string | null> {
    return null;
  }

  async hset(): Promise<void> {
    // No-op
  }

  async hgetall(): Promise<Record<string, string> | null> {
    return null;
  }

  async hdel(): Promise<void> {
    // No-op
  }
}

export const cache = new CacheService();
