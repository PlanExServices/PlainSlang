const AGE_IDS = ['elementary', 'middle', 'high_school', 'college', 'gen_alpha', 'gen_z'];
const DIFF_IDS = ['easy', 'medium', 'hard'];
const CATEGORY_IDS = ['teen', 'texting', 'gaming', 'coding', 'corporate', 'safety', 'emoji'];

function str(v, max) {
  if (v === undefined || v === null) return null;
  const s = String(v).trim();
  if (!s) return null;
  return s.slice(0, max);
}

export function validateTermInput(body) {
  const errors = [];
  const clean = {
    term: str(body.term, 80),
    emoji: str(body.emoji, 16) || '',
    definition: str(body.definition, 2000),
    example: str(body.example, 500),
    notes: str(body.notes, 2000),
    ageGroup: str(body.ageGroup, 40),
    difficulty: str(body.difficulty, 20) || 'medium',
    say: str(body.say, 120),
    category: str(body.category, 40) || 'teen',
    sourceName: str(body.sourceName, 200),
    sourceUrl: str(body.sourceUrl, 500),
    tags: Array.isArray(body.tags)
      ? body.tags.map((t) => String(t).trim().toLowerCase().slice(0, 40)).filter(Boolean).slice(0, 10)
      : [],
  };

  if (!clean.term) errors.push('Term is required.');
  if (!clean.definition) errors.push('Definition is required.');
  if (!clean.ageGroup || !AGE_IDS.includes(clean.ageGroup)) errors.push('Valid age group is required.');
  if (!DIFF_IDS.includes(clean.difficulty)) errors.push('Difficulty must be easy, medium, or hard.');
  if (!CATEGORY_IDS.includes(clean.category)) errors.push('Category must be one of: teen, texting, gaming, coding, corporate, safety, emoji.');
  if (clean.sourceUrl && !/^https?:\/\//i.test(clean.sourceUrl)) errors.push('Source URL must start with http(s)://');

  return { ok: errors.length === 0, errors, clean };
}
