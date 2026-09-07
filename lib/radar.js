import { getMeta, setMeta, allTermRows } from './data';
import { emitEvent } from './events';
import { stripTags, cleanTerm, normKey } from './domain/matching';

// Daily slang radar: re-scan Bark and Axis parent guides for terms we don't
// have yet. New terms are reported as REVIEW CANDIDATES with their source —
// we never auto-write definitions (Rule: no invented meanings).

// Shared headword extractors
function barkExtract(html) {
  const found = new Set();
  const text = stripTags(html);
  const re = /<(?:strong|b)>\s*(?:<em>|<i>)?\s*([^<>]{1,40}?)\s*(?:<\/em>|<\/i>)?\s*<\/(?:strong|b)>/gi;
  let m;
  while ((m = re.exec(html)) !== null) {
    const t = cleanTerm(m[1]);
    if (t) found.add(t);
  }
  return { terms: [...found], textLength: text.length };
}

function axisExtract(html) {
  const found = new Set();
  const re = /<(?:strong|b)>\s*([^<>]{1,40}?)\s*<\/(?:strong|b)>\s*(?:=|&#8211;|—|–)/gi;
  let m;
  while ((m = re.exec(html)) !== null) {
    const t = cleanTerm(m[1]);
    if (t) found.add(t);
  }
  if (found.size < 20) {
    const re2 = /<(?:strong|b)>\s*([^<>]{1,40}?)\s*<\/(?:strong|b)>/gi;
    while ((m = re2.exec(html)) !== null) {
      const t = cleanTerm(m[1]);
      if (t) found.add(t);
    }
  }
  return { terms: [...found], textLength: stripTags(html).length };
}

// All seven Bark/Axis guide pages are watched daily. Lesson learned: watching
// only the flagship pages made us discover the emoji/drug/sexting/gaming/B2S
// guides late. If either site publishes a new guide, add it here.
const RADAR_SOURCES = [
  {
    name: 'Bark — Teen Slang & Text Codes',
    url: 'https://www.bark.us/blog/teen-text-speak-codes-every-parent-should-know/',
    extract: barkExtract,
  },
  {
    name: 'Bark — Gaming Terms Glossary',
    url: 'https://www.bark.us/blog/gaming-terms/',
    extract: barkExtract,
  },
  {
    name: 'Bark — Emoji Slang Guide',
    url: 'https://www.bark.us/blog/emoji-slang-guide/',
    extract: barkExtract,
  },
  {
    name: 'Bark — Drug Slang & Emojis',
    url: 'https://www.bark.us/blog/drug-slang-emojis/',
    extract: barkExtract,
  },
  {
    name: 'Bark — Sexual Slang & Sexting Codes',
    url: 'https://www.bark.us/blog/sexual-slang/',
    extract: barkExtract,
  },
  {
    name: 'Bark — TikTok Slang Guide',
    url: 'https://www.bark.us/blog/tiktok-slang/',
    extract: barkExtract,
  },
  {
    name: 'Axis — Teen Slang, Back-to-School Edition',
    url: 'https://axis.org/resource/a-parents-guide-to-teen-slang-back-to-school-edition/',
    extract: axisExtract,
  },
  {
    name: 'Axis — A Parent\u2019s Guide to Teen Slang',
    url: 'https://axis.org/resource/a-parent-guide-to-teen-slang/',
    extract: axisExtract,
  },
];

function nyDateString(d = new Date()) {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'America/New_York' }).format(d);
}

// ---------------------------------------------------------------------------
// DISCOVERY: watch the sites' index pages for NEW guide articles we don't
// already track. Anything new whose slug looks slang-related is reported as a
// new-article candidate (never auto-ingested — a human adds it to
// RADAR_SOURCES after review).
const DISCOVERY_SOURCES = [
  {
    name: 'Bark blog index',
    url: 'https://www.bark.us/blog/',
    linkRe: 'href="(https:\\/\\/www\\.bark\\.us\\/blog\\/[a-z0-9-]+\\/)"',
  },
  {
    name: 'Axis cultural-issues index',
    url: 'https://axis.org/parenting-theme/cultural-issues/',
    linkRe: 'href="(https:\\/\\/axis\\.org\\/resource\\/[a-z0-9-]+\\/)"',
  },
];

// Slugs that suggest a slang/terms/emoji guide worth tracking.
const GUIDE_HINT = /slang|emoji|terms|codes|acronym|dictionary|glossary|speak|lingo|jargon|texting/i;

const KNOWN_GUIDE_URLS = new Set([
  'https://www.bark.us/blog/teen-text-speak-codes-every-parent-should-know/',
  'https://www.bark.us/blog/gaming-terms/',
  'https://www.bark.us/blog/emoji-slang-guide/',
  'https://www.bark.us/blog/drug-slang-emojis/',
  'https://www.bark.us/blog/sexual-slang/',
  'https://www.bark.us/blog/tiktok-slang/',
  'https://axis.org/resource/a-parent-guide-to-teen-slang/',
  'https://axis.org/resource/a-parents-guide-to-teen-slang-back-to-school-edition/',
  'https://axis.org/resource/a-parent-guide-to-emoji/',
]);

