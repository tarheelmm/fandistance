import { TEAMS } from '../data/teams';
import type { TicketView } from './selectors';

type Scored = Pick<TicketView, 'fanTeamId' | 'homeId' | 'awayId' | 'finalScore'>;

const isHome = (t: Scored) => t.fanTeamId === t.homeId;

/** "W 3–1 vs Tampa Bay" or "L 0–6 @ Boston"; no score yet → "vs Tampa Bay". Always from the fan's side. */
export const scoreLine = (t: Scored) => {
  const home = isHome(t);
  const opp = TEAMS[home ? t.awayId : t.homeId];
  const where = `${home ? 'vs' : '@'} ${opp.short}`;
  if (!t.finalScore) return where;
  const us = home ? t.finalScore.home : t.finalScore.away;
  const them = home ? t.finalScore.away : t.finalScore.home;
  return `${us > them ? 'W' : 'L'} ${us}–${them} ${where}`;
};

/** ["BAL 3", "TB 1"], fan's team first. Requires a final score. */
export const scorePair = (t: Scored): [string, string] => {
  const home = isHome(t);
  const fs = t.finalScore!;
  const us = home ? fs.home : fs.away;
  const them = home ? fs.away : fs.home;
  return [`${TEAMS[t.fanTeamId].abbr} ${us}`, `${TEAMS[home ? t.awayId : t.homeId].abbr} ${them}`];
};

/** "BAL vs BOS" / "BAL @ NYY" before there's a score. */
export const matchupAbbr = (t: Scored) => `${TEAMS[t.fanTeamId].abbr} ${isHome(t) ? 'vs' : '@'} ${TEAMS[isHome(t) ? t.awayId : t.homeId].abbr}`;

export const plural = (n: number, word: string) => `${n.toLocaleString('en-US')} ${word}${n === 1 ? '' : 's'}`;

export const gamesLabel = (n: number) => plural(n, 'game');

export const gamesMiles = (n: number, miles: number) => (n ? `${gamesLabel(n)} · ${miles.toLocaleString('en-US')} miles` : 'Following · no games yet');
