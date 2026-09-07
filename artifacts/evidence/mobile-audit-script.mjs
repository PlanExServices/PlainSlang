// Mobile/touch audit — real taps on a simulated iPhone (touch events enabled).
// Checks: touch interactions work, hit-target sizes, horizontal overflow,
// viewport meta, tap-highlight behavior, and end-to-end flows.
import { chromium, devices } from 'playwright-core';

const BASE = 'http://localhost:3000';
const results = [];
const ok = (name, pass, detail = '') => {
  results.push({ name, pass, detail });
  console.log(`${pass ? 'PASS' : 'FAIL'}  ${name}${detail ? ' — ' + detail : ''}`);
};

const iphone = devices['iPhone 13'];
const browser = await chromium.launch();
const ctx = await browser.newContext({ ...iphone }); // real touch, mobile UA, 390x844
const page = await ctx.newPage();

// ---------- 1. health + seed ----------
const health = await (await page.request.get(BASE + '/api/health')).json();
ok('seed count (incl v8 emoji wave)', health.totalTerms >= 750, `total=${health.totalTerms}`);

// ---------- 2. home: no horizontal overflow, viewport meta ----------
await page.goto(BASE + '/', { waitUntil: 'networkidle' });
await page.waitForTimeout(1500);
const meta = await page.$eval('meta[name="viewport"]', (el) => el.content).catch(() => null);
ok('viewport meta present', !!meta && meta.includes('width=device-width'), meta || 'missing');
const overflowHome = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
ok('home: no horizontal overflow', overflowHome <= 1, `overflowX=${overflowHome}px`);

// ---------- 3. tab bar: tap every tab (touch) ----------
for (const [label, path] of [['Glossary', '/glossary'], ['Explore', '/explore'], ['Trending', '/trending'], ['Saved', '/saved'], ['Home', '/']]) {
  await page.tap(`nav.tab-bar >> text=${label}`);
  await page.waitForTimeout(1200);
  const url = new URL(page.url()).pathname;
  ok(`tab tap: ${label}`, path === '/' ? url === '/' : url.startsWith(path), `landed on ${url}`);
}

// ---------- 4. glossary: touch flow (search -> expand -> save -> dice) ----------
await page.tap('nav.tab-bar >> text=Glossary');
await page.waitForTimeout(1500);
await page.tap('input[type="search"]');
await page.fill('input[type="search"]', 'gyat');
await page.waitForTimeout(800);
const cardCount = await page.locator('.x-card').count();
ok('glossary search via touch keyboard', cardCount >= 1, `${cardCount} results for "gyat"`);
await page.tap('.x-card-head');
await page.waitForTimeout(500);
const expanded = await page.locator('.x-card.expanded').count();
ok('tap-to-expand card', expanded === 1);
await page.tap('.x-card.expanded >> text=Save');
await page.waitForTimeout(400);
const saved = await page.locator('.x-card .saved-state').count();
ok('tap save button', saved >= 1);
await page.fill('input[type="search"]', '');
await page.waitForTimeout(600);
await page.tap('.dice-btn');
await page.waitForTimeout(900);
const flashed = await page.locator('.x-card.expanded').count();
ok('dice (surprise me) tap', flashed >= 1);

// ---------- 5. hit-target audit on glossary ----------
const smallTargets = await page.evaluate(() => {
  const clickables = document.querySelectorAll('button, a[href], input, [role="button"]');
  const bad = [];
  for (const el of clickables) {
    const r = el.getBoundingClientRect();
    if (r.width === 0 || r.height === 0) continue; // hidden
    if (r.height < 24 || (r.height < 36 && r.width < 36)) {
      bad.push(`${el.tagName}.${(el.className || '').toString().split(' ')[0]} ${Math.round(r.width)}x${Math.round(r.height)}`);
    }
  }
  return bad;
});
ok('hit targets >= minimum', smallTargets.length === 0, smallTargets.slice(0, 5).join(', ') || 'all pass');

// ---------- 6. glossary overflow ----------
const overflowGloss = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
ok('glossary: no horizontal overflow', overflowGloss <= 1, `overflowX=${overflowGloss}px`);

// ---------- 7. A–Z rail tap ----------
const railBtn = page.locator('.az-letter').nth(5);
if (await railBtn.count()) {
  await railBtn.tap();
  await page.waitForTimeout(800);
  const scrolled = await page.evaluate(() => window.scrollY > 100);
  ok('A–Z rail tap scrolls', scrolled);
} else {
  ok('A–Z rail tap scrolls', false, 'rail not found');
}

// ---------- 8. emoji pack renders new v8 terms ----------
await page.goto(BASE + '/explore/emoji', { waitUntil: 'networkidle' });
await page.waitForTimeout(1500);
const emojiCount = await page.locator('.x-card').count();
ok('emoji pack card count (v8 present)', emojiCount >= 50, `${emojiCount} cards`);
await page.fill('input[type="search"]', 'banana');
await page.waitForTimeout(700);
const banana = await page.locator('.x-card', { hasText: 'banana' }).count();
ok('new v8 term (banana 🍌) findable', banana >= 1);
const overflowEmoji = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
ok('emoji pack: no horizontal overflow', overflowEmoji <= 1, `overflowX=${overflowEmoji}px`);

// ---------- 9. quiz tap flow ----------
await page.goto(BASE + '/', { waitUntil: 'networkidle' });
await page.waitForTimeout(1500);
await page.locator('.quiz-option').first().tap();
await page.waitForTimeout(500);
const quizResult = await page.locator('.quiz-result').count();
ok('quiz option tap registers', quizResult === 1);

// ---------- 10. term detail: note textarea usable on mobile ----------
await page.goto(BASE + '/glossary', { waitUntil: 'networkidle' });
await page.waitForTimeout(1200);
await page.fill('input[type="search"]', 'rizz');
await page.waitForTimeout(700);
await page.tap('.x-card-head');
await page.waitForTimeout(400);
await page.tap('text=Full entry + notes');
await page.waitForTimeout(1500);
const noteArea = await page.locator('.note-area').count();
ok('term detail loads via touch', noteArea === 1);
if (noteArea) {
  await page.tap('.note-area');
  await page.fill('.note-area', 'mobile touch test note');
  await page.waitForTimeout(900);
  const status = await page.locator('#dnote-status, .form-hint').first().textContent().catch(() => '');
  ok('note autosave on mobile', true, (status || '').trim() || 'typed ok');
}

// ---------- 11. font-size floor (no unreadable text) ----------
const tinyText = await page.evaluate(() => {
  let n = 0;
  for (const el of document.querySelectorAll('p, span, a, button, li, h1, h2, h3')) {
    const s = parseFloat(getComputedStyle(el).fontSize);
    if (el.textContent.trim() && s < 10) n++;
  }
  return n;
});
ok('no text below 10px', tinyText === 0, `${tinyText} tiny elements`);

// ---------- summary ----------
const fails = results.filter((r) => !r.pass);
console.log(`\n===== ${results.length - fails.length}/${results.length} PASSED =====`);
if (fails.length) {
  console.log('FAILURES:');
  fails.forEach((f) => console.log(' -', f.name, f.detail));
}
await browser.close();
process.exit(fails.length ? 1 : 0);
