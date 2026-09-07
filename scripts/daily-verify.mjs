#!/usr/bin/env node
// PlainSlang — static-edition daily build.
// Runs in GitHub Actions (or locally): builds the full term list from the seed
// waves, runs the live trending verification + guide radar + new-article
// discovery, and writes site/data.json for the static site.
// No database, no server. Ground-truth rules unchanged: definitions are never
// auto-written; radar/discovery output is review-only.

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  extractItems, termInText, AMBIGUOUS, stripTags, cleanTerm, normKey,
} from '../lib/domain/matching.js';
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

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT = path.join(__dirname, '..', 'site', 'data.json');

// ---------------------------------------------------------------------------
// 1. Build the term list — same wave semantics as the DB seeder (lib/db.js).
// Deterministic: same seed files -> same ids, so localStorage saves stay valid.
// ---------------------------------------------------------------------------
function safeLink(u) {
  // Only http/https URLs may enter data.json (feed could theoretically carry
  // javascript:/data: URIs; strip them at the single generation choke point).
  return typeof u === 'string' && /^https?:\/\//i.test(u) ? u : null;
}

function buildTerms() {
  const terms = [];
  let nextId = 1;
  const byKey = () => new Map(terms.map((t) => [t.term.toLowerCase(), t]));

  const push = (r, { isSeed = true } = {}) => {
    terms.push({
      id: nextId++,
      term: r.term,
      emoji: r.emoji || '',
      definition: r.definition,
      example: r.example || null,
      notes: r.notes || null,
      ageGroup: r.ageGroup || 'gen_z',
      difficulty: r.difficulty || 'medium',
      say: r.say || null,
      sourceName: r.sourceName || null,
      sourceUrl: r.sourceUrl || null,
      tags: r.tags || [],
      isWoty: !!r.isWoty,
      trending: !!r.trending,
      trendingEvidence: null,
      isSeed,
      category: r.category || 'teen',
      related: [...(r.related || [])],
    });
  };
  const crossLink = (existing, category) => {
    if (!existing || existing.category === category) return;
    existing.related = [...new Set([...existing.related, category])]
      .filter((c) => c !== existing.category);
  };

  // v1 teen + v1 packs
  for (const r of seedTerms) push({ ...r, category: 'teen', trending: !!r.isWoty });
  for (const r of PACK_TERMS) push({ ...r, isWoty: false });

  // v2: dup-guard per term+category
  for (const r of PACK_TERMS_V2) {
    if (!terms.some((t) => t.term.toLowerCase() === r.term.toLowerCase() && t.category === r.category)) {
      push({ ...r, isWoty: false });
    }
  }

  // v3: dup-guard per term, then retro cross-links
  for (const r of PACK_TERMS_V3) {
    if (!byKey().has(r.term.toLowerCase())) push({ ...r, isWoty: false });
  }
  for (const [term, cats] of Object.entries(CROSS_LINKS)) {
    const row = byKey().get(term.toLowerCase());
    if (!row) continue;
    row.related = [...new Set([...row.related, ...cats])].filter((c) => c !== row.category);
  }

  // dedupe pass: collapse same term seeded twice; keep teen (else first)
  {
    const groups = new Map();
    for (const t of terms) {
      const k = t.term.toLowerCase();
      if (!groups.has(k)) groups.set(k, []);
      groups.get(k).push(t);
    }
    for (const rows of groups.values()) {
      if (rows.length < 2) continue;
      const keeper = rows.find((r) => r.category === 'teen') || rows[0];
      for (const e of rows) {
        if (e.id === keeper.id) continue;
        if (e.category !== keeper.category) keeper.related.push(e.category);
        keeper.related.push(...e.related);
        terms.splice(terms.indexOf(e), 1);
      }
      keeper.related = [...new Set(keeper.related)].filter((c) => c !== keeper.category);
    }
  }

  // v4: dup-guard per term
  for (const r of PACK_TERMS_V4) {
    if (!byKey().has(r.term.toLowerCase())) push({ ...r, isWoty: false });
  }

  // v5–v9: collision -> cross-link
  for (const wave of [PACK_TERMS_V5, PACK_TERMS_V6, PACK_TERMS_V7, PACK_TERMS_V8, PACK_TERMS_V9]) {
    for (const r of wave) {
      const existing = byKey().get(r.term.toLowerCase());
      if (existing) crossLink(existing, r.category);
      else push({ ...r, isWoty: false });
    }
  }

  return terms;
}

