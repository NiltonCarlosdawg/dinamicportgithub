import { pgTable, uuid, text, integer, boolean, pgEnum } from 'drizzle-orm/pg-core'
import { relations } from 'drizzle-orm'
import { projectsToStacks } from './projects'

export const stackCategoryEnum = pgEnum('stack_category', [
  'frontend',
  'backend',
  'database',
  'devops',
  'mobile',
  'ai_ml',
  'messaging',
  'tools',
])

export const stackLevelEnum = pgEnum('stack_level', [
  'learning',
  'familiar',
  'proficient',
  'advanced',
  'expert',
])

export const stacks = pgTable('stacks', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: text('name').unique().notNull(),
  slug: text('slug').unique().notNull(),
  category: stackCategoryEnum('category').notNull(),
  level: stackLevelEnum('level').notNull(),
  iconUrl: text('icon_url'),
  color: text('color'),
  yearsExp: integer('years_exp').default(0).notNull(),
  featured: boolean('featured').default(false).notNull(),
  sortOrder: integer('sort_order').default(0).notNull(),
})

export const stacksRelations = relations(stacks, ({ many }) => ({
  projectsToStacks: many(projectsToStacks),
}))
