import { NextResponse } from 'next/server';
import { ensureReady, getTerm, updateTerm, deleteTerm } from '@/lib/data';
import { validateTermInput } from '@/lib/validate';
import { emitEvent } from '@/lib/events';
import { rateLimit } from '@/lib/ratelimit';

export const dynamic = 'force-dynamic';

function getId(params) {
  const id = Number(params.id);
  return Number.isInteger(id) && id > 0 ? id : null;
}

export async function GET(_request, { params }) {
  const id = getId(await params);
  if (!id) return NextResponse.json({ error: 'Invalid id' }, { status: 400 });
  try {
    await ensureReady();
    const term = await getTerm(id);
    if (!term) return NextResponse.json({ error: 'Term not found' }, { status: 404 });
    return NextResponse.json({ term });
  } catch (e) {
    const status = e.code === 'READ_ONLY' ? 403 : 500;
    return NextResponse.json({ error: String(e.message || e) }, { status });
  }
}

export async function PUT(request, { params }) {
  const limited = rateLimit(request, 'write', 20, 60_000);
  if (limited) return limited;
  const id = getId(await params);
  if (!id) return NextResponse.json({ error: 'Invalid id' }, { status: 400 });
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
    const term = await updateTerm(id, clean, !body.category);
    if (!term) return NextResponse.json({ error: 'Term not found' }, { status: 404 });
    emitEvent('term-updated', { id: term.id, term: term.term, category: term.category });
    return NextResponse.json({ term });
  } catch (e) {
    const status = e.code === 'READ_ONLY' ? 403 : 500;
    return NextResponse.json({ error: String(e.message || e) }, { status });
  }
}

export async function DELETE(request, { params }) {
  const limited = rateLimit(request, 'write', 20, 60_000);
  if (limited) return limited;
  const id = getId(await params);
  if (!id) return NextResponse.json({ error: 'Invalid id' }, { status: 400 });
  try {
    await ensureReady();
    const name = await deleteTerm(id);
    if (name === null) return NextResponse.json({ error: 'Term not found' }, { status: 404 });
    emitEvent('term-deleted', { id, term: name });
    return NextResponse.json({ deleted: true });
  } catch (e) {
    const status = e.code === 'READ_ONLY' ? 403 : 500;
    return NextResponse.json({ error: String(e.message || e) }, { status });
  }
}
