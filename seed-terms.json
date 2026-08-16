import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';

export const terms = sqliteTable('terms', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  term: text('term').notNull(),
  emoji: text('emoji').default(''),
  definition: text('definition').notNull(),
  example: text('example'),
  notes: text('notes'),
  ageGroup: text('age_group').notNull(),
  difficulty: text('difficulty').notNull().default('medium'),
  say: text('say'),
  sourceName: text('source_name'),
  sourceUrl: text('source_url'),
  tags: text('tags').default('[]'), // JSON array
  isWoty: integer('is_woty', { mode: 'boolean' }).default(false),
  trending: integer('trending', { mode: 'boolean' }).default(false),
  trendingEvidence: text('trending_evidence'), // headline that matched
  isSeed: integer('is_seed', { mode: 'boolean' }).default(false),
  category: text('category').notNull().default('teen'),
  related: text('related').notNull().default('[]'), // JSON array of extra categories
  createdAt: text('created_at'),
  updatedAt: text('updated_at'),
});

export const meta = sqliteTable('meta', {
  key: text('key').primaryKey(),
  value: text('value'),
});
