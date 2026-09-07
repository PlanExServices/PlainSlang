// PlainSlang data layer — PostgreSQL (Supabase-ready).
// - DATABASE_URL points at any Postgres: Supabase (use the *session* pooler or
//   direct connection so LISTEN/NOTIFY works), local, Docker, etc.
// - Schema + seeding run once, idempotently, guarded by meta flags (same keys
//   as the old SQLite edition, so migrated databases are recognized).
// - A trigger on `terms` fires pg_notify on every change; db.js LISTENs and
//   forwards to the in-process SSE bus (lib/events.js), so edits made from
//   OTHER server instances or the Supabase dashboard also reach browsers.

import { Pool, Client } from 'pg';
import { emitEvent } from './events';
import seedTerms from './seed-terms.json';
import { PACK_TERMS } from './packs';
import { PACK_TERMS_V2 } from './packs-v2';
import { PACK_TERMS_V3, CROSS_LINKS } from './packs-v3';
import { PACK_TERMS_V4 } from './packs-v4';
import { PACK_TERMS_V5 } from './packs-v5';
import { PACK_TERMS_V6 } from './packs-v6';
import { PACK_TERMS_V7 } from './packs-v7';
import { PACK_TERMS_V8 } from './packs-v8';
import { PACK_TERMS_V9 } from './packs-v9';

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  // Fail loudly at first query, not at import (build-time safety).
  console.warn('[plainslang] DATABASE_URL is not set — API routes will fail until it is.');
}

function sslConfig() {
  if (!DATABASE_URL) return undefined;
  // Supabase & most hosted PG require TLS; local/CI usually not.
  if (/localhost|127\.0\.0\.1|\/tmp/.test(DATABASE_URL)) return undefined;
  return { rejectUnauthorized: false };
}

const g = globalThis.__plainslangPg || (globalThis.__plainslangPg = {});

export function getPool() {
  if (!g.pool) {
    g.pool = new Pool({
      connectionString: DATABASE_URL,
      max: 5,
      idleTimeoutMillis: 30_000,
      ssl: sslConfig(),
    });
    g.pool.on('error', (e) => console.error('[plainslang] pg pool error:', e.message));
  }
  return g.pool;
}

// ---------------------------------------------------------------------------
// Schema + migrations
// ---------------------------------------------------------------------------
const SCHEMA_SQL = `
CREATE TABLE IF NOT EXISTS terms (
  id                 SERIAL PRIMARY KEY,
  term               TEXT NOT NULL,
  emoji              TEXT DEFAULT '',
  definition         TEXT NOT NULL,
  example            TEXT,
  notes              TEXT,
  age_group          TEXT NOT NULL,
  difficulty         TEXT NOT NULL DEFAULT 'medium',
  say                TEXT,
  source_name        TEXT,
  source_url         TEXT,
  tags               TEXT DEFAULT '[]',
  is_woty            INTEGER DEFAULT 0,
  trending           INTEGER DEFAULT 0,
  trending_evidence  TEXT,
  is_seed            INTEGER DEFAULT 0,
  category           TEXT NOT NULL DEFAULT 'teen',
  related            TEXT NOT NULL DEFAULT '[]',
  created_at         TEXT,
  updated_at         TEXT
);
CREATE TABLE IF NOT EXISTS meta (
  key   TEXT PRIMARY KEY,
  value TEXT
);
CREATE INDEX IF NOT EXISTS idx_terms_category  ON terms (category);
CREATE INDEX IF NOT EXISTS idx_terms_trending  ON terms (trending);
CREATE INDEX IF NOT EXISTS idx_terms_term_lower ON terms (LOWER(term));

-- Realtime: notify on any change to terms
CREATE OR REPLACE FUNCTION plainslang_notify() RETURNS trigger AS $$
BEGIN
  PERFORM pg_notify('plainslang_changes', json_build_object(
    'op', TG_OP,
    'id', COALESCE(NEW.id, OLD.id),
    'term', COALESCE(NEW.term, OLD.term)
  )::text);
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS plainslang_terms_notify ON terms;
CREATE TRIGGER plainslang_terms_notify
  AFTER INSERT OR UPDATE OR DELETE ON terms
  FOR EACH ROW EXECUTE FUNCTION plainslang_notify();
`;

