import { NextResponse } from 'next/server';
import { ensureReady, counts, MODE } from '@/lib/data';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    await ensureReady();
    const c = await counts();
    return NextResponse.json({
      ok: true,
      db: MODE === 'pg' ? 'postgres' : 'supabase',
      totalTerms: c.total,
      seededTerms: c.seeded,
      trendingTerms: c.trending,
    });
  } catch (e) {
    return NextResponse.json({ ok: false, error: String(e.message || e) }, { status: 500 });
  }
}
