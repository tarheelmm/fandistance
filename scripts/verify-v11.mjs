// v1.1 handoff verification checklist, run against the built app at 390 px (scenario A).
//   npm run build && npx vite preview --port 4173 &  →  node scripts/verify-v11.mjs
import { chromium } from 'playwright-core';
import { mkdirSync } from 'node:fs';

const base = 'http://localhost:4173/?nolaunch#';
const OUT = new URL('../acceptance/out/', import.meta.url).pathname;
mkdirSync(OUT, { recursive: true });
const b = await chromium.launch({ executablePath: process.env.CHROME ?? '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
const p = await b.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 });
const results = [];
const check = (name, ok, detail = '') => results.push({ name, ok, detail });
const shot = (n, full = false) => p.screenshot({ path: `${OUT}v11-${n}.png`, fullPage: full });
const text = () => p.evaluate(() => document.body.innerText);
const bg = (sel) => p.$eval(sel, (el) => getComputedStyle(el).backgroundColor);

await p.goto(base + '/');
await p.evaluate(() => localStorage.clear());
await p.goto(base + '/');
await p.waitForTimeout(400);
await p.click('.demo-tab');
await p.click('.demo-scen button:has(b:text-is("A"))');
await p.waitForTimeout(400);

// get today's ticket
await p.click('.ng-cta');
await p.waitForURL(/#\/ticket\/[^/]+$/, { timeout: 12000 });
await p.waitForTimeout(600);
await shot('seat', true);
const seatTxt = await text();
check('Seat screen says "You’re counted for this game."', seatTxt.includes('You’re counted for this game.'));
check('Seat screen is dark', (await bg('.ts-screen')) === 'rgb(7, 16, 31)', await bg('.ts-screen'));
const matchup = await p.$eval('.ticket-matchup', (e) => e.textContent.trim());
check('Ticket reads BOSTON @ BALTIMORE', matchup === 'BOSTON @ BALTIMORE', matchup);

await p.click('.ts-enter');
await p.waitForTimeout(700);
await shot('hub', true);
check('Game Day hub is dark', (await bg('.gd')) === 'rgb(7, 16, 31)', await bg('.gd'));
check('Bottom nav stays dark on Game Day', (await p.$eval('.bottom-nav', (e) => e.className)).includes('dark'));
const tileColor = await p.$eval('.gd-tile strong', (e) => getComputedStyle(e).color);
check('Hub tile titles readable (light text)', tileColor === 'rgb(246, 241, 231)', tileColor);

for (const area of ['ballpark', 'play', 'create', 'bench', 'around', 'team']) {
  await p.click(`.gd-tile.tile-${area}`);
  await p.waitForTimeout(350);
  await shot(`area-${area}`, true);
  check(`Area ${area} is dark`, (await bg('.area')) === 'rgb(7, 16, 31)', await bg('.area'));
  if (area === 'play') check('Trivia question readable', (await p.$eval('.play-q', (e) => getComputedStyle(e).color)) === 'rgb(246, 241, 231)');
  if (area === 'ballpark') check('"Top moments" heading readable', (await p.$eval('.area-h h2', (e) => getComputedStyle(e).color)) === 'rgb(246, 241, 231)');
  if (area === 'bench') {
    const t = await text();
    check('Bench header reads "Baltimore Baseball game thread"', t.includes('BALTIMORE BASEBALL GAME THREAD') || t.includes('Baltimore Baseball game thread'));
  }
  if (area === 'around') check('Around You reads "143 Baltimore fans"', (await text()).includes('143 Baltimore fans'));
  await p.click('[aria-label="Back to Game Day Hub"]');
  await p.waitForTimeout(250);
}

// Passport
await p.click('.bn-tab:has-text("Passport")');
await p.waitForTimeout(600);
await shot('passport');
await shot('passport-full', true);
const ptxt = await text();
const nick = ['Orioles', 'Red Sox', 'Ravens', 'Hurricanes', "O's", 'O’s'].filter((n) => ptxt.includes(n));
check('No nicknames in Passport text', nick.length === 0, nick.join(', '));
const bigRow = await p.$eval('#jump-moments + .p-list small', (e) => e.textContent.trim()).catch(() => '');
check('Big games row reads like "Apr 11, 2027 · W 7–2 vs New York"', /^[A-Z][a-z]{2} \d+, \d{4} · [WL] \d+–\d+ (vs|@) [A-Z]/.test(bigRow), bigRow);
const perks = await p.$eval('.p-perks', (e) => e.innerText);
check('Team perks: 10 games on record in 2027', /10\s*games on record in 2027/.test(perks), perks.split('\n').slice(1, 3).join(' | '));
check('Team perks: Team thank-you Reached', /Team thank-you\s*Reached/.test(perks));
check('Team perks: "15 more to reach Remote member"', perks.includes('15 more to reach Remote member'));

// jump bar: tap each chip
const chips = await p.$$eval('.p-jump-chip', (els) => els.map((e) => e.dataset.j));
let jumpOk = true;
const misses = [];
for (const id of chips) {
  await p.click(`.p-jump-chip[data-j="${id}"]`);
  await p.waitForTimeout(900);
  const top = await p.$eval(`#jump-${id}`, (e) => e.getBoundingClientRect().top);
  const current = await p.$eval('.p-jump-chip[aria-current="true"]', (e) => e.dataset.j);
  const atEnd = await p.evaluate(() => window.innerHeight + window.scrollY >= document.body.scrollHeight - 2);
  if (!(Math.abs(top - 112) < 12 || atEnd) || current !== id) {
    jumpOk = false;
    misses.push(`${id}:top=${Math.round(top)},cur=${current}`);
  }
}
check('Each jump chip scrolls to its section', jumpOk, misses.join(' '));
await p.click('.p-jump-chip[data-j="stats"]');
await p.waitForTimeout(900);
await p.mouse.wheel(0, 1400);
await p.waitForTimeout(900);
const followed = await p.$eval('.p-jump-chip[aria-current="true"]', (e) => e.dataset.j);
check('Highlighted chip follows manual scroll', followed !== 'stats', followed);
await shot('passport-jump-scrolled');

await p.goto(base + '/passport/teams');
await p.waitForTimeout(500);
await shot('teams', true);
const teams = await text();
check('Your Teams: "Carolina Hockey · NHL · 1 game · … miles"', /Carolina Hockey\s*NHL · 1 game · [\d,]+ miles/.test(teams));
check('Your Teams: "Baltimore Football · NFL · Following · no games yet"', /Baltimore Football\s*NFL · Following · no games yet/.test(teams));

await p.goto(base + '/');
await p.waitForTimeout(400);
await p.click('.demo-tab');
check('Demo controls sheet opens', !!(await p.$('.demo-sheet')));
await p.click('[aria-label="Close demo controls"]');

await b.close();
let fail = 0;
for (const r of results) {
  if (!r.ok) fail++;
  console.log(`${r.ok ? 'PASS' : 'FAIL'}  ${r.name}${r.detail ? `  (${r.detail})` : ''}`);
}
process.exit(fail ? 1 : 0);
