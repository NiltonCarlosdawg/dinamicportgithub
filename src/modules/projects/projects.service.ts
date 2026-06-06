import { db } from '../../db'
import { projects, projectsToStacks } from '../../db/schema'
import { stacks } from '../../db/schema'
import { eq, and, desc, asc, ilike, inArray } from 'drizzle-orm'
import { cacheGet, cacheSet, cacheDel } from '../../lib/redis.client'

const CACHE_TTL = 6 * 60 * 60 // 6 hours

interface ProjectFilters {
  status?: string
  featured?: string
  limit?: string
  offset?: string
}

async function withStacks(projectRows: any[]) {
  if (projectRows.length === 0) return []

  const projectIds = projectRows.map((p) => p.id)
  const joins = await db
    .select()
    .from(projectsToStacks)
    .innerJoin(stacks, eq(projectsToStacks.stackId, stacks.id))
    .where(inArray(projectsToStacks.projectId, projectIds))

  const stackMap: Record<string, any[]> = {}
  for (const row of joins) {
    if (!stackMap[row.projects_to_stacks.projectId]) {
      stackMap[row.projects_to_stacks.projectId] = []
    }
    stackMap[row.projects_to_stacks.projectId].push(row.stacks)
  }

  return projectRows.map((p) => ({
    ...p,
    stacks: stackMap[p.id] || [],
  }))
}

export const projectsService = {
  async findAll(filters: ProjectFilters) {
    const cacheKey = `projects:all:${JSON.stringify(filters)}`
    const cached = await cacheGet<any[]>(cacheKey)
    if (cached) return cached

    const conditions = []
    if (filters.status) conditions.push(eq(projects.status, filters.status as any))
    if (filters.featured === 'true') conditions.push(eq(projects.featured, true))

    const limit = filters.limit ? parseInt(filters.limit) : 20
    const offset = filters.offset ? parseInt(filters.offset) : 0

    const rows = await db
      .select()
      .from(projects)
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(asc(projects.sortOrder), desc(projects.createdAt))
      .limit(limit)
      .offset(offset)

    const result = await withStacks(rows)
    await cacheSet(cacheKey, result, CACHE_TTL)
    return result
  },

  async findFeatured() {
    const cacheKey = 'projects:featured'
    const cached = await cacheGet<any[]>(cacheKey)
    if (cached) return cached

    const rows = await db
      .select()
      .from(projects)
      .where(eq(projects.featured, true))
      .orderBy(asc(projects.sortOrder))

    const result = await withStacks(rows)
    await cacheSet(cacheKey, result, CACHE_TTL)
    return result
  },

  async findInDevelopment() {
    const rows = await db
      .select()
      .from(projects)
      .where(eq(projects.status, 'in_development'))
      .orderBy(asc(projects.sortOrder))

    return withStacks(rows)
  },

  async findBySlug(slug: string) {
    const [row] = await db
      .select()
      .from(projects)
      .where(eq(projects.slug, slug))
      .limit(1)

    if (!row) return null

    const [enriched] = await withStacks([row])
    return enriched
  },

  async create(data: any) {
    const [row] = await db.insert(projects).values(data).returning()
    await cacheDel('projects:*')
    return row
  },

  async update(id: string, data: any) {
    const [row] = await db
      .update(projects)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(projects.id, id))
      .returning()

    if (row) {
      await cacheDel('projects:*')
    }
    return row
  },

  async remove(id: string) {
    const [row] = await db
      .delete(projects)
      .where(eq(projects.id, id))
      .returning()

    if (row) {
      await cacheDel('projects:*')
    }
    return row
  },
}
