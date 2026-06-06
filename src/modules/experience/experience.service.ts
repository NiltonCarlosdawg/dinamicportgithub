import { db } from '../../db'
import { experience } from '../../db/schema'
import { eq, asc } from 'drizzle-orm'
import { cacheGet, cacheSet, cacheDel } from '../../lib/redis.client'

const CACHE_TTL = 24 * 60 * 60

export const experienceService = {
  async findAll() {
    const cacheKey = 'experience:all'
    const cached = await cacheGet<any[]>(cacheKey)
    if (cached) return cached

    const rows = await db
      .select()
      .from(experience)
      .orderBy(asc(experience.sortOrder))

    await cacheSet(cacheKey, rows, CACHE_TTL)
    return rows
  },

  async findCurrent() {
    const rows = await db
      .select()
      .from(experience)
      .where(eq(experience.current, true))
      .orderBy(asc(experience.sortOrder))

    return rows
  },

  async findById(id: string) {
    const [row] = await db
      .select()
      .from(experience)
      .where(eq(experience.id, id))
      .limit(1)

    return row || null
  },

  async create(data: any) {
    const [row] = await db.insert(experience).values(data).returning()
    await cacheDel('experience:*')
    return row
  },

  async update(id: string, data: any) {
    const [row] = await db
      .update(experience)
      .set(data)
      .where(eq(experience.id, id))
      .returning()

    if (row) await cacheDel('experience:*')
    return row
  },

  async remove(id: string) {
    const [row] = await db
      .delete(experience)
      .where(eq(experience.id, id))
      .returning()

    if (row) await cacheDel('experience:*')
    return row
  },
}
