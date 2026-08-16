import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { rowToTerm } from '@/lib/trending';
import { validateTermInput } from '@/lib/validate';

export const dynamic = 'force-dynamic';

function getId(params) {
  const id = Number(params.id);
  return Number.isInteger(id) && id > 0 ? id : null;
}

export async function GET(_request, { params }) {
  const id = getId(await params);
  if (!id) return NextResponse.json({ error: 'Invalid id' }, { status: 400 });
  const { sqlite } = getDb();
  const row = sqlite.prepare('SELECT * FROM terms WHERE id = ?').get(id);
  if (!row) return NextResponse.json({ error: 'Term not found' }, { status: 404 });
  return NextResponse.json({ term: rowToTerm(row) });
}

export async function PUT(request, { params }) {
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

  const { sqlite } = getDb();
  const existing = sqlite.prepare('SELECT * FROM terms WHERE id = ?').get(id);
  if (!existing) return NextResponse.json({ error: 'Term not found' }, { status: 404 });

  sqlite
    .prepare(
      `UPDATE terms SET term = ?, emoji = ?, definition = ?, example = ?, notes = ?,
        age_group = ?, difficulty = ?, say = ?, source_name = ?, source_url = ?, tags = ?, category = ?, updated_at = ?
       WHERE id = ?`
    )
    .run(
      clean.term, clean.emoji, clean.definition, clean.example, clean.notes,
      clean.ageGroup, clean.difficulty, clean.say, clean.sourceName, clean.sourceUrl,
      JSON.stringify(clean.tags), body.category ? clean.category : existing.category, new Date().toISOString(), id
    );
  const row = sqlite.prepare('SELECT * FROM terms WHERE id = ?').get(id);
  return NextResponse.json({ term: rowToTerm(row) });
}

export async function DELETE(_request, { params }) {
  const id = getId(await params);
  if (!id) return NextResponse.json({ error: 'Invalid id' }, { status: 400 });
  const { sqlite } = getDb();
  const result = sqlite.prepare('DELETE FROM terms WHERE id = ?').run(id);
  if (result.changes === 0) return NextResponse.json({ error: 'Term not found' }, { status: 404 });
  return NextResponse.json({ deleted: true });
}