// ---------------------------------------------------------------------------
// 2. Trending verification (live news feeds)
// ---------------------------------------------------------------------------
const NEWS_FEEDS = [
  {
    name: 'Google News — teen & Gen Alpha slang',
    url: 'https://news.google.com/rss/search?q=%22teen%20slang%22%20OR%20%22gen%20alpha%20slang%22%20OR%20%22gen%20z%20slang%22%20OR%20%22word%20of%20the%20year%22&hl=en-US&gl=US&ceid=US:en',
  },
  { name: 'Merriam-Webster — Word of the Day', url: 'https://www.merriam-webster.com/wotd/feed/rss2' },
];

const UA = { 'user-agent': 'PlainSlang/1.0 (static daily verification; respects robots)' };

async function runTrending(terms) {
  const sourcesChecked = [];
  const headlines = [];
  let anySuccess = false;
  for (const feed of NEWS_FEEDS) {
    try {
      const res = await fetch(feed.url, { headers: UA, signal: AbortSignal.timeout(15000) });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const items = extractItems(await res.text());
      sourcesChecked.push({ name: feed.name, ok: true, items: items.length });
      headlines.push(...items.slice(0, 40).map((i) => ({ ...i, link: safeLink(i.link), feed: feed.name })));
      anySuccess = true;
    } catch (e) {
      sourcesChecked.push({ name: feed.name, ok: false, error: String(e.message || e) });
    }
  }

  const wotyEvidence = { headline: 'Official Word of the Year — stays trending per policy', feed: 'PlainSlang policy' };
  let matchedCount = 0;

  if (anySuccess) {
    for (const t of terms) { t.trending = false; t.trendingEvidence = null; }
    for (const t of terms) {
      if (t.category !== 'teen' || AMBIGUOUS.has(t.term.toLowerCase())) continue;
      const hit = headlines.find((h) => termInText(t.term, h.title));
      if (hit) {
        t.trending = true;
        t.trendingEvidence = { headline: hit.title, link: safeLink(hit.link), feed: hit.feed };
        matchedCount++;
      }
    }
  }
  for (const t of terms) {
    if (t.isWoty) {
      t.trending = true;
      t.trendingEvidence = t.trendingEvidence || wotyEvidence;
    }
  }

  // Wiktionary spot-check (best effort)
  const wikiResults = [];
  for (const t of terms.filter((x) => x.trending && !x.isWoty).slice(0, 3)) {
    try {
      const res = await fetch(
        `https://en.wiktionary.org/api/rest_v1/page/summary/${encodeURIComponent(t.term.replace(/ /g, '_'))}`,
        { headers: UA, signal: AbortSignal.timeout(8000) });
      wikiResults.push({ term: t.term, confirmed: res.ok });
    } catch {
      wikiResults.push({ term: t.term, confirmed: null });
    }
  }

  return {
    verifiedAt: new Date().toISOString(),
    day: new Intl.DateTimeFormat('en-CA', { timeZone: 'America/New_York' }).format(new Date()),
    sourcesChecked,
    matchedCount,
    headlinesSample: headlines.slice(0, 12),
    wiktionarySample: wikiResults,
    feedsFailed: !anySuccess,
  };
}

