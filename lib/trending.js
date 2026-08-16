import { getDb } from './db';

const NEWS_FEEDS = [
  {
    name: 'Google News — teen & Gen Alpha slang',
    url: 'https://news.google.com/rss/search?q=%22teen%20slang%22%20OR%20%22gen%20alpha%20slang%22%20OR%20%22gen%20z%20slang%22%20OR%20%22word%20of%20the%20year%22&hl=en-US&gl=US&ceid=US:en',
  },
  {
    name: 'Merriam-Webster — Word of the Day',
    url: 'https://www.merriam-webster.com/wotd/feed/rss2',
  },
];

function nyDateString(d = new Date()) {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'America/New_York' }).format(d);
}

function extractItems(xml) {
  const items = [];
  const re = /<item>([\s\S]*?)<\/item>/g;
  let m;
  while ((m = re.exec(xml)) !== null) {
    const chunk = m[1];
    const t =
      chunk.match(/<title><!\[CDATA\[([\s\S]*?)\]\]><\/title>/) ||
      chunk.match(/<title>([\s\S]*?)<\/title>/);
    const l = chunk.match(/<link>([\s\S]*?)<\/link>/);
    if (t) {
      items.push({
        title: decodeEntities(t[1].trim()),
        link: l ? l[1].trim() : null,
      });
    }
  }
  return items;
}

function decodeEntities(s) {
  return s
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'");
}

// Word-boundary match of a term inside a headline (case-insensitive).
function termInText(term, text) {
  const lower = text.toLowerCase();
  const t = term.toLowerCase();
  const escaped = t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  try {
    const re = new RegExp(`(^|[^a-z0-9])${escaped}($|[^a-z0-9])`, 'i');
    return re.test(lower);
  } catch {
    return lower.includes(t);
  }
}

// Terms too generic to match on a single common English word.
const AMBIGUOUS = new Set([
  'ate', 'basic', 'bet', 'cap', 'chat', 'cooked', 'crash out', 'dog', 'extra',
  'fire', 'flex', 'ghost', 'hits', 'ice', 'lit', 'mid', 'salty', 'ship',
  'slaps', 'snack', 'tea', 'w', 'l', 'chad', 'karen', 'slay', 'bot',
]);

async function fetchFeed(feed) {
  const res = await fetch(feed.url, {
    headers: { 'user-agent': 'PlainSlang/1.0 (trending verification; contact: local install)' },
    signal: AbortSignal.timeout(12000),
    cache: 'no-store',
  });
  if (!res.ok) throw new Error(`${feed.name}: HTTP ${res.status}`);
  const xml = await res.text();
  return extractItems(xml);
}

async function wiktionaryConfirm(term) {
  try {
    const res = await fetch(
      `https://en.wiktionary.org/api/rest_v1/page/summary/${encodeURIComponent(term.replace(/ /g, '_'))}`,
      { signal: AbortSignal.timeout(8000), cache: 'no-store' }
    );
    return res.ok;
  } catch {
    return null; // unknown, not a failure
  }
}

