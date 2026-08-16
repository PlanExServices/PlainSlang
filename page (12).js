import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { rowToTerm } from '@/lib/trending';
import { validateTermInput } from '@/lib/validate';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  const { sqlite } = getDb();
  const { searchParams } = new URL(request.url);
  const q = (searchParams.get('q') || '').trim().toLowerCase();
  const ageGroup = searchParams.get('ageGroup');
  const trending = searchParams.get('trending');
  const category = searchParams.get('category');

  let sql = 'SELECT * FROM terms WHERE 1=1';
  const params = [];
  if (category) {
    // Match home category OR cross-linked ("related") categories.
    sql += ` AND (category = ? OR EXISTS (
      SELECT 1 FROM json_each(COALESCE(related, '[]')) WHERE json_each.value = ?
    ))`;
    params.push(category, category);
  }
  if (q) {
    sql += " AND (LOWER(term) LIKE ? OR LOWER(definition) LIKE ? OR LOWER(COALESCE(example, '')) LIKE ? OR LOWER(COALESCE(tags, '')) LIKE ?)";
    const like = `%${q}%`;
    params.push(like, like, like, like);
  }
  if (ageGroup) {
    sql += ' AND age_group = ?';
    params.push(ageGroup);
  }
  if (trending === '1') sql += ' AND trending = 1';
  sql += ' ORDER BY term COLLATE NOCASE';

  const rows = sqlite.prepare(sql).all(...params);
  return NextResponse.json({ terms: rows.map(rowToTerm) });
}

export async function POST(request) {
  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }
  const { ok, errors, clean } = validateTermInput(body);
  if (!ok) return NextResponse.json({ error: 'Validation failed', errors }, { status: 400 });

  const { sqlite } = getDb();
  const now = new Date().toISOString();
  const result = sqlite
    .prepare(
      `INSERT INTO terms (term, emoji, definition, example, notes, age_group, difficulty, say,
        source_name, source_url, tags, is_woty, trending, is_seed, category, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, 0, 0, ?, ?, ?)`
    )
    .run(
      clean.term, clean.emoji, clean.definition, clean.example, clean.notes,
      clean.ageGroup, clean.difficulty, clean.say, clean.sourceName, clean.sourceUrl,
      JSON.stringify(clean.tags), clean.category, now, now
    );
  const row = sqlite.prepare('SELECT * FROM terms WHERE id = ?').get(result.lastInsertRowid);
  return NextResponse.json({ term: rowToTerm(row) }, { status: 201 });
}
