import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  const { sqlite } = getDb(); // getDb seeds on first hit
  const total = sqlite.prepare('SELECT COUNT(*) AS c FROM terms').get().c;
  const seeded = sqlite.prepare('SELECT COUNT(*) AS c FROM terms WHERE is_seed = 1').get().c;
  const trending = sqlite.prepare('SELECT COUNT(*) AS c FROM terms WHERE trending = 1').get().c;
  return NextResponse.json({ ok: true, totalTerms: total, seededTerms: seeded, trendingTerms: trending });
}
