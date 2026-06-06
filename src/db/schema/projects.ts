import { pgTable, uuid, text, boolean, timestamp, pgEnum, primaryKey } from 'drizzle-orm/pg-core'
import { relations } from 'drizzle-orm'
import { stacks } from './stacks'

export const projectStatusEnum = pgEnum('project_status', [
  'in_development',
  'completed',
  'paused',
  'archived',
])

export const projects = pgTable('projects', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: text('name').notNull(),
  slug: text('slug').unique().notNull(),
  description: text('description').notNull(),
  longDesc: text('long_desc'),
  status: projectStatusEnum('status').default('in_development').notNull(),
  githubUrl: text('github_url'),
  liveUrl: text('live_url'),
  imageUrl: text('image_url'),
  featured: boolean('featured').default(false).notNull(),
  stars: text('stars').default('0').notNull(),
  forks: text('forks').default('0').notNull(),
  language: text('language'),
  topics: text('topics').array().default([]).notNull(),
  sortOrder: text('sort_order').default('0').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

export const projectsRelations = relations(projects, ({ many }) => ({
  projectsToStacks: many(projectsToStacks),
}))

export const projectsToStacks = pgTable('projects_to_stacks', {
  projectId: uuid('project_id')
    .notNull()
    .references(() => projects.id, { onDelete: 'cascade' }),
  stackId: uuid('stack_id')
    .notNull()
    .references(() => stacks.id, { onDelete: 'cascade' }),
}, (t) => ({
  pk: primaryKey({ columns: [t.projectId, t.stackId] }),
}))

export const projectsToStacksRelations = relations(projectsToStacks, ({ one }) => ({
  project: one(projects, {
    fields: [projectsToStacks.projectId],
    references: [projects.id],
  }),
  stack: one(stacks, {
    fields: [projectsToStacks.stackId],
    references: [stacks.id],
  }),
}))
