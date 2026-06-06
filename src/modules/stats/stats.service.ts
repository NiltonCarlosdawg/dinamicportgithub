import { db } from '../../db'
import { githubStats } from '../../db/schema'
import { eq } from 'drizzle-orm'
import { cacheGet, cacheSet, cacheDel } from '../../lib/redis.client'
import { getUserStats } from '../../lib/github.client'
import { env } from '../../config/env'

const CACHE_TTL_STATS = 60 * 60 // 1 hour
const CACHE_TTL_LANGUAGES = 6 * 60 * 60 // 6 hours

function parseJsonField(raw: string | null): any {
  if (!raw) return {}
  try {
    return JSON.parse(raw)
  } catch {
    return {}
  }
}

export const statsService = {
  async getStats() {
    const cacheKey = 'stats:github'
    const cached = await cacheGet<any>(cacheKey)
    if (cached) return cached

    const [row] = await db
      .select()
      .from(githubStats)
      .where(eq(githubStats.username, env.GITHUB_USER))
      .limit(1)

    if (!row) {
      return {
        username: env.GITHUB_USER,
        totalRepos: 0,
        totalCommits: 0,
        totalStars: 0,
        totalForks: 0,
        followers: 0,
        following: 0,
        topLanguages: {},
        avatarUrl: null,
        bio: null,
        syncedAt: null,
      }
    }

    const result = {
      ...row,
      topLanguages: parseJsonField(row.topLanguages),
      contributionMap: parseJsonField(row.contributionMap),
    }

    await cacheSet(cacheKey, result, CACHE_TTL_STATS)
    return result
  },

  async getLanguages() {
    const cacheKey = 'stats:languages'
    const cached = await cacheGet<any>(cacheKey)
    if (cached) return cached

    const [row] = await db
      .select()
      .from(githubStats)
      .where(eq(githubStats.username, env.GITHUB_USER))
      .limit(1)

    const languages = row ? parseJsonField(row.topLanguages) : {}
    await cacheSet(cacheKey, languages, CACHE_TTL_LANGUAGES)
    return languages
  },

  async getContributions(weeks: number = 52) {
    const [row] = await db
      .select()
      .from(githubStats)
      .where(eq(githubStats.username, env.GITHUB_USER))
      .limit(1)

    const map = row ? parseJsonField(row.contributionMap) : {}
    return map
  },

  async sync() {
    const data = await getUserStats()

    const existing = await db
      .select()
      .from(githubStats)
      .where(eq(githubStats.username, data.username))
      .limit(1)

    const payload = {
      ...data,
      topLanguages: JSON.stringify(data.topLanguages),
      syncedAt: new Date(),
    }

    if (existing.length > 0) {
      await db
        .update(githubStats)
        .set(payload)
        .where(eq(githubStats.id, existing[0].id))
    } else {
      await db.insert(githubStats).values(payload)
    }

    await cacheDel('stats:*')

    const [updated] = await db
      .select()
      .from(githubStats)
      .where(eq(githubStats.username, env.GITHUB_USER))
      .limit(1)

    return {
      ...updated,
      topLanguages: parseJsonField(updated?.topLanguages),
      contributionMap: parseJsonField(updated?.contributionMap),
    }
  },
}
