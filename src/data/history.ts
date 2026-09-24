import type { ArtThemeId, HistoryGame, Sport } from './types';
import { TEAMS } from './teams';
import { orioleArtFor } from './artwork';

/** Deterministic PRNG so demo history is identical on every load. */
function mulberry32(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export const ART_BY_SPORT: Record<Sport, ArtThemeId> = {
  baseball: 'baltimore-harbor',
  hockey: 'raleigh-ice',
  football: 'baltimore-gridiron',
  soccer: 'charlotte-pitch',
  basketball: 'dc-court',
};

const OPPONENTS: Record<string, string[]> = {
  BAL: ['NYY', 'TB', 'TOR', 'CLE', 'DET', 'BOS'],
  CAR: ['WSH'],
  BLT: ['PIT'],
  CLT: ['ATL'],
  WAS: ['NYL'],
};

/** Miles from the fan (Charlotte, NC) to where each game was played. */
const MILES_HOME: Record<string, number> = { BAL: 392, CAR: 162, BLT: 392, CLT: 12, WAS: 356 };
const MILES_AWAY: Record<string, number> = { NYY: 532, TB: 512, TOR: 693, CLE: 438, DET: 504, BOS: 722, WSH: 356, PIT: 364, ATL: 244, NYL: 530 };

const MONTHS = ['Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct'];

export interface HistorySpec {
  teamId: string;
  season: string;
  count: number;
  /** month index window into MONTHS for this season's games */
  months?: [number, number];
  winRate?: number;
  /** clamp day-of-month in the final month (e.g. games before tonight) */
  lastDay?: number;
}

export function buildHistory(specs: HistorySpec[], seed = 7): HistoryGame[] {
  const rnd = mulberry32(seed);
  const out: HistoryGame[] = [];
  for (const spec of specs) {
    const opps = OPPONENTS[spec.teamId] ?? ['BOS'];
    const [m0, m1] = spec.months ?? [0, 5];
    const sport = TEAMS[spec.teamId].sport;
    const days: { m: number; d: number }[] = [];
    for (let i = 0; i < spec.count; i++) {
      // spread evenly across the window so dates stay ordered
      const t = (i + 0.5) / spec.count;
      const span = (m1 - m0 + 1) * 30;
      const dayOfSpan = Math.floor(t * span);
      const m = m0 + Math.floor(dayOfSpan / 30);
      let d = Math.min(28, 1 + (dayOfSpan % 30));
      if (spec.lastDay && m === m1) d = Math.max(1, Math.round((d / 28) * spec.lastDay));
      days.push({ m, d });
    }
    days.forEach(({ m, d }, i) => {
      const opponent = opps[Math.floor(rnd() * opps.length)];
      const home = rnd() > 0.35;
      const win = rnd() < (spec.winRate ?? 0.62);
      const hi = 3 + Math.floor(rnd() * 6);
      const lo = Math.floor(rnd() * hi);
      const miles = home ? MILES_HOME[spec.teamId] : (MILES_AWAY[opponent] ?? 400);
      const section = 300 + Math.floor(rnd() * 90);
      const seatStr = sport === 'baseball' && rnd() < 0.06 ? 'SRO' : `${section}-${1 + Math.floor(rnd() * 20)}-${1 + Math.floor(rnd() * 22)}`;
      out.push({
        id: `h-${spec.teamId}-${spec.season}-${i}`,
        teamId: spec.teamId,
        opponent,
        home,
        date: `${MONTHS[m]} ${d}`,
        season: spec.season,
        result: win ? 'W' : 'L',
        score: win ? `${hi}-${lo}` : `${lo}-${hi}`,
        seat: seatStr,
        art: ART_BY_SPORT[sport],
        miles,
      });
    });
  }
  // Baltimore Baseball tickets carry the approved Baltimore artwork concepts
  const openers = new Set<string>();
  for (const h of [...out].sort((a, b) => sortKey(a) - sortKey(b))) {
    if (h.teamId !== 'BAL') continue;
    const opener = !openers.has(h.season);
    openers.add(h.season);
    h.artImage = orioleArtFor(h, opener);
  }
  // newest first
  return out.sort((a, b) => sortKey(b) - sortKey(a));
}

export function sortKey(h: { season: string; date: string }) {
  const [mon, day] = h.date.split(' ');
  return Number(h.season) * 1000 + MONTHS.indexOf(mon) * 40 + Number(day);
}

export function historyMonth(h: HistoryGame) {
  return h.date.split(' ')[0];
}

export { MONTHS };
