import { db } from '../../db'
import { stacks } from '../../db/schema'
import { eq, and, asc } from 'drizzle-orm'
import { cacheGet, cacheSet, cacheDel } from '../../lib/redis.client'

const CACHE_TTL_ALL = 24 * 60 * 60
const CACHE_TTL_GROUPED = 24 * 60 * 60

interface StackFilters {
  category?: string
  featured?: string
}

export const stacksService = {
  async findAll(filters: StackFilters) {
    const cacheKey = `stacks:all:${JSON.stringify(filters)}`
    const cached = await cacheGet<any[]>(cacheKey)
    if (cached) return cached

    const conditions = []
    if (filters.category) conditions.push(eq(stacks.category, filters.category as any))
    if (filters.featured === 'true') conditions.push(eq(stacks.featured, true))

    const rows = await db
      .select()
      .from(stacks)
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(asc(stacks.category), asc(stacks.sortOrder))

    await cacheSet(cacheKey, rows, CACHE_TTL_ALL)
    return rows
  },

  async findGrouped() {
    const cacheKey = 'stacks:grouped'
    const cached = await cacheGet<Record<string, any[]>>(cacheKey)
    if (cached) return cached

    const all = await db
      .select()
      .from(stacks)
      .orderBy(asc(stacks.sortOrder))

    const grouped: Record<string, any[]> = {}
    for (const stack of all) {
      if (!grouped[stack.category]) grouped[stack.category] = []
      grouped[stack.category].push(stack)
    }

    await cacheSet(cacheKey, grouped, CACHE_TTL_GROUPED)
    return grouped
  },

  async findBySlug(slug: string) {
    const [row] = await db
      .select()
      .from(stacks)
      .where(eq(stacks.slug, slug))
      .limit(1)

    return row || null
  },

  async create(data: any) {
    const [row] = await db.insert(stacks).values(data).returning()
    await cacheDel('stacks:*')
    return row
  },

  async update(id: string, data: any) {
    const [row] = await db
      .update(stacks)
      .set(data)
      .where(eq(stacks.id, id))
      .returning()

    if (row) await cacheDel('stacks:*')
    return row
  },

  async remove(id: string) {
    const [row] = await db
      .delete(stacks)
      .where(eq(stacks.id, id))
      .returning()

    if (row) await cacheDel('stacks:*')
    return row
  },
}
