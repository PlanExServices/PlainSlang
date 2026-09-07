// UNIT-001 — pure domain tests for lib/domain/matching.js.
// Runs with Node's built-in test runner: npm test (no extra dependencies).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  decodeEntities, extractItems, stripTags,
  termInText, AMBIGUOUS, cleanTerm, normKey, safeJson,
} from '../lib/domain/matching.js';

// ---------- decodeEntities ----------
test('decodeEntities decodes the five common entities', () => {
  assert.equal(decodeEntities('&amp;&lt;&gt;&quot;&#39;'), '&<>"\'');
  assert.equal(decodeEntities('Skibidi &amp; rizz'), 'Skibidi & rizz');
});

// ---------- extractItems (RSS) ----------
test('extractItems parses plain and CDATA titles with links', () => {
  const xml = `
    <rss><channel>
      <item><title>Teen slang guide 2026</title><link>https://example.com/a</link></item>
      <item><title><![CDATA[What "gyat" means &amp; why]]></title><link>https://example.com/b</link></item>
      <item><title>No link item</title></item>
    </channel></rss>`;
  const items = extractItems(xml);
  assert.equal(items.length, 3);
  assert.deepEqual(items[0], { title: 'Teen slang guide 2026', link: 'https://example.com/a' });
  assert.equal(items[1].title, 'What "gyat" means & why');
  assert.equal(items[2].link, null);
});

// ---------- stripTags ----------
test('stripTags removes scripts, styles, and markup', () => {
  const html = '<div>hello<script>evil()</script><style>.x{}</style> <b>world</b></div>';
  const text = stripTags(html);
  assert.match(text, /hello/);
  assert.match(text, /world/);
  assert.doesNotMatch(text, /evil|\.x\{\}/);
});

// ---------- termInText (headline matching) ----------
test('termInText matches whole words only', () => {
  assert.equal(termInText('rizz', 'The rise of Rizz among teens'), true);
  assert.equal(termInText('rizz', 'Charizard evolves'), false); // substring, not word
  assert.equal(termInText('6-7', 'Why kids yell "6-7" in class'), true);
  assert.equal(termInText('cap', 'No cap: the truth'), true);
});

test('termInText survives regex-special characters in terms', () => {
  assert.equal(termInText('what (the) sigma?', 'kids say what (the) sigma? daily'), true);
});

test('AMBIGUOUS set contains common-word traps', () => {
  for (const w of ['tea', 'cap', 'fire', 'bet', 'w', 'l']) {
    assert.equal(AMBIGUOUS.has(w), true, `${w} should be excluded from matching`);
  }
  assert.equal(AMBIGUOUS.has('skibidi'), false);
});

// ---------- cleanTerm (radar headword cleanup) ----------
test('cleanTerm keeps real headwords', () => {
  assert.equal(cleanTerm('Rizz'), 'Rizz');
  assert.equal(cleanTerm(' GYAT — '), 'GYAT');
  assert.equal(cleanTerm('6-7'), '6-7');
  assert.equal(cleanTerm('11:11'), '11:11');
});

test('cleanTerm rejects noise', () => {
  assert.equal(cleanTerm('Example'), null); // ignore list
  assert.equal(cleanTerm('The Bark Team'), null);
  assert.equal(cleanTerm('https://example.com/x'), null);
  assert.equal(cleanTerm('What is this all about here'), null); // sentence-like
  assert.equal(cleanTerm(''), null);
  assert.equal(cleanTerm('x'.repeat(41)), null); // too long
});

// ---------- normKey ----------
test('normKey collapses punctuation variants to one key', () => {
  assert.equal(normKey('Bussin\u2019'), normKey("bussin'"));
  assert.equal(normKey('  Glow   Up '), 'glow up');
  assert.equal(normKey('\u201Cdemure\u201D'), 'demure');
});

// ---------- safeJson ----------
test('safeJson parses valid JSON and falls back on garbage', () => {
  assert.deepEqual(safeJson('["a","b"]', []), ['a', 'b']);
  assert.deepEqual(safeJson('not json', []), []);
  assert.deepEqual(safeJson(null, { x: 1 }), { x: 1 });
  assert.deepEqual(safeJson(undefined, []), []);
});