// Pages matching GUIDE_HINT that were reviewed and rejected as non-guides.
const REVIEWED_NOT_GUIDES = new Set([]);

async function discoverNewGuides() {
  const findings = [];
  for (const src of DISCOVERY_SOURCES) {
    try {
      const res = await fetch(src.url, {
        headers: { 'user-agent': 'PlainSlang/1.0 (guide discovery; respects robots)' },
        signal: AbortSignal.timeout(20000),
        cache: 'no-store',
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const html = await res.text();
      const seen = new Set();
      const re = new RegExp(src.linkRe, 'g');
      let m;
      while ((m = re.exec(html)) !== null) seen.add(m[1]);
      const newGuides = [...seen].filter(
        (u) => GUIDE_HINT.test(u) && !KNOWN_GUIDE_URLS.has(u) && !REVIEWED_NOT_GUIDES.has(u)
      );
      findings.push({ index: src.name, ok: true, linksScanned: seen.size, newGuideUrls: newGuides });
    } catch (e) {
      findings.push({ index: src.name, ok: false, error: String(e.message || e) });
    }
  }
  return findings;
}

export async function runRadar({ force = false } = {}) {
  const today = nyDateString();
  const lastRun = await getMeta('radar_last_run_day');

  if (!force && lastRun === today) {
    return getRadarStatus();
  }

  const known = new Set();
  const termRows = await allTermRows();
  for (const r of termRows) {
    const k = normKey(r.term);
    known.add(k);
    known.add(k.replace(/[^a-z0-9 ]/g, ''));
    known.add(k.replace(/\s*\p{Extended_Pictographic}+\s*$/u, '').trim());
  }
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
    ['ate that', 'ate'], ['ate and left no crumbs', 'left no crumbs'],
    ['choppleganger', 'choppelganger'], ['hits different', 'hit different'],
    ['lit/turnt/turnt up', 'lit'], ['yapping', 'yapper'], ['spam', 'spam account'],
    ['boo\u2019d (or booed) up', 'boo'], ['bougie/boujee', 'bougie'],
    ['clock/clocking', 'clock it'], ['_____ core/coded', '-core / -coded'],
    ['deada**', 'deadass'], ['glazing', 'glaze'], ['ick/the ick', 'ick'],
    ['live/living', 'live / living'], ['mood', 'a mood'], ['period', 'periodt'],
    ['pick-me girl', 'pick-me'], ['pulling/pulled', 'pulling'],
    ['rip/rip me', 'rip me'], ['wig snatched', 'wig'],
    // gaming-guide + emoji-guide + B2S variant headwords
    ['wrekd/wrecked', 'rekt'], ['wrekd', 'rekt'], ['wrecked', 'rekt'],
    ['skins', 'skin'], ['sweat', 'sweaty'], ['cod', 'twitch'],
    ['boss', 'mob'], ['mods', 'mod'], ['esports', 'esports'],
    ['maxxing as a general suffix', '-maxxing'], ['"maxxing" as a general suffix', '-maxxing'],
    ['big chungus life', 'chungus'], ['"big chungus life"', 'chungus'],
    ['community dih', 'community dih / puh'], ['community puh', 'community dih / puh'],
    ['ifykyk', 'iykyk'], ['op', 'opp'], ['lore drop', 'lore'],
    ['frame mogged', 'frame mogged'], ['granola', 'granola'],
    // 7-source scan noise + variants
    ['easter', 'easter egg'], ['egg', 'easter egg'], ['seggs', 's 🥚 s (seggs)'],
    ['recession indicators', 'recession indicator'], ['or za', 'zaza'],
    ['snow', 'snow / yayo'], ['yayo', 'snow / yayo'],
    // tiktok-guide headword variants
    ['credit card slam', 'credit card slam 💥💳💥'], ['p ⭐️', 'p ⭐ (porn star)'],
    ['it\u2019s the  for me', 'it\u2019s the ___ for me'], ['its the  for me', 'it\u2019s the ___ for me'],
    ['you\u2019re wrong but go off', 'go off'], ['we stan a queen/king', 'stan'],
    ['simp nation', 'simp'], ['it really do be like that sometimes', 'it really do be like that'],
    ['tiktok slang and trends', 'tiktok slang and trends'],
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

  // Discovery pass: are there NEW guide articles on the index pages?
  const discovery = await discoverNewGuides();

  if (anySuccess) {
    await setMeta('radar_last_run_day', today);
    await setMeta('radar_status', JSON.stringify({ checkedAt: new Date().toISOString(), day: today, results, discovery }));
    emitEvent('radar-updated', {
      newCandidates: results.filter((r) => r.ok).reduce((n, r) => n + r.newCandidates.length, 0),
    });
  } else {
    await setMeta('radar_last_attempt', JSON.stringify({ at: new Date().toISOString(), ok: false, results }));
  }

  return getRadarStatus();
}

export async function getRadarStatus() {
  const [statusRaw, attemptRaw] = await Promise.all([
    getMeta('radar_status'),
    getMeta('radar_last_attempt'),
  ]);
  return {
    status: statusRaw ? JSON.parse(statusRaw) : null,
    lastFailedAttempt: attemptRaw ? JSON.parse(attemptRaw) : null,
  };
}
