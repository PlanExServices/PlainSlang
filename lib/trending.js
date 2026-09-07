import { getMeta, setMeta, allTermRows, resetTrendingFlags, trendingTerms, rowToTerm } from './data';
import { emitEvent } from './events';
import { extractItems, termInText, AMBIGUOUS } from './domain/matching';

export { rowToTerm };

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

async function fetchFeed(feed) {
  const res = await fetch(feed.url, {
    headers: { 'user-agent': 'PlainSlang/1.0 (trending verification; contact: local install)' },
    signal: AbortSignal.timeout(12000),
    cache: 'no-store',
  });
  if (!res.ok) throw new Error(`${feed.name}: HTTP ${res.status}`);
  return extractItems(await res.text());
}

async function wiktionaryConfirm(term) {
  try {
    const res = await fetch(
      `https://en.wiktionary.org/api/rest_v1/page/summary/${encodeURIComponent(term.replace(/ /g, '_'))}`,
      { signal: AbortSignal.timeout(8000), cache: 'no-store' }
    );
    return res.ok;
  } catch {
    return null;
  }
}

export async function refreshTrending({ force = false } = {}) {
  const today = nyDateString();
  const lastRun = await getMeta('trending_last_run_day');

  if (!force && lastRun === today) {
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
    await setMeta('trending_last_attempt',
      JSON.stringify({ at: new Date().toISOString(), ok: false, sourcesChecked }));
    return getTrendingStatus();
  }

  const teenRows = await allTermRows({ category: 'teen' });
  const matches = [];
  for (const row of teenRows) {
    if (AMBIGUOUS.has(row.term.toLowerCase())) continue;
    const hit = headlines.find((h) => termInText(row.term, h.title));
    if (hit) matches.push({ id: row.id, term: row.term, headline: hit.title, link: hit.link, feed: hit.feed });
  }

  const wikiResults = [];
  for (const s of matches.slice(0, 3)) {
    const ok = await wiktionaryConfirm(s.term);
    wikiResults.push({ term: s.term, confirmed: ok });
  }

  const now = new Date().toISOString();
  await resetTrendingFlags(matches, {
    headline: 'Official Word of the Year — stays trending per policy',
    feed: 'PlainSlang policy',
  });
  await setMeta('trending_last_run_day', today);
  await setMeta('trending_status', JSON.stringify({
    verifiedAt: now,
    day: today,
    sourcesChecked,
    matchedCount: matches.length,
    headlinesSample: headlines.slice(0, 12),
    wiktionarySample: wikiResults,
  }));

  const status = await getTrendingStatus();
  emitEvent('trending-updated', {
    matchedCount: matches.length,
    trendingCount: status.terms.length,
    verifiedAt: now,
  });
  return status;
}

export async function getTrendingStatus() {
  const [statusRaw, attemptRaw, terms] = await Promise.all([
    getMeta('trending_status'),
    getMeta('trending_last_attempt'),
    trendingTerms(),
  ]);
  return {
    status: statusRaw ? JSON.parse(statusRaw) : null,
    lastFailedAttempt: attemptRaw ? JSON.parse(attemptRaw) : null,
    terms,
  };
}
