// Builds side-by-side acceptance sheets: approved storyboard crop | rendered implementation.
//   node scripts/compare-sheets.mjs   (after acceptance-shots.mjs)
// Output: acceptance/compare/*.jpg (committed as acceptance evidence)
import { chromium } from 'playwright-core';
import { mkdirSync, readdirSync, readFileSync } from 'node:fs';

const root = new URL('../', import.meta.url).pathname;
const shotsDir = `${root}acceptance/out/`;
const outDir = `${root}acceptance/compare/`;
mkdirSync(outDir, { recursive: true });
const shots = readdirSync(shotsDir);
const find = (name) => shots.find((f) => f.replace(/^\d+-/, '') === `${name}.png`);

const uri = (path, type) => `data:${type};base64,${readFileSync(path).toString('base64')}`;
const B = (n) => uri(`${root}docs/storyboards/${n}`, 'image/jpeg');
const BRAND = B('01-brand-launch.jpg');
const TIX = B('02-ticket-artwork-journey.jpg');
const E2E = B('03-v2-end-to-end.jpg');
const PASS = B('04-passport.jpg');
const LOCK = B('05-bench-locker-room.jpg');

// [name, board, [x, y, w, h] crop in board pixels, rendered shots]
const SHEETS = [
  ['01-launch', BRAND, [925, 70, 370, 610], ['launch-0.0s', 'launch-0.9s-route', 'launch-1.65s-arrival', 'launch-2.1s-hold']],
  ['02-notification', E2E, [15, 120, 160, 350], ['home-A-notification']],
  ['03-print-sequence', E2E, [175, 120, 420, 360], ['print-1-preparing-blank', 'print-2-printing-sweep-50', 'print-3-ready', 'print-4-seat-pop']],
  ['04-ticket-states', TIX, [215, 195, 815, 555], ['print-2-printing-sweep-50', 'print-5-joined', 'gameday-final', 'scenario-E-milestone-hub']],
  ['05-ticket-and-seat', E2E, [598, 118, 195, 410], ['ticket-seat', 'ticket-seat-full']],
  ['06-gameday-hub', E2E, [790, 118, 180, 410], ['gameday-hub', 'gameday-hub-full']],
  ['07-gameday-areas', E2E, [110, 530, 890, 230], ['area-ballpark', 'area-play', 'area-create', 'area-bench', 'area-around', 'area-team']],
  ['08-recap', E2E, [1135, 505, 180, 360], ['scenario-D-home', 'scenario-E-milestone-ticket']],
  [
    '09-passport-top',
    PASS,
    [8, 140, 1310, 355],
    ['passport-home', 'passport-home-full', 'passport-leagues', 'passport-teams', 'passport-team-home', 'passport-ticket-book', 'passport-ticket-detail-full'],
  ],
  ['10-passport-bottom', PASS, [8, 500, 1310, 265], ['passport-stats', 'passport-recognition', 'passport-memories', 'scenario-F-passport', 'passport-season', 'passport-add-team']],
  ['11-bench-locker', LOCK, [8, 165, 1310, 480], ['area-bench', 'locker-room', 'passport-teams', 'locker-settings']],
  ['12-scenarios', TIX, [1030, 695, 280, 150], ['scenario-B-sro-seat', 'scenario-C-home', 'scenario-C-after-one', 'scenario-F-ticket-book', 'reload-persisted-home']],
];

const H = 760;
const browser = await chromium.launch({ executablePath: process.env.CHROME ?? '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
const page = await browser.newPage({ viewport: { width: 2400, height: H + 80 } });

for (const [name, board, [x, y, w, h], names] of SHEETS) {
  const s = H / h;
  const imgs = names
    .map(find)
    .filter(Boolean)
    .map((f) => `<figure><img src="${uri(shotsDir + f, 'image/png')}" style="height:${H}px"><figcaption>${f}</figcaption></figure>`)
    .join('');
  const html = `<html><body style="margin:0;background:#222;font:12px monospace;color:#ccc;display:flex;gap:16px;padding:16px;align-items:flex-start;width:max-content">
    <figure style="margin:0"><div style="width:${w * s}px;height:${H}px;background:url(${board}) -${x * s}px -${y * s}px / auto ${(await dims(board)).h * s}px no-repeat;outline:3px solid #f26a1b"></div><figcaption>STORYBOARD</figcaption></figure>
    ${imgs}
    <style>figure{margin:0} img{display:block;border-radius:8px} figcaption{padding-top:4px}</style></body></html>`;
  await page.setContent(html);
  await page.waitForLoadState('load');
  await page.screenshot({ path: `${outDir}${name}.jpg`, type: 'jpeg', quality: 72, fullPage: true });
  console.log('sheet', name);
}
await browser.close();

async function dims(url) {
  const p = await browser.newPage();
  await p.setContent(`<img src="${url}">`);
  await p.waitForLoadState('load');
  const d = await p.evaluate(() => ({ w: document.images[0].naturalWidth, h: document.images[0].naturalHeight }));
  await p.close();
  return d;
}
