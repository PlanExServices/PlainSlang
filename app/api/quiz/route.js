import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export const dynamic = 'force-dynamic';

// Returns one quiz question: a real term + 3 definitions (1 correct, 2 decoys from other real terms).
export async function GET() {
  const { sqlite } = getDb();
  const rows = sqlite
    .prepare(`SELECT id, term, emoji, definition FROM terms WHERE is_seed = 1 AND category = 'teen' ORDER BY RANDOM() LIMIT 3`)
    .all();
  if (rows.length < 3) {
    return NextResponse.json({ error: 'Not enough terms for a quiz' }, { status: 503 });
  }
  const answer = rows[0];
  const options = rows
    .map((r) => ({ id: r.id, definition: r.definition }))
    .sort(() => Math.random() - 0.5);
  return NextResponse.json({
    question: { id: answer.id, term: answer.term, emoji: answer.emoji },
    options,
    correctId: answer.id,
  });
}