// ---------------------------------------------------------------------------
// Seeding (idempotent, same meta flags as the SQLite edition)
// ---------------------------------------------------------------------------
async function insertTerm(client, r, { isSeed = 1, now }) {
  await client.query(
    `INSERT INTO terms (term, emoji, definition, example, notes, age_group, difficulty, say,
       source_name, source_url, tags, is_woty, trending, is_seed, category, related, created_at, updated_at)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$17)`,
    [
      r.term, r.emoji || '', r.definition, r.example || null, r.notes || null,
      r.ageGroup || 'gen_z', r.difficulty || 'medium', r.say || null,
      r.sourceName || null, r.sourceUrl || null, JSON.stringify(r.tags || []),
      r.isWoty ? 1 : 0, r.trending ? 1 : 0, isSeed, r.category || 'teen',
      JSON.stringify(r.related || []), now,
    ]
  );
}

async function termExists(client, term) {
  const { rows } = await client.query(
    'SELECT id, category, related FROM terms WHERE LOWER(term) = LOWER($1) LIMIT 1', [term]);
  return rows[0] || null;
}

async function crossLinkInto(client, existing, category) {
  if (!existing || existing.category === category) return;
  let rel = [];
  try { rel = JSON.parse(existing.related || '[]'); } catch { /* keep [] */ }
  rel = [...new Set([...rel, category])].filter((c) => c !== existing.category);
  await client.query('UPDATE terms SET related = $1 WHERE id = $2', [JSON.stringify(rel), existing.id]);
}

async function flagDone(client, key) {
  await client.query(
    `INSERT INTO meta (key, value) VALUES ($1, $2)
     ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value`,
    [key, new Date().toISOString()]);
}

async function flagged(client, key) {
  const { rows } = await client.query('SELECT value FROM meta WHERE key = $1', [key]);
  return rows.length > 0;
}

async function seed(client) {
  const now = new Date().toISOString();

  // v1: original 130 teen terms + first pack wave
  const { rows: [{ c: seedCount }] } = await client.query(
    `SELECT COUNT(*)::int AS c FROM terms WHERE is_seed = 1 AND category = 'teen'`);
  if (seedCount === 0) {
    for (const r of seedTerms) {
      await insertTerm(client, { ...r, trending: !!r.isWoty, category: 'teen' }, { now });
    }
    await flagDone(client, 'trending_note');
  }
  const { rows: [{ c: packCount }] } = await client.query(
    `SELECT COUNT(*)::int AS c FROM terms WHERE is_seed = 1 AND category != 'teen'`);
  if (packCount === 0) {
    for (const r of PACK_TERMS) await insertTerm(client, r, { now });
  }

  // v2 (dup-guard per term+category)
  if (!(await flagged(client, 'packs_v2_seeded'))) {
    for (const r of PACK_TERMS_V2) {
      const { rows } = await client.query(
        'SELECT 1 FROM terms WHERE LOWER(term) = LOWER($1) AND category = $2', [r.term, r.category]);
      if (rows.length === 0) await insertTerm(client, r, { now });
    }
    await flagDone(client, 'packs_v2_seeded');
  }

  // v3 (dup-guard per term) + retro cross-links
  if (!(await flagged(client, 'packs_v3_seeded'))) {
    for (const r of PACK_TERMS_V3) {
      if (!(await termExists(client, r.term))) await insertTerm(client, r, { now });
    }
    for (const [term, cats] of Object.entries(CROSS_LINKS)) {
      const row = await termExists(client, term);
      if (!row) continue;
      let existing = [];
      try { existing = JSON.parse(row.related || '[]'); } catch { /* keep [] */ }
      const merged = [...new Set([...existing, ...cats])].filter((c) => c !== row.category);
      await client.query('UPDATE terms SET related = $1 WHERE id = $2', [JSON.stringify(merged), row.id]);
    }
    await flagDone(client, 'packs_v3_seeded');
  }

  // dedupe pass (collapse same term seeded into 2 packs; keep teen row)
  if (!(await flagged(client, 'xlink_dedupe_done'))) {
    const { rows: dupes } = await client.query(
      `SELECT LOWER(term) AS t FROM terms WHERE is_seed = 1 GROUP BY LOWER(term) HAVING COUNT(*) > 1`);
    for (const { t } of dupes) {
      const { rows } = await client.query(
        `SELECT id, category, related FROM terms WHERE LOWER(term) = $1 AND is_seed = 1 ORDER BY id`, [t]);
      if (rows.length < 2) continue;
      const keeper = rows.find((r) => r.category === 'teen') || rows[0];
      const extras = rows.filter((r) => r.id !== keeper.id);
      let related = [];
      try { related = JSON.parse(keeper.related || '[]'); } catch { /* keep [] */ }
      for (const e of extras) {
        if (e.category !== keeper.category) related.push(e.category);
        try { for (const c of JSON.parse(e.related || '[]')) related.push(c); } catch { /* skip */ }
        await client.query('DELETE FROM terms WHERE id = $1', [e.id]);
      }
      related = [...new Set(related)].filter((c) => c !== keeper.category);
      await client.query('UPDATE terms SET related = $1 WHERE id = $2', [JSON.stringify(related), keeper.id]);
    }
    await flagDone(client, 'xlink_dedupe_done');
  }

  // v4 (dup-guard per term)
  if (!(await flagged(client, 'packs_v4_seeded'))) {
    for (const r of PACK_TERMS_V4) {
      if (!(await termExists(client, r.term))) await insertTerm(client, r, { now });
    }
    await flagDone(client, 'packs_v4_seeded');
  }

  // v5 + v6 (collision -> cross-link)
  for (const [wave, rows, key] of [
    ['v5', PACK_TERMS_V5, 'packs_v5_seeded'],
    ['v6', PACK_TERMS_V6, 'packs_v6_seeded'],
    ['v7', PACK_TERMS_V7, 'packs_v7_seeded'],
    ['v8', PACK_TERMS_V8, 'packs_v8_seeded'],
    ['v9', PACK_TERMS_V9, 'packs_v9_seeded'],
  ]) {
    if (await flagged(client, key)) continue;
    for (const r of rows) {
      const existing = await termExists(client, r.term);
      if (existing) await crossLinkInto(client, existing, r.category);
      else await insertTerm(client, r, { now });
    }
    await flagDone(client, key);
  }
}

