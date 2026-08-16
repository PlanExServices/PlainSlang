import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { rowToTerm } from '@/lib/trending';

export const dynamic = 'force-dynamic';

function nyDayOfYear() {
  const now = new Date();
  const ny = new Date(now.toLocaleString('en-US', { timeZone: 'America/New_York' }));
  const start = new Date(ny.getFullYear(), 0, 0);
  return Math.floor((ny - start) / 86400000);
}

export async function GET() {
  const { sqlite } = getDb();

  const total = sqlite.prepare('SELECT COUNT(*) AS c FROM terms').get().c;
  const trending = sqlite.prepare('SELECT COUNT(*) AS c FROM terms WHERE trending = 1').get().c;
  const woty = sqlite.prepare('SELECT COUNT(*) AS c FROM terms WHERE is_woty = 1').get().c;
  const custom = sqlite.prepare('SELECT COUNT(*) AS c FROM terms WHERE is_seed = 0').get().c;

  // Age/difficulty/tag charts describe the teen glossary only — jargon packs
  // aren't age-graded and would skew the charts.
  const byAge = sqlite
    .prepare(`SELECT age_group AS g, COUNT(*) AS c FROM terms WHERE category = 'teen' GROUP BY age_group ORDER BY c DESC`)
    .all();
  const byDifficulty = sqlite
    .prepare(`SELECT difficulty AS d, COUNT(*) AS c FROM terms WHERE category = 'teen' GROUP BY difficulty`)
    .all();

  const byCategory = sqlite
    .prepare('SELECT category AS k, COUNT(*) AS c FROM terms GROUP BY category')
    .all();

  // Tag counts (tags stored as JSON arrays)
  const tagRows = sqlite.prepare(`SELECT tags FROM terms WHERE category = 'teen'`).all();
  const tagCounts = {};
  for (const r of tagRows) {
    try {
      for (const t of JSON.parse(r.tags || '[]')) {
        tagCounts[t] = (tagCounts[t] || 0) + 1;
      }
    } catch { /* skip bad rows */ }
  }
  const topTags = Object.entries(tagCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 14)
    .map(([tag, count]) => ({ tag, count }));

  // Slang of the Day: deterministic by NY day-of-year over seeded teen terms
  const seedRows = sqlite.prepare(`SELECT * FROM terms WHERE is_seed = 1 AND category = 'teen' ORDER BY id`).all();
  const sotd = seedRows.length > 0 ? rowToTerm(seedRows[nyDayOfYear() % seedRows.length]) : null;

  const newest = sqlite
    .prepare('SELECT * FROM terms WHERE is_seed = 0 ORDER BY created_at DESC LIMIT 3')
    .all()
    .map(rowToTerm);

  return NextResponse.json({
    total,
    trending,
    woty,
    custom,
    byAge,
    byDifficulty,
    byCategory,
    topTags,
    slangOfTheDay: sotd,
    newestCustom: newest,
  });
}
