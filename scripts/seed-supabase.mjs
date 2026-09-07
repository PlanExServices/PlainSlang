#!/usr/bin/env node
// One-time Supabase provisioning: creates tables (via SQL you run first — see
// scripts/supabase-schema.sql), then seeds all packs through the HTTP API.
//
// Usage:
//   1. In the Supabase dashboard → SQL Editor, run scripts/supabase-schema.sql
//   2. SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... node scripts/seed-supabase.mjs
//
// Idempotent: safe to re-run; uses the same meta flags + dedupe rules as lib/db.js.

import { createClient } from '@supabase/supabase-js';
import seedTerms from '../lib/seed-terms.json' with { type: 'json' };
import { PACK_TERMS } from '../lib/packs.js';
import { PACK_TERMS_V2 } from '../lib/packs-v2.js';
import { PACK_TERMS_V3, CROSS_LINKS } from '../lib/packs-v3.js';
import { PACK_TERMS_V4 } from '../lib/packs-v4.js';
import { PACK_TERMS_V5 } from '../lib/packs-v5.js';
import { PACK_TERMS_V6 } from '../lib/packs-v6.js';
import { PACK_TERMS_V7 } from '../lib/packs-v7.js';
import { PACK_TERMS_V8 } from '../lib/packs-v8.js';
import { PACK_TERMS_V9 } from '../lib/packs-v9.js';

const url = process.env.SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) {
  console.error('Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY (service role, not anon).');
  process.exit(1);
}
const sb = createClient(url, key, { auth: { persistSession: false } });

const die = (e) => { console.error('FATAL:', e.message || e); process.exit(1); };

function toRow(r, { isSeed = 1, now }) {
  return {
    term: r.term, emoji: r.emoji || '', definition: r.definition,
    example: r.example || null, notes: r.notes || null,
    age_group: r.ageGroup || 'gen_z', difficulty: r.difficulty || 'medium',
    say: r.say || null, source_name: r.sourceName || null, source_url: r.sourceUrl || null,
    tags: JSON.stringify(r.tags || []), is_woty: r.isWoty ? 1 : 0,
    trending: r.isWoty ? 1 : 0, is_seed: isSeed, category: r.category || 'teen',
    related: JSON.stringify(r.related || []), created_at: now, updated_at: now,
  };
}

async function flagged(k) {
  const { data, error } = await sb.from('meta').select('value').eq('key', k).maybeSingle();
  if (error) die(error);
  return !!data;
}
async function setFlag(k) {
  const { error } = await sb.from('meta').upsert({ key: k, value: new Date().toISOString() });
  if (error) die(error);
}
async function findTerm(term) {
  const { data, error } = await sb.from('terms')
    .select('id, category, related').ilike('term', term).limit(1).maybeSingle();
  if (error) die(error);
  return data;
}
async function crossLink(existing, category) {
  if (!existing || existing.category === category) return;
  let rel = [];
  try { rel = JSON.parse(existing.related || '[]'); } catch { /* keep */ }
  rel = [...new Set([...rel, category])].filter((c) => c !== existing.category);
  const { error } = await sb.from('terms').update({ related: JSON.stringify(rel) }).eq('id', existing.id);
  if (error) die(error);
}
async function insertBatch(rows) {
  for (let i = 0; i < rows.length; i += 100) {
    const { error } = await sb.from('terms').insert(rows.slice(i, i + 100));
    if (error) die(error);
  }
}

const now = new Date().toISOString();

// v1 teen
const { count: teenSeeded, error: e1 } = await sb.from('terms')
  .select('id', { count: 'exact', head: true }).eq('is_seed', 1).eq('category', 'teen');
if (e1) die(e1);
if (teenSeeded === 0) {
  await insertBatch(seedTerms.map((r) => toRow({ ...r, category: 'teen' }, { now })));
  console.log('v1 teen seeded:', seedTerms.length);
}
// v1 packs
const { count: packSeeded, error: e2 } = await sb.from('terms')
  .select('id', { count: 'exact', head: true }).eq('is_seed', 1).neq('category', 'teen');
