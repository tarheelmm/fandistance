import type { HistoryGame } from './types';

/**
 * Approved Baltimore Orioles ticket art concepts (docs/storyboards/06-orioles-ticket-art-concepts.png).
 * The sheet marks these as art direction; final artwork is produced per game for the 2027 season.
 * Until those masters arrive, each concept is cut from the approved sheet into public/art/orioles/.
 * `focus` is the object-position used when the landscape concept fills the portrait ticket.
 */
export interface Artwork {
  id: string;
  n: number;
  title: string;
  file: string;
  focus: string;
}

const A = (n: number, id: string, title: string, focus = '50% 50%'): Artwork => ({
  id,
  n,
  title,
  file: `${String(n).padStart(2, '0')}-${id}.webp`,
  focus,
});

export const ORIOLES_ART: Artwork[] = [
  A(1, 'camden-yards', 'Camden Yards Icon', '38% 50%'),
  A(2, 'orioles-player', 'Orioles Player', '42% 50%'),
  A(3, 'pitcher-on-the-mound', 'Pitcher on the Mound', '48% 50%'),
  A(4, 'city-skyline', 'City Skyline', '52% 50%'),
  A(5, 'inner-harbor', 'Inner Harbor', '30% 50%'),
  A(6, 'blue-crab', 'Blue Crab', '52% 50%'),
  A(7, 'black-eyed-susans', 'Black-Eyed Susans', '50% 50%'),
  A(8, 'edgar-allan-poe', 'Edgar Allan Poe', '58% 50%'),
  A(9, 'poe-pitcher', 'Poe + Pitcher', '40% 50%'),
  A(10, 'rowhouses', 'Rowhouses', '35% 50%'),
  A(11, 'fort-mchenry', 'Fort McHenry / Flag', '45% 50%'),
  A(12, 'chesapeake-bay', 'Chesapeake Bay', '70% 50%'),
  A(13, 'stadium-night-lights', 'Stadium Night Lights', '50% 50%'),
  A(14, 'orioles-raven', 'Orioles Raven', '55% 50%'),
  A(15, 'baseball-still-life', 'Baseball Still Life', '45% 50%'),
  A(16, 'history-heritage', 'History & Heritage', '65% 50%'),
  A(17, 'harbor-ship-heritage', 'Harbor Ship Heritage', '40% 50%'),
  A(18, 'baltimore-railroad', 'Baltimore Railroad', '42% 50%'),
  A(19, 'opening-day', 'Opening Day', '50% 50%'),
  A(20, 'july-4th-fireworks', 'July 4th Fireworks', '50% 50%'),
  A(21, 'fan-celebration', 'Fan Celebration', '35% 50%'),
  A(22, 'giveaway-day', 'Giveaway Day', '40% 50%'),
  A(23, 'rivalry-series', 'Rivalry Series', '50% 50%'),
  // 24 Last Home Game: not yet available — the supplied sheet has a screen overlay across it.
];

const BY_ID = Object.fromEntries(ORIOLES_ART.map((a) => [a.id, a]));

export const artwork = (id?: string): Artwork | undefined => (id ? BY_ID[id] : undefined);

export const artworkUrl = (a: Artwork) => `${import.meta.env.BASE_URL}art/orioles/${a.file}`;

/** Everyday concepts rotated across regular games (event concepts are reserved for their moments). */
const EVERYDAY = ORIOLES_ART.filter((a) => !['opening-day', 'july-4th-fireworks', 'giveaway-day', 'rivalry-series'].includes(a.id));

function hash(s: string) {
  let h = 2166136261;
  for (const c of s) h = Math.imul(h ^ c.charCodeAt(0), 16777619);
  return h >>> 0;
}

/** Picks the concept for a past Orioles game: event art for its moment, otherwise a stable rotation. */
export function orioleArtFor(h: HistoryGame, isSeasonOpener: boolean): string {
  if (isSeasonOpener) return 'opening-day';
  if (h.date === 'Jul 4') return 'july-4th-fireworks';
  if (h.opponent === 'NYY') return 'rivalry-series';
  return EVERYDAY[hash(h.id) % EVERYDAY.length].id;
}
