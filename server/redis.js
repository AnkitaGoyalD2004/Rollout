import dotenv from 'dotenv';
import Redis from 'ioredis';

dotenv.config();

let redis = null;
let isConnected = false;

if (process.env.REDIS_URL) {
  try {
    const isTls = process.env.REDIS_URL.startsWith('rediss://');

    redis = new Redis(process.env.REDIS_URL, {
      tls: isTls ? { rejectUnauthorized: false } : undefined,
      maxRetriesPerRequest: 2,
      retryStrategy(times) {
        const delay = Math.min(times * 100, 3000);
        return delay;
      },
      lazyConnect: false,
    });

    redis.on('connect', () => {
      isConnected = true;
      console.log('⚡ [Redis] Connected successfully to Cloud Redis!');
    });

    redis.on('ready', () => {
      isConnected = true;
    });

    redis.on('error', (err) => {
      isConnected = false;
      console.warn('[Redis] Connection warning:', err.message);
    });

    redis.on('close', () => {
      isConnected = false;
    });
  } catch (err) {
    console.error('[Redis] Failed to initialize Redis client:', err.message);
    redis = null;
  }
} else {
  console.log('[Redis] No REDIS_URL provided. Running without Redis cache.');
}

/**
 * Build a consistent cache key for flag documents
 * e.g. "flag:Threads:development:theme"
 */
export function buildFlagCacheKey(company = 'all', env = 'all', key) {
  return `flag:${company.trim().toLowerCase()}:${env.trim().toLowerCase()}:${key.trim().toLowerCase()}`;
}

/**
 * Get a cached flag document from Redis
 */
export async function getFlagFromCache(company, env, key) {
  if (!redis || !isConnected) return null;
  try {
    const cacheKey = buildFlagCacheKey(company, env, key);
    const data = await redis.get(cacheKey);
    if (!data) return null;
    return JSON.parse(data);
  } catch (err) {
    console.warn(`[Redis] Cache GET error for ${key}:`, err.message);
    return null; // Gracefully fall back to MongoDB on error
  }
}

/**
 * Store a flag document in Redis with TTL (default: 300 seconds / 5 mins)
 */
export async function setFlagInCache(company, env, key, flagData, ttlSeconds = 300) {
  if (!redis || !isConnected) return;
  try {
    const cacheKey = buildFlagCacheKey(company, env, key);
    await redis.set(cacheKey, JSON.stringify(flagData), 'EX', ttlSeconds);
  } catch (err) {
    console.warn(` [Redis] Cache SET error for ${key}:`, err.message);
  }
}

/**
 * Invalidate cached flag entries when a flag is created, toggled, updated, or deleted
 */
export async function invalidateFlagCache(company, key) {
  if (!redis || !isConnected) return;
  try {
    const safeCompany = (company || '').trim().toLowerCase();
    const safeKey = (key || '').trim().toLowerCase();

    // Look for all environment variants for this flag
    const pattern = `flag:${safeCompany || '*'}:*:${safeKey}`;
    const keys = await redis.keys(pattern);

    if (keys.length > 0) {
      await redis.del(...keys);
      console.log(`[Redis] Invalidated ${keys.length} cache key(s) for "${key}"`);
    }
  } catch (err) {
    console.warn(`[Redis] Cache invalidation error for ${key}:`, err.message);
  }
}

export function isRedisReady() {
  return isConnected;
}

export default redis;
