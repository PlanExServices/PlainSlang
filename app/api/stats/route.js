import { NextResponse } from 'next/server';
import { ensureReady, counts, allTermRows, rowToTerm } from '@/lib/data';

export const dynamic = 'force-dynamic';

function nyDayOfYear() {
  const now = new Date();
  const ny = new Date(now.toLocaleString('en-US', { timeZone: 'America/New_York' }));
  const start = new Date(ny.getFullYear(), 0, 0);
  return Math.floor((ny - start) / 86400000);
}

export async function GET() {
  try {
    await ensureReady();
    const c = await counts();
    const all = await allTermRows();

    const teen = all.filter((r) => r.category === 'teen');
    const custom = all.filter((r) => !r.is_seed);
    const woty = all.filter((r) => r.is_woty).length;

    const byAgeMap = {};
    const byDiffMap = {};
    const byCatMap = {};
    const tagCounts = {};
    for (const r of all) byCatMap[r.category] = (byCatMap[r.category] || 0) + 1;
    for (const r of teen) {
      byAgeMap[r.age_group] = (byAgeMap[r.age_group] || 0) + 1;
      byDiffMap[r.difficulty] = (byDiffMap[r.difficulty] || 0) + 1;
      try {
        const tags = typeof r.tags === 'string' ? JSON.parse(r.tags || '[]') : r.tags || [];
        for (const t of tags) tagCounts[t] = (tagCounts[t] || 0) + 1;
      } catch { /* skip bad rows */ }
    }

    const byAge = Object.entries(byAgeMap).map(([g, n]) => ({ g, c: n })).sort((a, b) => b.c - a.c);
    const byDifficulty = Object.entries(byDiffMap).map(([d, n]) => ({ d, c: n }));
    const byCategory = Object.entries(byCatMap).map(([k, n]) => ({ k, c: n }));
    const topTags = Object.entries(tagCounts)
      .sort((a, b) => b[1] - a[1]).slice(0, 14)
      .map(([tag, count]) => ({ tag, count }));

    const seededTeen = teen.filter((r) => r.is_seed).sort((a, b) => a.id - b.id);
    const sotd = seededTeen.length > 0
      ? rowToTerm(seededTeen[nyDayOfYear() % seededTeen.length])
      : null;

    const newestCustom = custom
      .sort((a, b) => String(b.created_at).localeCompare(String(a.created_at)))
      .slice(0, 3)
      .map(rowToTerm);

    return NextResponse.json({
      total: c.total,
      trending: c.trending,
      woty,
      custom: custom.length,
      byAge,
      byDifficulty,
      byCategory,
      topTags,
      slangOfTheDay: sotd,
      newestCustom,
    });
  } catch (e) {
    return NextResponse.json({ error: String(e.message || e) }, { status: 500 });
  }
}
