// Live XSS probe: injects hostile strings through every user-controlled or
// feed-controlled surface of the static edition and checks nothing executes.
import { chromium, devices } from 'playwright-core';

const BASE = 'http://localhost:8090';
let alerts = 0;
const results = [];
const ok = (n, p, d = '') => { results.push({ n, p }); console.log(`${p ? 'PASS' : 'FAIL'}  ${n}${d ? ' — ' + d : ''}`); };

const browser = await chromium.launch();
const ctx = await browser.newContext({ ...devices['iPhone 13'] });
const page = await ctx.newPage();
page.on('dialog', async (d) => { alerts++; await d.dismiss(); });

// 1. hostile search input (renders back into value attr + drives innerHTML rerenders)
await page.goto(BASE + '/#/glossary', { waitUntil: 'networkidle' });
await page.waitForTimeout(1200);
await page.fill('#bsearch', `"><img src=x onerror=alert(1)>`);
await page.waitForTimeout(900);
ok('hostile search string does not execute', alerts === 0);
const stillWorks = await page.locator('.count-line').textContent();
ok('search survives hostile input', /of \d+ terms/.test(stillWorks || ''));

// 2. hostile localStorage note (rendered on saved page + detail)
await page.evaluate(() => {
  localStorage.setItem('plainslang.saved', JSON.stringify([1]));
  localStorage.setItem('plainslang.notes', JSON.stringify({ '1': `<img src=x onerror=alert(2)>` }));
});
await page.goto(BASE + '/#/saved', { waitUntil: 'networkidle' });
await page.waitForTimeout(1000);
ok('hostile note on saved page does not execute', alerts === 0);
const noteShown = await page.locator('.evidence-line').textContent();
ok('note rendered as text', (noteShown || '').includes('<img'), (noteShown || '').slice(0, 60));

await page.goto(BASE + '/#/term/1', { waitUntil: 'networkidle' });
await page.waitForTimeout(900);
ok('hostile note on detail page does not execute', alerts === 0);

// 3. hostile data.json simulation: intercept and poison feed-derived fields
await page.route('**/data.json', async (route) => {
  const res = await route.fetch();
  const d = await res.json();
  d.terms[0].trendingEvidence = { headline: `<script>alert(3)</script>`, link: `javascript:alert(4)`, feed: `<b onmouseover=alert(5)>x</b>` };
  d.terms[0].trending = true;
  d.terms[0].sourceUrl = 'javascript:alert(6)';
  d.trendingSnapshot.headlinesSample = [{ title: `<img src=x onerror=alert(7)>`, link: 'javascript:alert(8)', feed: 'x' }];
  await route.fulfill({ json: d });
});
await page.goto(BASE + '/#/term/' + 1, { waitUntil: 'networkidle' });
await page.waitForTimeout(1200);
ok('poisoned evidence headline does not execute', alerts === 0);
const hrefs = await page.$$eval('a[href^="javascript:"]', (as) => as.length);
ok('javascript: URLs blocked from href', hrefs === 0, `${hrefs} js-hrefs found`);
await page.goto(BASE + '/#/trending', { waitUntil: 'networkidle' });
await page.waitForTimeout(1200);
await page.tap('.verify-summary').catch(() => {});
await page.waitForTimeout(500);
const hrefs2 = await page.$$eval('a[href^="javascript:"]', (as) => as.length);
ok('poisoned headline sample blocked', alerts === 0 && hrefs2 === 0);

const fails = results.filter((r) => !r.p);
console.log(`\n===== ${results.length - fails.length}/${results.length} PASSED, alerts fired: ${alerts} =====`);
await browser.close();
process.exit(fails.length ? 1 : 0);
