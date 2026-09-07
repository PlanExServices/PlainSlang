import { NextResponse } from 'next/server';
import { ensureReady, allTermRows } from '@/lib/data';

export const dynamic = 'force-dynamic';

// Returns one quiz question: a real term + 3 definitions (1 correct, 2 decoys from other real terms).
export async function GET() {
  try {
    await ensureReady();
    const teen = await allTermRows({ category: 'teen', isSeed: true });
    if (teen.length < 3) {
      return NextResponse.json({ error: 'Not enough terms for a quiz' }, { status: 503 });
    }
    // pick 3 distinct random rows
    const picks = [];
    const used = new Set();
    while (picks.length < 3) {
      const r = teen[Math.floor(Math.random() * teen.length)];
      if (!used.has(r.id)) {
        used.add(r.id);
        picks.push(r);
      }
    }
    const answer = picks[0];
    const options = picks
      .map((r) => ({ id: r.id, definition: r.definition }))
      .sort(() => Math.random() - 0.5);
    return NextResponse.json({
      question: { id: answer.id, term: answer.term, emoji: answer.emoji },
      options,
      correctId: answer.id,
    });
  } catch (e) {
    return NextResponse.json({ error: String(e.message || e) }, { status: 500 });
  }
}
