// Storyboard acceptance renders: drives the real app at phone size and captures
// each storyboard-defined screen/state (incl. the ticket print sequence frame by frame).
//
//   npm run build && npx vite preview --port 4173 &
//   node scripts/acceptance-shots.mjs [baseUrl] [--only=prefix]
//
// Output: acceptance/out/*.png. Safe areas are simulated (47px top / 34px bottom)
// with a status bar and home indicator overlay so clearance can be checked visually.
import { chromium } from 'playwright-core';
import { executablePath } from './browser.mjs';
import { mkdirSync } from 'node:fs';

const base = process.argv.find((a) => a.startsWith('http')) ?? 'http://localhost:4173/';
const only = process.argv.find((a) => a.startsWith('--only='))?.slice(7);
const OUT = new URL('../acceptance/out/', import.meta.url).pathname;
mkdirSync(OUT, { recursive: true });

const browser = await chromium.launch({ executablePath });
const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
const page = await ctx.newPage();
page.on('pageerror', (e) => console.error('PAGE ERROR', e.message));
page.on('console', (m) => m.type() === 'error' && console.error('CONSOLE', m.text()));

const SAFE = `
  :root { --safe-top: 47px !important; --safe-bottom: 34px !important; }
  body::before { content: '9:41'; position: fixed; z-index: 99999; top: 0; left: 0; right: 0; height: 47px;
    display: flex; align-items: center; padding: 6px 0 0 34px; font: 600 16px -apple-system, sans-serif;
    color: #888; pointer-events: none; mix-blend-mode: difference; }
  body::after { content: ''; position: fixed; z-index: 99999; bottom: 8px; left: 50%; width: 134px; height: 5px;
    margin-left: -67px; border-radius: 3px; background: #888; pointer-events: none; mix-blend-mode: difference; }
`;
async function safe() {
  await page.addStyleTag({ content: SAFE });
}

let n = 0;
async function shot(name, { full = false } = {}) {
  n += 1;
  if (only && !name.startsWith(only)) return;
  const file = `${OUT}${String(n).padStart(2, '0')}-${name}.png`;
  await page.screenshot({ path: file, fullPage: full });
  console.log('shot', file);
}
const wait = (ms) => page.waitForTimeout(ms);

async function scenario(id) {
  await page.click('.demo-tab');
  await page.click(`.demo-scen button:has(b:text-is("${id}"))`);
  await wait(300);
}

// Frame-accurate capture: JS timers run on Playwright's fake clock, CSS animations
// are paused and scrubbed to the exact moment of the sequence.
const freeze = (ms) =>
  page.evaluate((t) => {
    // scrub without pause(): pausing overrides CSS play state and can keep a removed animation alive
    for (const a of document.getAnimations()) a.currentTime = t;
  }, ms);
const thaw = async () => {};
let clockAt = 0;
async function advanceTo(ms) {
  if (ms > clockAt) await page.clock.runFor(ms - clockAt);
  clockAt = Math.max(clockAt, ms);
  await wait(120); // let React commit
}

// ---------- Launch ----------
await page.goto(base);
await page.evaluate(() => localStorage.clear());
const T0 = Date.now();
await page.clock.install({ time: T0 });
await page.clock.pauseAt(T0 + 50);
await page.goto(base);
await safe();
await page.waitForSelector('.launch');
for (const [t, name] of [
  [0, 'launch-0.0s'],
  [900, 'launch-0.9s-route'],
  [1650, 'launch-1.65s-arrival'],
  [2100, 'launch-2.1s-hold'],
]) {
  await thaw();
  await advanceTo(t);
  await freeze(t);
  await shot(name);
}
await thaw();
await advanceTo(3000);
await page.waitForSelector('.launch', { state: 'detached' });

// ---------- Home (A) ----------
await advanceTo(3600);
await wait(700);
await shot('home-A-notification');
await shot('home-A-full', { full: true });