export async function refreshTrending({ force = false } = {}) {
  const { sqlite } = getDb();
  const today = nyDateString();
  const lastRun = sqlite.prepare(`SELECT value FROM meta WHERE key = 'trending_last_run_day'`).get();

  if (!force && lastRun && lastRun.value === today) {
    return getTrendingStatus();
  }

  const sourcesChecked = [];
  const headlines = [];
  let anySuccess = false;

  for (const feed of NEWS_FEEDS) {
    try {
      const items = await fetchFeed(feed);
      sourcesChecked.push({ name: feed.name, ok: true, items: items.length });
      headlines.push(...items.slice(0, 40).map((i) => ({ ...i, feed: feed.name })));
      anySuccess = true;
    } catch (e) {
      sourcesChecked.push({ name: feed.name, ok: false, error: String(e.message || e) });
    }
  }

  if (!anySuccess) {
    // Feeds failed: keep yesterday's flags, record the attempt.
    sqlite
      .prepare(`INSERT OR REPLACE INTO meta (key, value) VALUES ('trending_last_attempt', ?)`)
      .run(JSON.stringify({ at: new Date().toISOString(), ok: false, sourcesChecked }));
    return getTrendingStatus();
  }

  // Only teen-slang terms are checked against news headlines; jargon-pack terms
  // (DRY, lag, tank, GG…) are common words that would false-positive constantly.
  const allTerms = sqlite.prepare(`SELECT id, term, is_woty FROM terms WHERE category = 'teen'`).all();
  const matches = [];
  for (const row of allTerms) {
    if (AMBIGUOUS.has(row.term.toLowerCase())) continue;
    const hit = headlines.find((h) => termInText(row.term, h.title));
    if (hit) matches.push({ id: row.id, term: row.term, headline: hit.title, link: hit.link, feed: hit.feed });
  }

  // Optional Wiktionary confirmation on a small sample of matches.
  const sample = matches.slice(0, 3);
  const wikiResults = [];
  for (const s of sample) {
    const ok = await wiktionaryConfirm(s.term);
    wikiResults.push({ term: s.term, confirmed: ok });
  }

  const now = new Date().toISOString();
  const tx = sqlite.transaction(() => {
    // Reset, then re-flag: matched headlines + official WOTY terms stay trending.
    sqlite.prepare('UPDATE terms SET trending = 0, trending_evidence = NULL').run();
    const setTrend = sqlite.prepare('UPDATE terms SET trending = 1, trending_evidence = ? WHERE id = ?');
    for (const m of matches) {
      setTrend.run(JSON.stringify({ headline: m.headline, link: m.link, feed: m.feed }), m.id);
    }
    sqlite
      .prepare(`UPDATE terms SET trending = 1, trending_evidence = COALESCE(trending_evidence, ?) WHERE is_woty = 1`)
      .run(JSON.stringify({ headline: 'Official Word of the Year — stays trending per policy', feed: 'PlainSlang policy' }));
    sqlite.prepare(`INSERT OR REPLACE INTO meta (key, value) VALUES ('trending_last_run_day', ?)`).run(today);
    sqlite.prepare(`INSERT OR REPLACE INTO meta (key, value) VALUES ('trending_status', ?)`).run(
      JSON.stringify({
        verifiedAt: now,
        day: today,
        sourcesChecked,
        matchedCount: matches.length,
        headlinesSample: headlines.slice(0, 12),
        wiktionarySample: wikiResults,
      })
    );
  });
  tx();

  return getTrendingStatus();
}

export function getTrendingStatus() {
  const { sqlite } = getDb();
  const status = sqlite.prepare(`SELECT value FROM meta WHERE key = 'trending_status'`).get();
  const attempt = sqlite.prepare(`SELECT value FROM meta WHERE key = 'trending_last_attempt'`).get();
  const trendingTerms = sqlite
    .prepare(`SELECT * FROM terms WHERE trending = 1 ORDER BY is_woty DESC, term COLLATE NOCASE`)
    .all();
  return {
    status: status ? JSON.parse(status.value) : null,
    lastFailedAttempt: attempt ? JSON.parse(attempt.value) : null,
    terms: trendingTerms.map(rowToTerm),
  };
}

export function rowToTerm(r) {
  return {
    id: r.id,
    term: r.term,
    emoji: r.emoji,
    definition: r.definition,
    example: r.example,
    notes: r.notes,
    ageGroup: r.age_group,
    difficulty: r.difficulty,
    say: r.say,
    sourceName: r.source_name,
    sourceUrl: r.source_url,
    tags: safeJson(r.tags, []),
    isWoty: !!r.is_woty,
    trending: !!r.trending,
    trendingEvidence: safeJson(r.trending_evidence, null),
    isSeed: !!r.is_seed,
    category: r.category || 'teen',
    related: safeJson(r.related, []),
    createdAt: r.created_at,
    updatedAt: r.updated_at,
  };
}

function safeJson(s, fallback) {
  if (!s) return fallback;
  try {
    return JSON.parse(s);
  } catch {
    return fallback;
  }
}
