import { pgTable, uuid, text, boolean } from 'drizzle-orm/pg-core'

export const experience = pgTable('experience', {
  id: uuid('id').defaultRandom().primaryKey(),
  company: text('company').notNull(),
  role: text('role').notNull(),
  description: text('description').notNull(),
  startDate: text('start_date').notNull(),
  endDate: text('end_date'),
  current: boolean('current').default(false).notNull(),
  companyUrl: text('company_url'),
  location: text('location').default('Luanda, Angola').notNull(),
  stack: text('stack').array().default([]).notNull(),
  sortOrder: text('sort_order').default('0').notNull(),
})