if (e2) die(e2);
if (packSeeded === 0) {
  await insertBatch(PACK_TERMS.map((r) => toRow({ ...r, isWoty: false }, { now })));
  console.log('v1 packs seeded:', PACK_TERMS.length);
}
// v2
if (!(await flagged('packs_v2_seeded'))) {
  for (const r of PACK_TERMS_V2) {
    const { count } = await sb.from('terms').select('id', { count: 'exact', head: true })
      .ilike('term', r.term).eq('category', r.category);
    if (!count) await insertBatch([toRow({ ...r, isWoty: false }, { now })]);
  }
  await setFlag('packs_v2_seeded');
  console.log('v2 done');
}
// v3 + cross-links
if (!(await flagged('packs_v3_seeded'))) {
  for (const r of PACK_TERMS_V3) {
    if (!(await findTerm(r.term))) await insertBatch([toRow({ ...r, isWoty: false }, { now })]);
  }
  for (const [term, cats] of Object.entries(CROSS_LINKS)) {
    const row = await findTerm(term);
    if (!row) continue;
    let rel = [];
    try { rel = JSON.parse(row.related || '[]'); } catch { /* keep */ }
    const merged = [...new Set([...rel, ...cats])].filter((c) => c !== row.category);
    const { error } = await sb.from('terms').update({ related: JSON.stringify(merged) }).eq('id', row.id);
    if (error) die(error);
  }
  await setFlag('packs_v3_seeded');
  console.log('v3 done');
}
// dedupe
if (!(await flagged('xlink_dedupe_done'))) {
  const { data: all, error } = await sb.from('terms').select('id, term, category, related, is_seed').eq('is_seed', 1);
  if (error) die(error);
  const byTerm = new Map();
  for (const r of all) {
    const k = r.term.toLowerCase();
    if (!byTerm.has(k)) byTerm.set(k, []);
    byTerm.get(k).push(r);
  }
  for (const [, rows] of byTerm) {
    if (rows.length < 2) continue;
    rows.sort((a, b) => a.id - b.id);
    const keeper = rows.find((r) => r.category === 'teen') || rows[0];
    const extras = rows.filter((r) => r.id !== keeper.id);
    let rel = [];
    try { rel = JSON.parse(keeper.related || '[]'); } catch { /* keep */ }
    for (const e of extras) {
      if (e.category !== keeper.category) rel.push(e.category);
      try { for (const c of JSON.parse(e.related || '[]')) rel.push(c); } catch { /* skip */ }
      const { error: de } = await sb.from('terms').delete().eq('id', e.id);
      if (de) die(de);
    }
    rel = [...new Set(rel)].filter((c) => c !== keeper.category);
    const { error: ue } = await sb.from('terms').update({ related: JSON.stringify(rel) }).eq('id', keeper.id);
    if (ue) die(ue);
  }
  await setFlag('xlink_dedupe_done');
  console.log('dedupe done');
}
// v4
if (!(await flagged('packs_v4_seeded'))) {
  for (const r of PACK_TERMS_V4) {
    if (!(await findTerm(r.term))) await insertBatch([toRow({ ...r, isWoty: false }, { now })]);
  }
  await setFlag('packs_v4_seeded');
  console.log('v4 done');
}
// v5 + v6 (collision -> cross-link)
for (const [rows, key] of [[PACK_TERMS_V5, 'packs_v5_seeded'], [PACK_TERMS_V6, 'packs_v6_seeded'], [PACK_TERMS_V7, 'packs_v7_seeded'], [PACK_TERMS_V8, 'packs_v8_seeded'], [PACK_TERMS_V9, 'packs_v9_seeded']]) {
  if (await flagged(key)) continue;
  for (const r of rows) {
    const existing = await findTerm(r.term);
    if (existing) await crossLink(existing, r.category);
    else await insertBatch([toRow({ ...r, isWoty: false }, { now })]);
  }
  await setFlag(key);
  console.log(key, 'done');
}

const { count: total } = await sb.from('terms').select('id', { count: 'exact', head: true });
console.log('TOTAL TERMS:', total);
console.log('Seeding complete.');
