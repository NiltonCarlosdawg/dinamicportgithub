import Redis from 'ioredis'
import { env } from '../config/env'

let redis: Redis

export function getRedisClient(): Redis {
  if (!redis) {
    redis = new Redis(env.REDIS_URL, {
      maxRetriesPerRequest: null,
      enableReadyCheck: false,
    })
  }
  return redis
}

export async function cacheGet<T>(key: string): Promise<T | null> {
  try {
    const data = await getRedisClient().get(key)
    return data ? (JSON.parse(data) as T) : null
  } catch {
    return null
  }
}

export async function cacheSet(key: string, value: unknown, ttl: number): Promise<void> {
  await getRedisClient().set(key, JSON.stringify(value), 'EX', ttl)
}

export async function cacheDel(pattern: string): Promise<void> {
  const keys = await getRedisClient().keys(pattern)
  if (keys.length > 0) {
    await getRedisClient().del(...keys)
  }
}
