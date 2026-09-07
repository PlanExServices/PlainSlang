// PlainSlang domain: pure matching/parsing rules (framework-independent).
// No imports from React, Next, pg, or any platform library — POL-PORTABLE-019.
// Consumed by lib/trending.js (headline matching) and lib/radar.js (guide scan).

// ---------------------------------------------------------------------------
// RSS / HTML parsing
// ---------------------------------------------------------------------------
export function decodeEntities(s) {
  return s
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'");
}

export function extractItems(xml) {
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

export function stripTags(html) {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<[^>]+>/g, ' ');
}

// ---------------------------------------------------------------------------
// Headline term matching (trending verification)
// ---------------------------------------------------------------------------

// Terms too generic to match on a single common English word.
export const AMBIGUOUS = new Set([
  'ate', 'basic', 'bet', 'cap', 'chat', 'cooked', 'crash out', 'dog', 'extra',
  'fire', 'flex', 'ghost', 'hits', 'ice', 'lit', 'mid', 'salty', 'ship',
  'slaps', 'snack', 'tea', 'w', 'l', 'chad', 'karen', 'slay', 'bot',
]);

// Word-boundary match of a term inside a headline (case-insensitive).
export function termInText(term, text) {
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

// ---------------------------------------------------------------------------
// Radar term normalization (guide scanning)
// ---------------------------------------------------------------------------

export const IGNORE = new Set([
  'example', 'examples', 'note', 'warning', 'download guide', 'read', 'begin', 'give',
  'get started', 'the bark team', 'facebook', 'twitter', 'email', 'watch on',
  'key takeaways from this blog post', 'download the pdf', 'more resources',
  'text slang decoded', 'older teen slang terms', 'teen slang emoji icons',
  'the dictionary of slang', 'a final thought', 'popular slang emoji meanings',
  'points', 'big',
  // page furniture from the additional Bark/Axis guides
  'slang terms', 'slang', 'emojis', 'drug slang emoji glossary',
  'common drug slang terms', 'resources for families', 'study in the u.k.',
  'petition', 'sign the petition', 'popular gaming terms and acronyms',
  'tiktok slang and trends', 'tiktok slang is always evolving',
  'queen/king', 'as you may know', 'help@bark.us',
  'for more resources,', 'for more resources', 'learn more',
]);

export function cleanTerm(raw) {
  let t = raw
    .replace(/&amp;/g, '&').replace(/&#8217;|&rsquo;/g, '\u2019').replace(/&#8216;/g, '\u2018')
    .replace(/&#8220;|&#8221;|&quot;/g, '').replace(/&nbsp;/g, ' ')
    .trim()
    .replace(/^\W+|[\s=:—–-]+$/g, '')
    .trim();
  if (!t || t.length < 1 || t.length > 40) return null;
  const lower = t.toLowerCase();
  if (IGNORE.has(lower)) return null;
  if (/^(what|this|the|a|an|if|so|and|are|it|here|use|read)\s/i.test(t) && t.split(' ').length > 3) return null;
  if (/^https?:/i.test(t)) return null;
  if (t.includes('@')) return null;
  if (/^\d{1,2}:\d{2}$/.test(t) === false && /^[\d\s.,%]+$/.test(t) && !/^\d+([:-]\d+)?$/.test(t)) return null;
  return t;
}

// Normalize for matching against the library (strip punctuation variants).
export function normKey(t) {
  return t.toLowerCase()
    .replace(/[\u2018\u2019']/g, '')
    .replace(/[\u201C\u201D"]/g, '')
    .replace(/\s+/g, ' ')
    .replace(/^-|-$/g, '')
    .trim();
}

// ---------------------------------------------------------------------------
// Shared row shape
// ---------------------------------------------------------------------------
export function safeJson(s, fallback) {
  if (!s) return fallback;
  try {
    return JSON.parse(s);
  } catch {
    return fallback;
  }
}
