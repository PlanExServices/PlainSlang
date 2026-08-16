import { getDb } from './db';

// Daily slang radar: re-scan Bark and Axis parent guides for terms we don't
// have yet. New terms are reported as REVIEW CANDIDATES with their source —
// we never auto-write definitions (Rule: no invented meanings).

const RADAR_SOURCES = [
  {
    name: 'Bark — Teen Slang & Text Codes',
    url: 'https://www.bark.us/blog/teen-text-speak-codes-every-parent-should-know/',
    // Bark bolds each term: - **_term_** — definition  /  - **term** — definition
    extract: (html) => {
      const found = new Set();
      const text = stripTags(html);
      // After markdown-ish stripping, Bark terms lead list items and are
      // followed by an em dash or " — ". Parse from raw HTML strong tags instead.
      const re = /<(?:strong|b)>\s*(?:<em>|<i>)?\s*([^<>]{1,40}?)\s*(?:<\/em>|<\/i>)?\s*<\/(?:strong|b)>/gi;
      let m;
      while ((m = re.exec(html)) !== null) {
        const t = cleanTerm(m[1]);
        if (t) found.add(t);
      }
      return { terms: [...found], textLength: text.length };
    },
  },
  {
    name: 'Axis — A Parent\u2019s Guide to Teen Slang',
    url: 'https://axis.org/resource/a-parent-guide-to-teen-slang/',
    // Axis bolds each dictionary headword: <strong>term</strong> = definition
    extract: (html) => {
      const found = new Set();
      const re = /<(?:strong|b)>\s*([^<>]{1,40}?)\s*<\/(?:strong|b)>\s*(?:=|&#8211;|—|–)/gi;
      let m;
      while ((m = re.exec(html)) !== null) {
        const t = cleanTerm(m[1]);
        if (t) found.add(t);
      }
      // fallback: plain bold tags if the "=" pattern missed most
      if (found.size < 20) {
        const re2 = /<(?:strong|b)>\s*([^<>]{1,40}?)\s*<\/(?:strong|b)>/gi;
        while ((m = re2.exec(html)) !== null) {
          const t = cleanTerm(m[1]);
          if (t) found.add(t);
        }
      }
      return { terms: [...found], textLength: stripTags(html).length };
    },
  },
];

const IGNORE = new Set([
  'example', 'examples', 'note', 'warning', 'download guide', 'read', 'begin', 'give',
  'get started', 'the bark team', 'facebook', 'twitter', 'email', 'watch on',
  'key takeaways from this blog post', 'download the pdf', 'more resources',
  // section headers, not terms
  'text slang decoded', 'older teen slang terms', 'teen slang emoji icons',
  'the dictionary of slang', 'a final thought', 'popular slang emoji meanings',
  'points', 'big',
]);

function stripTags(html) {
  return html.replace(/<script[\s\S]*?<\/script>/gi, '').replace(/<style[\s\S]*?<\/style>/gi, '').replace(/<[^>]+>/g, ' ');
}

function cleanTerm(raw) {
  let t = raw
    .replace(/&amp;/g, '&').replace(/&#8217;|&rsquo;/g, '\u2019').replace(/&#8216;/g, '\u2018')
    .replace(/&#8220;|&#8221;|&quot;/g, '').replace(/&nbsp;/g, ' ')
    .replace(/^\W+|[=:—–-]+$/g, '')
    .trim();
  if (!t || t.length < 1 || t.length > 40) return null;
  const lower = t.toLowerCase();
  if (IGNORE.has(lower)) return null;
  if (/^(what|this|the|a|an|if|so|and|are|it|here|use|read)\s/i.test(t) && t.split(' ').length > 3) return null;
  if (/^https?:/i.test(t)) return null;
  if (/^\d{1,2}:\d{2}$/.test(t) === false && /^[\d\s.,%]+$/.test(t) && !/^\d+([:-]\d+)?$/.test(t)) return null;
  return t;
}

// Normalize for matching against our DB (strip punctuation variants).
function normKey(t) {
  return t.toLowerCase()
    .replace(/[\u2018\u2019']/g, '')
    .replace(/[\u201C\u201D"]/g, '')
    .replace(/\s+/g, ' ')
    .replace(/^-|-$/g, '')
    .trim();
}

function nyDateString(d = new Date()) {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'America/New_York' }).format(d);
}

export async function runRadar({ force = false } = {}) {
  const { sqlite } = getDb();
  const today = nyDateString();
  const lastRun = sqlite.prepare(`SELECT value FROM meta WHERE key = 'radar_last_run_day'`).get();

  if (!force && lastRun && lastRun.value === today) {
    return getRadarStatus();
  }

  // Build the known-term set (terms + simple variants).
  const known = new Set();
  for (const r of sqlite.prepare('SELECT term FROM terms').all()) {
    const k = normKey(r.term);
    known.add(k);
    known.add(k.replace(/[^a-z0-9 ]/g, ''));
    // strip trailing emoji-name suffixes like "eggplant 🍆"
    known.add(k.replace(/\s*\p{Extended_Pictographic}+\s*$/u, '').trim());
  }
  // Variants/aliases we cover under a different headword — don't re-flag them.
  const ALIASES = [
    ['cappin\u2019', 'cap'], ['cappin', 'cap'], ['no cap', 'cap'], ['okay boomer', 'ok boomer'],
    ['boomer/okay boomer', 'ok boomer'], ['bffr/bfr/be so fr', 'bffr'], ['ick or ick factor', 'ick'],
    ['egirl / eboy / eperson', 'egirl / eboy'], ['egirl / eboy', 'egirl / eboy'],
    ['period / on period', 'periodt'], ['clock it / clocked', 'clock it'], ['eat/ate', 'ate'],
    ['dead/dying', 'ded'], ['low key', 'low key'], ['gyatt', 'gyat'], ['bussin', 'bussin\u2019'],
    ['juul/juuling', 'juul'], ['cap/no cap', 'cap'], ['canon/headcanon', 'canon event'],
    ['vibing/straight vibing', 'vibing'], ['wild/wylin\u2019/ wildin\u2019', 'wild / wildin\u2019'],
    ['glow-up', 'glow up'], ['rent free', 'rent free'], ['bed rot/rot', 'bed rot'],
    ['drip/dripped out', 'drip'], ['big back', 'big back'], ['ok, boomer', 'ok boomer'],
    ['crash out', 'crash out'], ['kms', 'kms'], ['kys', 'kys'],
    // variant spellings / compound headwords we already cover
    ['ate that', 'ate'], ['ate and left no crumbs', 'left no crumbs'],
    ['choppleganger', 'choppelganger'], ['hits different', 'hit different'],
    ['lit/turnt/turnt up', 'lit'], ['yapping', 'yapper'], ['spam', 'spam account'],
    ['boo\u2019d (or booed) up', 'boo'], ['bougie/boujee', 'bougie'],
    ['clock/clocking', 'clock it'], ['_____ core/coded', '-core / -coded'],
    ['deada**', 'deadass'], ['glazing', 'glaze'], ['ick/the ick', 'ick'],
    ['live/living', 'live / living'], ['mood', 'a mood'], ['period', 'periodt'],
    ['pick-me girl', 'pick-me'], ['pulling/pulled', 'pulling'],
    ['rip/rip me', 'rip me'], ['wig snatched', 'wig'],
  ];
  for (const [alias] of ALIASES) known.add(normKey(alias));

  const results = [];
  let anySuccess = false;

  for (const src of RADAR_SOURCES) {
    try {
      const res = await fetch(src.url, {
        headers: { 'user-agent': 'PlainSlang/1.0 (daily slang radar; respects robots)' },
        signal: AbortSignal.timeout(20000),
        cache: 'no-store',
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const html = await res.text();
      const { terms, textLength } = src.extract(html);
      const newTerms = terms.filter((t) => {
        const k = normKey(t);
        if (!k || k.length < 2) return false;
        if (known.has(k)) return false;
        if (known.has(k.replace(/[^a-z0-9 ]/g, ''))) return false;
        // check singular/short forms
        const bare = k.replace(/\u2019|\u2018|'/g, '');
        if (known.has(bare)) return false;
        return true;
      });
      results.push({ source: src.name, url: src.url, ok: true, scanned: terms.length, textLength, newCandidates: newTerms.slice(0, 60) });
      anySuccess = true;
    } catch (e) {
      results.push({ source: src.name, url: src.url, ok: false, error: String(e.message || e) });
    }
  }

  if (anySuccess) {
    sqlite.prepare(`INSERT OR REPLACE INTO meta (key, value) VALUES ('radar_last_run_day', ?)`).run(today);
    sqlite.prepare(`INSERT OR REPLACE INTO meta (key, value) VALUES ('radar_status', ?)`).run(
      JSON.stringify({ checkedAt: new Date().toISOString(), day: today, results })
    );
  } else {
    sqlite.prepare(`INSERT OR REPLACE INTO meta (key, value) VALUES ('radar_last_attempt', ?)`).run(
      JSON.stringify({ at: new Date().toISOString(), ok: false, results })
    );
  }

  return getRadarStatus();
}

export function getRadarStatus() {
  const { sqlite } = getDb();
  const status = sqlite.prepare(`SELECT value FROM meta WHERE key = 'radar_status'`).get();
  const attempt = sqlite.prepare(`SELECT value FROM meta WHERE key = 'radar_last_attempt'`).get();
  return {
    status: status ? JSON.parse(status.value) : null,
    lastFailedAttempt: attempt ? JSON.parse(attempt.value) : null,
  };
}