// ---------------------------------------------------------------------------
// 3. Guide radar + discovery
// NOTE: source lists + aliases mirror lib/radar.js — keep them in sync.
// ---------------------------------------------------------------------------
function barkExtract(html) {
  const found = new Set();
  const re = /<(?:strong|b)>\s*(?:<em>|<i>)?\s*([^<>]{1,40}?)\s*(?:<\/em>|<\/i>)?\s*<\/(?:strong|b)>/gi;
  let m;
  while ((m = re.exec(html)) !== null) { const t = cleanTerm(m[1]); if (t) found.add(t); }
  return [...found];
}
function axisExtract(html) {
  const found = new Set();
  let m;
  const re = /<(?:strong|b)>\s*([^<>]{1,40}?)\s*<\/(?:strong|b)>\s*(?:=|&#8211;|—|–)/gi;
  while ((m = re.exec(html)) !== null) { const t = cleanTerm(m[1]); if (t) found.add(t); }
  if (found.size < 20) {
    const re2 = /<(?:strong|b)>\s*([^<>]{1,40}?)\s*<\/(?:strong|b)>/gi;
    while ((m = re2.exec(html)) !== null) { const t = cleanTerm(m[1]); if (t) found.add(t); }
  }
  return [...found];
}

const RADAR_SOURCES = [
  { name: 'Bark — Teen Slang & Text Codes', url: 'https://www.bark.us/blog/teen-text-speak-codes-every-parent-should-know/', extract: barkExtract },
  { name: 'Bark — Gaming Terms Glossary', url: 'https://www.bark.us/blog/gaming-terms/', extract: barkExtract },
  { name: 'Bark — Emoji Slang Guide', url: 'https://www.bark.us/blog/emoji-slang-guide/', extract: barkExtract },
  { name: 'Bark — Drug Slang & Emojis', url: 'https://www.bark.us/blog/drug-slang-emojis/', extract: barkExtract },
  { name: 'Bark — Sexual Slang & Sexting Codes', url: 'https://www.bark.us/blog/sexual-slang/', extract: barkExtract },
  { name: 'Bark — TikTok Slang Guide', url: 'https://www.bark.us/blog/tiktok-slang/', extract: barkExtract },
  { name: 'Axis — Parent\u2019s Guide to Emoji', url: 'https://axis.org/resource/a-parent-guide-to-emoji/', extract: axisExtract },
  { name: 'Axis — Teen Slang, Back-to-School Edition', url: 'https://axis.org/resource/a-parents-guide-to-teen-slang-back-to-school-edition/', extract: axisExtract },
  { name: 'Axis — A Parent\u2019s Guide to Teen Slang', url: 'https://axis.org/resource/a-parent-guide-to-teen-slang/', extract: axisExtract },
];

const ALIASES = [
  'cappin\u2019|cap', 'cappin|cap', 'no cap|cap', 'okay boomer|ok boomer', 'boomer/okay boomer|ok boomer',
  'bffr/bfr/be so fr|bffr', 'ick or ick factor|ick', 'egirl / eboy / eperson|egirl / eboy',
  'period / on period|periodt', 'clock it / clocked|clock it', 'eat/ate|ate', 'dead/dying|ded',
  'gyatt|gyat', 'bussin|bussin\u2019', 'juul/juuling|juul', 'cap/no cap|cap', 'canon/headcanon|canon event',
  'vibing/straight vibing|vibing', 'wild/wylin\u2019/ wildin\u2019|wild / wildin\u2019', 'glow-up|glow up',
  'bed rot/rot|bed rot', 'drip/dripped out|drip', 'ok, boomer|ok boomer', 'ate that|ate',
  'ate and left no crumbs|left no crumbs', 'choppleganger|choppelganger', 'hits different|hit different',
  'lit/turnt/turnt up|lit', 'yapping|yapper', 'spam|spam account', 'boo\u2019d (or booed) up|boo',
  'bougie/boujee|bougie', 'clock/clocking|clock it', '_____ core/coded|-core / -coded', 'deada**|deadass',
  'glazing|glaze', 'ick/the ick|ick', 'live/living|live / living', 'mood|a mood', 'period|periodt',
  'pick-me girl|pick-me', 'pulling/pulled|pulling', 'rip/rip me|rip me', 'wig snatched|wig',
  'wrekd/wrecked|rekt', 'wrekd|rekt', 'wrecked|rekt', 'skins|skin', 'sweat|sweaty', 'cod|twitch',
  'boss|mob', 'mods|mod', 'maxxing as a general suffix|-maxxing', '"maxxing" as a general suffix|-maxxing',
  'big chungus life|chungus', '"big chungus life"|chungus', 'community dih|community dih / puh',
  'community puh|community dih / puh', 'ifykyk|iykyk', 'op|opp', 'lore drop|lore', 'easter|easter egg',
  'egg|easter egg', 'seggs|s \u{1F95A} s (seggs)', 'recession indicators|recession indicator',
  'or za|zaza', 'snow|snow / yayo', 'yayo|snow / yayo', 'credit card slam|credit card slam \u{1F4A5}\u{1F4B3}\u{1F4A5}',
  'p \u2B50\uFE0F|p \u2B50 (porn star)', 'it\u2019s the  for me|it\u2019s the ___ for me',
  'its the  for me|it\u2019s the ___ for me', 'you\u2019re wrong but go off|go off',
  'we stan a queen/king|stan', 'simp nation|simp', 'it really do be like that sometimes|it really do be like that',
].map((s) => s.split('|')[0]);

const DISCOVERY_SOURCES = [
  { name: 'Bark blog index', url: 'https://www.bark.us/blog/', linkRe: 'href="(https:\\/\\/www\\.bark\\.us\\/blog\\/[a-z0-9-]+\\/)"' },
  { name: 'Axis cultural-issues index', url: 'https://axis.org/parenting-theme/cultural-issues/', linkRe: 'href="(https:\\/\\/axis\\.org\\/resource\\/[a-z0-9-]+\\/)"' },
];
const GUIDE_HINT = /slang|emoji|terms|codes|acronym|dictionary|glossary|speak|lingo|jargon|texting/i;
const KNOWN_GUIDE_URLS = new Set(RADAR_SOURCES.map((s) => s.url));

async function runRadar(terms) {
  const known = new Set();
  for (const t of terms) {
    const k = normKey(t.term);
    known.add(k);
    known.add(k.replace(/[^a-z0-9 ]/g, ''));
    known.add(k.replace(/\s*\p{Extended_Pictographic}+\s*$/u, '').trim());
  }
  for (const a of ALIASES) known.add(normKey(a));

  const results = [];
  for (const src of RADAR_SOURCES) {
    try {
      const res = await fetch(src.url, { headers: UA, signal: AbortSignal.timeout(20000) });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const scanned = src.extract(await res.text());
      const newCandidates = scanned.filter((t) => {
        const k = normKey(t);
        if (!k || k.length < 2) return false;
        if (known.has(k) || known.has(k.replace(/[^a-z0-9 ]/g, ''))) return false;
        return !known.has(k.replace(/\u2019|\u2018|'/g, ''));
      });
      results.push({ source: src.name, url: src.url, ok: true, scanned: scanned.length, newCandidates: newCandidates.slice(0, 60) });
    } catch (e) {
      results.push({ source: src.name, url: src.url, ok: false, error: String(e.message || e) });
    }
  }

  const discovery = [];
  for (const src of DISCOVERY_SOURCES) {
    try {
      const res = await fetch(src.url, { headers: UA, signal: AbortSignal.timeout(20000) });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const html = await res.text();
      const seen = new Set();
      const re = new RegExp(src.linkRe, 'g');
      let m;
      while ((m = re.exec(html)) !== null) seen.add(m[1]);
      const newGuideUrls = [...seen].filter((u) => GUIDE_HINT.test(u) && !KNOWN_GUIDE_URLS.has(u));
      discovery.push({ index: src.name, ok: true, linksScanned: seen.size, newGuideUrls });
    } catch (e) {
      discovery.push({ index: src.name, ok: false, error: String(e.message || e) });
    }
  }

  return { checkedAt: new Date().toISOString(), results, discovery };
}

// ---------------------------------------------------------------------------
// main
// ---------------------------------------------------------------------------
const terms = buildTerms();
console.log(`built ${terms.length} terms from seed waves`);

const trendingStatus = await runTrending(terms);
console.log(`trending: ${trendingStatus.matchedCount} headline matches, feeds ${trendingStatus.feedsFailed ? 'FAILED (WOTY-only flags)' : 'ok'}`);

const radarStatus = await runRadar(terms);
for (const r of radarStatus.results) {
  console.log(`  ${r.ok ? (r.newCandidates.length ? '!' : '\u2713') : '\u2715'} ${r.source} — ${r.ok ? `${r.scanned} scanned, ${r.newCandidates.length} new` : r.error}`);
}
for (const d of radarStatus.discovery) {
  console.log(`  ${d.ok ? (d.newGuideUrls.length ? '\u{1F195}' : '\u2713') : '\u2715'} ${d.index} — ${d.ok ? `${d.linksScanned} links, ${d.newGuideUrls.length} new guides` : d.error}`);
}

const out = {
  generatedAt: new Date().toISOString(),
  termCount: terms.length,
  trendingCount: terms.filter((t) => t.trending).length,
  trendingSnapshot: trendingStatus,
  radarSnapshot: radarStatus,
  terms,
};
fs.mkdirSync(path.dirname(OUT), { recursive: true });
fs.writeFileSync(OUT, JSON.stringify(out));
console.log(`wrote ${OUT} (${(fs.statSync(OUT).size / 1024).toFixed(0)} KB), ${out.termCount} terms, ${out.trendingCount} trending`);
