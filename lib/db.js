import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import { sql } from 'drizzle-orm';
import fs from 'fs';
import path from 'path';
import * as schema from './schema';
import seedTerms from './seed-terms.json';
import { PACK_TERMS } from './packs';
import { PACK_TERMS_V2 } from './packs-v2';
import { PACK_TERMS_V3, CROSS_LINKS } from './packs-v3';
import { PACK_TERMS_V4 } from './packs-v4';
import { PACK_TERMS_V5 } from './packs-v5';
import { PACK_TERMS_V6 } from './packs-v6';

const DB_PATH =
  process.env.PLAINSLANG_DB_PATH ||
  process.env.GENA_DB_PATH || // legacy env var still honored
  path.join(process.cwd(), 'data', 'plainslang.db');

let _db = null;

function init() {
  fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });
  const sqlite = new Database(DB_PATH);
  sqlite.pragma('journal_mode = WAL');
  const db = drizzle(sqlite, { schema });

  sqlite.exec(`
    CREATE TABLE IF NOT EXISTS terms (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      term TEXT NOT NULL,
      emoji TEXT DEFAULT '',
      definition TEXT NOT NULL,
      example TEXT,
      notes TEXT,
      age_group TEXT NOT NULL,
      difficulty TEXT NOT NULL DEFAULT 'medium',
      say TEXT,
      source_name TEXT,
      source_url TEXT,
      tags TEXT DEFAULT '[]',
      is_woty INTEGER DEFAULT 0,
      trending INTEGER DEFAULT 0,
      trending_evidence TEXT,
      is_seed INTEGER DEFAULT 0,
      created_at TEXT,
      updated_at TEXT
    );
    CREATE TABLE IF NOT EXISTS meta (
      key TEXT PRIMARY KEY,
      value TEXT
    );
  `);

  // Migration: add category column (existing rows = teen slang)
  const cols = sqlite.prepare(`PRAGMA table_info(terms)`).all().map((c) => c.name);
  if (!cols.includes('category')) {
    sqlite.exec(`ALTER TABLE terms ADD COLUMN category TEXT NOT NULL DEFAULT 'teen'`);
  }
  if (!cols.includes('related')) {
    sqlite.exec(`ALTER TABLE terms ADD COLUMN related TEXT NOT NULL DEFAULT '[]'`);
  }

  // Seed once
  const count = sqlite.prepare('SELECT COUNT(*) AS c FROM terms WHERE is_seed = 1').get().c;
  if (count === 0) {
    const now = new Date().toISOString();
    const insert = sqlite.prepare(`
      INSERT INTO terms (term, emoji, definition, example, notes, age_group, difficulty, say,
        source_name, source_url, tags, is_woty, trending, is_seed, created_at, updated_at)
      VALUES (@term, @emoji, @definition, @example, @notes, @ageGroup, @difficulty, @say,
        @sourceName, @sourceUrl, @tags, @isWoty, @trending, 1, @now, @now)
    `);
    const tx = sqlite.transaction((rows) => {
      for (const r of rows) {
        insert.run({
          term: r.term,
          emoji: r.emoji || '',
          definition: r.definition,
          example: r.example,
          notes: r.notes,
          ageGroup: r.ageGroup || 'high_school',
          difficulty: r.difficulty || 'medium',
          say: r.say,
          sourceName: r.sourceName,
          sourceUrl: r.sourceUrl,
          tags: JSON.stringify(r.tags || []),
          isWoty: r.isWoty ? 1 : 0,
          trending: r.isWoty ? 1 : 0, // WOTY terms start trending per README rule 4
          now,
        });
      }
    });
    tx(seedTerms);
    if (seedTerms.some((t) => t.isWoty)) {
      sqlite
        .prepare(`INSERT OR REPLACE INTO meta (key, value) VALUES ('trending_note', ?)`)
        .run('Initial seed: official Words of the Year marked trending.');
    }
  }

  // Seed jargon packs once (coding / texting / gaming / corporate)
  const packCount = sqlite
    .prepare(`SELECT COUNT(*) AS c FROM terms WHERE is_seed = 1 AND category != 'teen'`)
    .get().c;
  if (packCount === 0) {
    const now = new Date().toISOString();
    const insertPack = sqlite.prepare(`
      INSERT INTO terms (term, emoji, definition, example, notes, age_group, difficulty, say,
        source_name, source_url, tags, is_woty, trending, is_seed, category, created_at, updated_at)
      VALUES (@term, @emoji, @definition, @example, NULL, @ageGroup, @difficulty, NULL,
        @sourceName, @sourceUrl, @tags, 0, 0, 1, @category, @now, @now)
    `);
    const txPacks = sqlite.transaction((rows) => {
      for (const r of rows) {
        insertPack.run({
          term: r.term,
          emoji: r.emoji || '',
          definition: r.definition,
          example: r.example || null,
          ageGroup: 'gen_z', // packs aren't age-graded; column requires a value
          difficulty: r.difficulty || 'medium',
          sourceName: r.sourceName || null,
          sourceUrl: r.sourceUrl || null,
          tags: JSON.stringify(r.tags || []),
          category: r.category,
          now,
        });
      }
    });
    txPacks(PACK_TERMS);
  }

  // Pack expansion v2 (more texting/gaming/coding) — seeded once, guarded by a meta flag.
  const v2Done = sqlite.prepare(`SELECT value FROM meta WHERE key = 'packs_v2_seeded'`).get();
  if (!v2Done) {
    const now = new Date().toISOString();
    const insertV2 = sqlite.prepare(`
      INSERT INTO terms (term, emoji, definition, example, notes, age_group, difficulty, say,
        source_name, source_url, tags, is_woty, trending, is_seed, category, created_at, updated_at)
      VALUES (@term, @emoji, @definition, @example, NULL, @ageGroup, @difficulty, NULL,
        @sourceName, @sourceUrl, @tags, 0, 0, 1, @category, @now, @now)
    `);
    const dupCheck = sqlite.prepare(
      `SELECT COUNT(*) AS c FROM terms WHERE LOWER(term) = LOWER(?) AND category = ?`
    );
    const txV2 = sqlite.transaction((rows) => {
      for (const r of rows) {
        if (dupCheck.get(r.term, r.category).c > 0) continue; // never double-insert
        insertV2.run({
          term: r.term,
          emoji: r.emoji || '',
          definition: r.definition,
          example: r.example || null,
          ageGroup: 'gen_z',
          difficulty: r.difficulty || 'medium',
          sourceName: r.sourceName || null,
          sourceUrl: r.sourceUrl || null,
          tags: JSON.stringify(r.tags || []),
          category: r.category,
          now,
        });
      }
      sqlite.prepare(`INSERT OR REPLACE INTO meta (key, value) VALUES ('packs_v2_seeded', ?)`).run(now);
    });
    txV2(PACK_TERMS_V2);
  }

  // Pack expansion v3: new terms with cross-category links + retro cross-links.
  const v3Done = sqlite.prepare(`SELECT value FROM meta WHERE key = 'packs_v3_seeded'`).get();
  if (!v3Done) {
    const now = new Date().toISOString();
    const insertV3 = sqlite.prepare(`
      INSERT INTO terms (term, emoji, definition, example, notes, age_group, difficulty, say,
        source_name, source_url, tags, is_woty, trending, is_seed, category, related, created_at, updated_at)
      VALUES (@term, @emoji, @definition, @example, NULL, @ageGroup, @difficulty, NULL,
        @sourceName, @sourceUrl, @tags, 0, 0, 1, @category, @related, @now, @now)
    `);
    const dupCheck = sqlite.prepare(`SELECT COUNT(*) AS c FROM terms WHERE LOWER(term) = LOWER(?)`);
    const txV3 = sqlite.transaction(() => {
      for (const r of PACK_TERMS_V3) {
        if (dupCheck.get(r.term).c > 0) continue;
        insertV3.run({
          term: r.term,
          emoji: r.emoji || '',
          definition: r.definition,
          example: r.example || null,
          ageGroup: 'gen_z',
          difficulty: r.difficulty || 'medium',
          sourceName: r.sourceName || null,
          sourceUrl: r.sourceUrl || null,
          tags: JSON.stringify(r.tags || []),
          category: r.category,
          related: JSON.stringify(r.related || []),
          now,
        });
      }
      // Retro cross-links for existing terms (merge, don't overwrite)
      const setRelated = sqlite.prepare('UPDATE terms SET related = ? WHERE id = ?');
      const findTerm = sqlite.prepare('SELECT id, category, related FROM terms WHERE LOWER(term) = LOWER(?)');
      for (const [term, cats] of Object.entries(CROSS_LINKS)) {
        const row = findTerm.get(term);
        if (!row) continue;
        let existing = [];
        try { existing = JSON.parse(row.related || '[]'); } catch { /* keep [] */ }
        const merged = [...new Set([...existing, ...cats])].filter((c) => c !== row.category);
        setRelated.run(JSON.stringify(merged), row.id);
      }
      sqlite.prepare(`INSERT OR REPLACE INTO meta (key, value) VALUES ('packs_v3_seeded', ?)`).run(now);
    });
    txV3();
  }

  // Cleanup: collapse pre-cross-link duplicates (same term seeded into two packs
  // by v1). Keep the teen row (richer parent-guide source), merge the other
  // pack into its `related` links, delete the duplicate. Custom (user) rows are
  // never touched.
  const dedupeDone = sqlite.prepare(`SELECT value FROM meta WHERE key = 'xlink_dedupe_done'`).get();
  if (!dedupeDone) {
    const txDedupe = sqlite.transaction(() => {
      const dupes = sqlite
        .prepare(
          `SELECT LOWER(term) AS t FROM terms WHERE is_seed = 1 GROUP BY LOWER(term) HAVING COUNT(*) > 1`
        )
        .all();
      for (const { t } of dupes) {
        const rows = sqlite
          .prepare(`SELECT id, category, related FROM terms WHERE LOWER(term) = ? AND is_seed = 1 ORDER BY id`)
          .all(t);
        if (rows.length < 2) continue;
        const keeper = rows.find((r) => r.category === 'teen') || rows[0];
        const extras = rows.filter((r) => r.id !== keeper.id);
        let related = [];
        try { related = JSON.parse(keeper.related || '[]'); } catch { /* keep [] */ }
        for (const e of extras) {
          if (e.category !== keeper.category) related.push(e.category);
          try { for (const c of JSON.parse(e.related || '[]')) related.push(c); } catch { /* skip */ }
          sqlite.prepare('DELETE FROM terms WHERE id = ?').run(e.id);
        }
        related = [...new Set(related)].filter((c) => c !== keeper.category);
        sqlite.prepare('UPDATE terms SET related = ? WHERE id = ?').run(JSON.stringify(related), keeper.id);
      }
      sqlite
        .prepare(`INSERT OR REPLACE INTO meta (key, value) VALUES ('xlink_dedupe_done', ?)`)
        .run(new Date().toISOString());
    });
    txDedupe();
  }

  // Pack expansion v4 — exhaustive-library round two (all packs + teen).
  const v4Done = sqlite.prepare(`SELECT value FROM meta WHERE key = 'packs_v4_seeded'`).get();
  if (!v4Done) {
    const now = new Date().toISOString();
    const insertV4 = sqlite.prepare(`
      INSERT INTO terms (term, emoji, definition, example, notes, age_group, difficulty, say,
        source_name, source_url, tags, is_woty, trending, is_seed, category, related, created_at, updated_at)
      VALUES (@term, @emoji, @definition, @example, NULL, @ageGroup, @difficulty, @say,
        @sourceName, @sourceUrl, @tags, 0, 0, 1, @category, @related, @now, @now)
    `);
    const dupCheck = sqlite.prepare(`SELECT COUNT(*) AS c FROM terms WHERE LOWER(term) = LOWER(?)`);
    const txV4 = sqlite.transaction(() => {
      for (const r of PACK_TERMS_V4) {
        if (dupCheck.get(r.term).c > 0) continue;
        insertV4.run({
          term: r.term,
          emoji: r.emoji || '',
          definition: r.definition,
          example: r.example || null,
          ageGroup: r.ageGroup || 'gen_z',
          difficulty: r.difficulty || 'medium',
          say: r.say || null,
          sourceName: r.sourceName || null,
          sourceUrl: r.sourceUrl || null,
          tags: JSON.stringify(r.tags || []),
          category: r.category,
          related: JSON.stringify(r.related || []),
          now,
        });
      }
      sqlite.prepare(`INSERT OR REPLACE INTO meta (key, value) VALUES ('packs_v4_seeded', ?)`).run(now);
    });
    txV4();
  }

  // Pack expansion v5 — Bark import + safety pack + emoji codes.
  const v5Done = sqlite.prepare(`SELECT value FROM meta WHERE key = 'packs_v5_seeded'`).get();
  if (!v5Done) {
    const now = new Date().toISOString();
    const insertV5 = sqlite.prepare(`
      INSERT INTO terms (term, emoji, definition, example, notes, age_group, difficulty, say,
        source_name, source_url, tags, is_woty, trending, is_seed, category, related, created_at, updated_at)
      VALUES (@term, @emoji, @definition, @example, NULL, @ageGroup, @difficulty, @say,
        @sourceName, @sourceUrl, @tags, 0, 0, 1, @category, @related, @now, @now)
    `);
    const dupCheck = sqlite.prepare(`SELECT COUNT(*) AS c FROM terms WHERE LOWER(term) = LOWER(?)`);
    const txV5 = sqlite.transaction(() => {
      for (const r of PACK_TERMS_V5) {
        if (dupCheck.get(r.term).c > 0) {
          // Term already exists in another pack: cross-link it there instead.
          const existing = sqlite
            .prepare('SELECT id, category, related FROM terms WHERE LOWER(term) = LOWER(?)')
            .get(r.term);
          if (existing && existing.category !== r.category) {
            let rel = [];
            try { rel = JSON.parse(existing.related || '[]'); } catch { /* keep [] */ }
            rel = [...new Set([...rel, r.category])].filter((c) => c !== existing.category);
            sqlite.prepare('UPDATE terms SET related = ? WHERE id = ?').run(JSON.stringify(rel), existing.id);
          }
          continue;
        }
        insertV5.run({
          term: r.term,
          emoji: r.emoji || '',
          definition: r.definition,
          example: r.example || null,
          ageGroup: r.ageGroup || 'gen_z',
          difficulty: r.difficulty || 'medium',
          say: r.say || null,
          sourceName: r.sourceName || null,
          sourceUrl: r.sourceUrl || null,
          tags: JSON.stringify(r.tags || []),
          category: r.category,
          related: JSON.stringify(r.related || []),
          now,
        });
      }
      sqlite.prepare(`INSERT OR REPLACE INTO meta (key, value) VALUES ('packs_v5_seeded', ?)`).run(now);
    });
    txV5();
  }

  // Pack expansion v6 — Axis cross-reference import (same collision-to-crosslink logic).
  const v6Done = sqlite.prepare(`SELECT value FROM meta WHERE key = 'packs_v6_seeded'`).get();
  if (!v6Done) {
    const now = new Date().toISOString();
    const insertV6 = sqlite.prepare(`
      INSERT INTO terms (term, emoji, definition, example, notes, age_group, difficulty, say,
        source_name, source_url, tags, is_woty, trending, is_seed, category, related, created_at, updated_at)
      VALUES (@term, @emoji, @definition, @example, NULL, @ageGroup, @difficulty, @say,
        @sourceName, @sourceUrl, @tags, 0, 0, 1, @category, @related, @now, @now)
    `);
    const dupCheckV6 = sqlite.prepare(`SELECT COUNT(*) AS c FROM terms WHERE LOWER(term) = LOWER(?)`);
    const txV6 = sqlite.transaction(() => {
      for (const r of PACK_TERMS_V6) {
        if (dupCheckV6.get(r.term).c > 0) {
          const existing = sqlite
            .prepare('SELECT id, category, related FROM terms WHERE LOWER(term) = LOWER(?)')
            .get(r.term);
          if (existing && existing.category !== r.category) {
            let rel = [];
            try { rel = JSON.parse(existing.related || '[]'); } catch { /* keep [] */ }
            rel = [...new Set([...rel, r.category])].filter((c) => c !== existing.category);
            sqlite.prepare('UPDATE terms SET related = ? WHERE id = ?').run(JSON.stringify(rel), existing.id);
          }
          continue;
        }
        insertV6.run({
          term: r.term,
          emoji: r.emoji || '',
          definition: r.definition,
          example: r.example || null,
          ageGroup: r.ageGroup || 'gen_z',
          difficulty: r.difficulty || 'medium',
          say: r.say || null,
          sourceName: r.sourceName || null,
          sourceUrl: r.sourceUrl || null,
          tags: JSON.stringify(r.tags || []),
          category: r.category,
          related: JSON.stringify(r.related || []),
          now,
        });
      }
      sqlite.prepare(`INSERT OR REPLACE INTO meta (key, value) VALUES ('packs_v6_seeded', ?)`).run(now);
    });
    txV6();
  }

  return { db, sqlite };
}

export function getDb() {
  if (!_db) _db = init();
  return _db;
}

export { sql };
