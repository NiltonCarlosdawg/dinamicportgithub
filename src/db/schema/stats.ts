import { pgTable, uuid, text, integer, timestamp } from 'drizzle-orm/pg-core'

export const githubStats = pgTable('github_stats', {
  id: uuid('id').defaultRandom().primaryKey(),
  username: text('username').unique().notNull(),
  totalRepos: integer('total_repos').default(0).notNull(),
  totalCommits: integer('total_commits').default(0).notNull(),
  totalStars: integer('total_stars').default(0).notNull(),
  totalForks: integer('total_forks').default(0).notNull(),
  followers: integer('followers').default(0).notNull(),
  following: integer('following').default(0).notNull(),
  topLanguages: text('top_languages').default('{}').notNull(),
  contributionMap: text('contribution_map').default('{}').notNull(),
  avatarUrl: text('avatar_url'),
  bio: text('bio'),
  syncedAt: timestamp('synced_at').defaultNow().notNull(),
})