// ---------- Ticket print: tap the notification ----------
await page.click('.push-body');
clockAt = 0;
await wait(150);
// stage starts: printing 1500, ready 4400, assigned 5300, joined 6200
for (const [t, start, name] of [
  [500, 0, 'print-1-preparing-blank'],
  [1500 + 725, 1500, 'print-2-printing-sweep-25'],
  [1500 + 1450, 1500, 'print-2-printing-sweep-50'],
  [1500 + 2175, 1500, 'print-2-printing-sweep-75'],
  [4400 + 500, 4400, 'print-3-ready'],
  [5300 + 280, 5300, 'print-4-seat-pop'],
  [6200 + 600, 5300, 'print-5-joined'],
]) {
  await thaw();
  await advanceTo(t);
  await freeze(t - start);
  await shot(name);
}
await thaw();
await advanceTo(9200);
await page.clock.resume();
await page.waitForURL(/#\/ticket\/[^/]+$/, { timeout: 8000 });
await wait(900);
await shot('ticket-seat');
await shot('ticket-seat-full', { full: true });

// ---------- Game Day ----------
await page.click('.ts-enter');
await wait(1200);
await shot('gameday-hub');
await shot('gameday-hub-full', { full: true });
for (const area of ['ballpark', 'play', 'create', 'bench', 'around', 'team']) {
  await page.click(`.gd-tile.tile-${area}`);
  await wait(400);
  if (area === 'play') {
    await page.click('.play-opt:has-text("1992")');
    await page.click('button:has-text("Submit answer")');
  }
  if (area === 'create') {
    for (const [c, r] of [
      [0, 'shell'],
      [1, 'cap'],
      [3, 'claw'],
      [4, 'bat'],
    ]) {
      await page.click(`.swatch >> nth=${c}`);
      await page.click(`[aria-label="Color the ${r}"] >> nth=0`);
    }
    await page.click('button:has-text("Save my art")');
  }
  if (area === 'bench') {
    await page.fill('#bench-input', 'Representing from Charlotte tonight!');
    await page.click('[aria-label="Post to The Bench"]');
  }
  await wait(300);
  await shot(`area-${area}`, { full: true });
  await page.click('[aria-label="Back to Game Day Hub"]');
  await wait(300);
}
await shot('gameday-hub-after-activity', { full: true });

// ---------- Game ends: the SAME ticket receives the score ----------
await page.click('.demo-tab');
await page.click('.demo-game button:has-text("Game final") >> nth=0');
await wait(1500);
await shot('gameday-final');
await page.click('.gd-ticket');
await wait(600);
await shot('ticket-seat-after-final', { full: true });

// ---------- Passport ----------
await page.click('.bn-tab:has-text("Passport")').catch(async () => {
  await page.goto(base + '#/passport');
});
await page.goto(base.replace(/\/$/, '') + '/?nolaunch#/passport');
await safe();
await wait(500);
await shot('passport-home');
await shot('passport-home-full', { full: true });
await page.goto(base.replace(/\/$/, '') + '/?nolaunch#/passport/ticket/tkt-bal-bos-0524');
await safe();
await wait(500);
await shot('passport-ticket-detail-full', { full: true });
for (const [route, name] of [
  ['tickets', 'passport-ticket-book'],
  ['recognition', 'passport-recognition'],
  ['memories', 'passport-memories'],
  ['teams', 'passport-teams'],
  ['teams/BAL', 'passport-team-home'],
  ['seasons/2027', 'passport-season'],
  ['leagues', 'passport-leagues'],
  ['stats', 'passport-stats'],
  ['add-team', 'passport-add-team'],
  ['pins', 'passport-pin-board'],
  ['locker-room', 'locker-room'],
  ['locker-room/settings', 'locker-settings'],
]) {
  await page.goto(base.replace(/\/$/, '') + `/?nolaunch#/passport/${route}`);
  await safe();
  await wait(400);
  await shot(name, { full: true });
}

// ---------- Scenarios B–F ----------
await page.goto(base.replace(/\/$/, '') + '/?nolaunch#/');
await safe();
for (const id of ['B', 'C', 'D', 'E', 'F']) {
  await scenario(id);
  await wait(900);
  await shot(`scenario-${id}-home`, { full: true });
  if (id === 'B') {
    await page.click('.ng-cta');
    await wait(7000);
    await page.waitForURL(/#\/ticket\/[^/]+$/, { timeout: 8000 });
    await wait(800);
    await shot('scenario-B-sro-seat', { full: true });
  }
  if (id === 'C') {
    await page.click('.push-body');
    await page.waitForURL(/#\/ticket\/[^/]+$/, { timeout: 12000 });
    await page.click('.ts-enter');
    await wait(600);
    await page.click('.bn-tab:has-text("Home")');
    await wait(600);
    await shot('scenario-C-after-one', { full: true });
  }
  if (id === 'E') {
    await page.click('.bn-tab:has-text("Game Day")');
    await wait(500);
    await page.click('.demo-tab');
    await page.click('.demo-game button:has-text("Game final") >> nth=0');
    await wait(1500);
    await shot('scenario-E-milestone-hub');
    await page.click('.gd-ticket');
    await wait(500);
    await shot('scenario-E-milestone-ticket', { full: true });
  }
  if (id === 'F') {
    await page.click('.bn-tab:has-text("Passport")');
    await wait(600);
    await shot('scenario-F-passport', { full: true });
    await page.goto(base.replace(/\/$/, '') + '/?nolaunch#/passport/tickets');
    await safe();
    await wait(400);
    await shot('scenario-F-ticket-book', { full: true });
  }
}

// ---------- Persistence: reload keeps tickets ----------
await page.reload();
await safe();
await wait(3000);
await shot('reload-persisted-home');

await browser.close();
