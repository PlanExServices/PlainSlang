import { NextResponse } from 'next/server';
import { ensureReady, listTerms, createTerm } from '@/lib/data';
import { validateTermInput } from '@/lib/validate';
import { emitEvent } from '@/lib/events';
import { rateLimit } from '@/lib/ratelimit';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  try {
    await ensureReady();
    const terms = await listTerms({
      q: (searchParams.get('q') || '').trim().toLowerCase() || undefined,
      ageGroup: searchParams.get('ageGroup') || undefined,
      trending: searchParams.get('trending') === '1',
      category: searchParams.get('category') || undefined,
    });
    return NextResponse.json({ terms });
  } catch (e) {
    const status = e.code === 'READ_ONLY' ? 403 : 500;
    return NextResponse.json({ error: String(e.message || e) }, { status });
  }
}

export async function POST(request) {
  const limited = rateLimit(request, 'write', 20, 60_000); // 20 writes/min/IP
  if (limited) return limited;
  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }
  const { ok, errors, clean } = validateTermInput(body);
  if (!ok) return NextResponse.json({ error: 'Validation failed', errors }, { status: 400 });

  try {
    await ensureReady();
    const term = await createTerm(clean);
    emitEvent('term-created', { id: term.id, term: term.term, category: term.category });
    return NextResponse.json({ term }, { status: 201 });
  } catch (e) {
    const status = e.code === 'READ_ONLY' ? 403 : 500;
    return NextResponse.json({ error: String(e.message || e) }, { status });
  }
}
