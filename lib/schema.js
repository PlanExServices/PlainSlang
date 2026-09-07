// Drizzle ORM schema (PostgreSQL) — reference mapping of the tables created in
// lib/db.js. Kept in sync manually; db.js DDL is the source of truth.
import { pgTable, serial, text, integer } from 'drizzle-orm/pg-core';

export const terms = pgTable('terms', {
  id: serial('id').primaryKey(),
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
  isWoty: integer('is_woty').default(0),
  trending: integer('trending').default(0),
  trendingEvidence: text('trending_evidence'), // JSON {headline, link?, feed}
  isSeed: integer('is_seed').default(0),
  category: text('category').notNull().default('teen'),
  related: text('related').notNull().default('[]'), // JSON array of extra categories
  createdAt: text('created_at'),
  updatedAt: text('updated_at'),
});

export const meta = pgTable('meta', {
  key: text('key').primaryKey(),
  value: text('value'),
});