// ---------------------------------------------------------------------------
// LISTEN bridge: DB changes (from any writer) -> SSE bus
// ---------------------------------------------------------------------------
async function startListener() {
  if (g.listener || !DATABASE_URL) return;
  g.listener = true; // claim before async work to avoid double-start
  try {
    const client = new Client({ connectionString: DATABASE_URL, ssl: sslConfig() });
    await client.connect();
    await client.query('LISTEN plainslang_changes');
    client.on('notification', (msg) => {
      let payload = {};
      try { payload = JSON.parse(msg.payload || '{}'); } catch { /* ignore */ }
      emitEvent('db-change', payload);
    });
    client.on('error', (e) => {
      console.warn('[plainslang] LISTEN connection lost:', e.message);
      g.listener = false;
      setTimeout(startListener, 5000);
    });
    g.listenerClient = client;
  } catch (e) {
    // Transaction poolers (Supabase :6543) don't support LISTEN — degrade
    // gracefully: same-instance events still flow via emitEvent directly.
    console.warn('[plainslang] LISTEN unavailable (' + e.message + ') — realtime limited to this instance.');
    g.listener = 'failed';
  }
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------
export async function ensureReady() {
  if (!g.ready) {
    g.ready = (async () => {
      const pool = getPool();
      const client = await pool.connect();
      try {
        await client.query(SCHEMA_SQL);
        // serialize seeding across instances
        await client.query('BEGIN');
        await client.query('SELECT pg_advisory_xact_lock(727270001)');
        await seed(client);
        await client.query('COMMIT');
      } catch (e) {
        await client.query('ROLLBACK').catch(() => {});
        throw e;
      } finally {
        client.release();
      }
      startListener(); // fire and forget
    })().catch((e) => {
      g.ready = null; // allow retry on next request
      throw e;
    });
  }
  return g.ready;
}

export async function query(text, params = []) {
  await ensureReady();
  return getPool().query(text, params);
}

// Raw query without the ready-gate (used inside verify flows post-init).
export async function rawQuery(text, params = []) {
  return getPool().query(text, params);
}
