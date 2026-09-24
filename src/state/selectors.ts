import type { AppState } from './store';
import { MILESTONE_GAMES } from './store';
import type { ArtThemeId, Badge, Game, HistoryGame, MilestoneMark, SeatAssignment, Ticket } from '../data/types';
import { TEAMS } from '../data/teams';
import { sortKey } from '../data/history';
import { awardPins, type Pin } from '../data/pins';

/** Everything the Ticket component needs to draw one collectible ticket. */
export interface TicketView {
  id: string;
  gameId: string;
  art: ArtThemeId;
  artImage?: string;
  homeId: string;
  awayId: string;
  dateLabel: string;
  timeLabel: string;
  shortDate: string;
  season: string;
  venue: string;
  seat: SeatAssignment;
  distanceMiles: number;
  location: 'venue' | 'beyond';
  checkedIn: boolean;
  finalScore?: { home: number; away: number };
  marks: MilestoneMark[];
  joinedCount?: number;
  /** fan's team for this ticket (for W/L framing) */
  fanTeamId: string;
  result?: 'W' | 'L';
  live?: boolean;
  /** Season pins earned on this game, pinned to the ticket */
  pins: Pin[];
  fanOfGame?: boolean;
}

export const gameById = (s: AppState, id: string) => s.data.games.find((g) => g.id === id);

function baseTicketView(s: AppState, t: Ticket): TicketView {
  const g = gameById(s, t.gameId)!;
  const fanTeamId = s.data.followed.includes(g.homeId) ? g.homeId : g.awayId;
  const fs = t.finalScore;
  const result = fs ? ((fanTeamId === g.homeId ? fs.home > fs.away : fs.away > fs.home) ? 'W' : 'L') : undefined;
  return {
    id: t.id,
    gameId: g.id,
    art: t.art,
    artImage: t.artImage,
    homeId: g.homeId,
    awayId: g.awayId,
    dateLabel: g.dateLabel,
    timeLabel: g.timeLabel,
    shortDate: g.shortDate,
    season: g.season,
    venue: g.venue,
    seat: t.seat,
    distanceMiles: t.distanceMiles,
    location: t.location,
    checkedIn: !!t.checkedInAt,
    finalScore: fs,
    marks: t.marks,
    joinedCount: t.joinedCount,
    fanTeamId,
    result,
    live: g.status === 'live',
    pins: [],
    fanOfGame: t.fanOfGame,
  };
}

export function ticketView(s: AppState, t: Ticket): TicketView {
  const v = baseTicketView(s, t);
  return { ...v, pins: pinsIndex(s).get(v.id) ?? [] };
}

const DOW = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
const MONTH_IDX: Record<string, number> = { Apr: 3, May: 4, Jun: 5, Jul: 6, Aug: 7, Sep: 8, Oct: 9 };

/** Historical ticket, rebuilt from history. Earned marks are derived from its ordinal. */
export function historyTicketView(h: HistoryGame, ordinal: number, fanOfGame = false): TicketView {
  const [mon, day] = h.date.split(' ');
  const d = new Date(Number(h.season), MONTH_IDX[mon], Number(day));
  const [a, b] = h.score.split('-').map(Number);
  const fanScore = a;
  const oppScore = b;
  const homeId = h.home ? h.teamId : h.opponent;
  const awayId = h.home ? h.opponent : h.teamId;
  const seat: SeatAssignment =
    h.seat === 'SRO'
      ? { kind: 'sro', area: 'Standing Room Only' }
      : (() => {
          const [section, row, seat] = h.seat.split('-');
          return { kind: 'seat', section, row, seat } as const;
        })();
  const marks: MilestoneMark[] = [];
  if (ordinal === 1) marks.push({ kind: 'special', label: 'FIRST GAME', detail: 'Your first game represented', value: '1st' });
  if (MILESTONE_GAMES.includes(ordinal)) marks.push({ kind: 'games', label: `${ordinal} GAMES`, value: String(ordinal), detail: `Your ${ordinal}th game represented` });
  const home = TEAMS[homeId];
  return {
    id: h.id,
    gameId: h.id,
    art: h.art,
    artImage: h.artImage,
    homeId,
    awayId,
    dateLabel: `${DOW[d.getDay()]}, ${mon.toUpperCase()} ${day}, ${h.season}`,
    timeLabel: '7:05 PM ET',
    shortDate: h.date,
    season: h.season,
    venue: home.venue,
    seat,
    distanceMiles: h.miles,
    location: 'beyond',
    checkedIn: true,
    finalScore: h.home ? { home: fanScore, away: oppScore } : { home: oppScore, away: fanScore },
    marks,
    fanTeamId: h.teamId,
    result: h.result,
    pins: [],
    fanOfGame,
  };
}

function baseTickets(s: AppState): TicketView[] {
  const spot = new Set(s.data.spotlights ?? []);
  const chronological = [...s.data.history].sort((a, b) => sortKey(a) - sortKey(b));
  const past = chronological.map((h, i) => historyTicketView(h, i + 1, spot.has(h.id))).reverse();
  const current = Object.values(s.data.tickets)
    .sort((a, b) => b.issuedAt - a.issuedAt)
    .map((t) => baseTicketView(s, t));
  return [...current, ...past];
}

const pinCache = new WeakMap<object, Map<string, Pin[]>>();

/** Season pins for every ticket, derived from the fan's full ticket history. */
export function pinsIndex(s: AppState): Map<string, Pin[]> {
  const hit = pinCache.get(s.data);
  if (hit) return hit;
  const idx = awardPins(
    baseTickets(s).map((v) => ({
      id: v.id,
      teamId: v.fanTeamId,
      opponentId: v.fanTeamId === v.homeId ? v.awayId : v.homeId,
      home: v.fanTeamId === v.homeId,
      season: v.season,
      date: v.shortDate,
      sortKey: sortKey({ season: v.season, date: v.shortDate }),
      final: !!v.finalScore,
      fanOfGame: !!v.fanOfGame,
    })),
  );
  pinCache.set(s.data, idx);
  return idx;
}

/** Every ticket the fan has ever collected, newest first. */
export function allTickets(s: AppState): TicketView[] {
  const idx = pinsIndex(s);
  return baseTickets(s).map((v) => ({ ...v, pins: idx.get(v.id) ?? [] }));
}

/** All pins earned, newest first. */
export function allPins(s: AppState): Pin[] {
  return allTickets(s).flatMap((t) => t.pins);
}

export function totals(s: AppState) {
  const tickets = allTickets(s);
  const games = tickets.length;
  const miles = tickets.reduce((n, t) => n + t.distanceMiles, 0);
  const seasons = [...new Set(tickets.map((t) => t.season))].sort().reverse();
  const teams = s.data.followed.length;
  const leagues = [...new Set(s.data.followed.map((id) => TEAMS[id].league))];
  return { games, miles, seasons, teams, leagues, tickets };
}

export function teamStats(s: AppState, teamId: string) {
  const tickets = allTickets(s).filter((t) => t.fanTeamId === teamId);
  const seasons = [...new Set(tickets.map((t) => t.season))].sort().reverse();
  const wins = tickets.filter((t) => t.result === 'W').length;
  const losses = tickets.filter((t) => t.result === 'L').length;
  return { tickets, games: tickets.length, miles: tickets.reduce((n, t) => n + t.distanceMiles, 0), seasons, wins, losses };
}

/** Games whose ticket window is open and the fan hasn't claimed yet. */
export function eligibleGames(s: AppState): Game[] {
  return s.data.games.filter((g) => (g.status === 'window' || g.status === 'live') && !s.data.tickets[g.id]);
}

/** Games today the fan holds a ticket for (Game Day). */
export function ticketedToday(s: AppState): Game[] {
  return s.data.games.filter((g) => s.data.tickets[g.id]);
}

export function nextGame(s: AppState): Game | undefined {
  return s.data.games.find((g) => g.status !== 'final') ?? s.data.games[s.data.games.length - 1];
}

/** Live countdown against the demo clock. */
export function minutesUntil(s: AppState, g: Game, now = Date.now()) {
  return Math.round(g.startsInMin - (now - s.loadedAt) / 60000);
}

export function lastGame(s: AppState): TicketView | undefined {
  return allTickets(s).find((t) => t.finalScore);
}

export function badges(s: AppState): Badge[] {
  const { games, teams } = totals(s);
  const t = s.data.tickets;
  const streak = s.data.streakBefore + (Object.keys(t).length ? 1 : 0);
  const multiTeam = new Set(allTickets(s).map((x) => x.fanTeamId)).size;
  const hasCreation = s.data.memories.some((m) => m.kind === 'creation');
  const milestone = MILESTONE_GAMES.slice(0, 5).map<Badge>((n) => ({
    id: `games-${n}`,
    group: 'milestone',
    scope: 'fandistance',
    label: `${n} Games`,
    sub: 'Games represented',
    value: String(n),
    icon: 'number',
    earned: games >= n,
  }));
  const streaks = [5, 10, 30, 60].map<Badge>((n) => ({
    id: `streak-${n}`,
    group: 'streak',
    scope: 'fandistance',
    label: `${n} Game Streak`,
    sub: 'Consistent fandom',
    value: String(n),
    icon: 'flame',
    earned: streak >= n,
  }));
  return [
    ...milestone,
    ...streaks,
    { id: 'first', group: 'special', scope: 'fandistance', label: 'First Game', sub: 'Where it started', icon: 'first', earned: games >= 1 },
    { id: 'founding', group: 'founding', scope: 'fandistance', label: 'Founding Fan', sub: 'Early supporter', icon: 'founding', earned: true },
    { id: 'family', group: 'family', scope: 'team', label: 'Family Check-In', sub: 'Shared experiences', icon: 'family', earned: s.scenario === 'F' },
    { id: 'multi', group: 'multi-team', scope: 'fandistance', label: 'Multi-Team Fan', sub: `${teams} teams followed`, icon: 'teams', earned: multiTeam >= 2 },
    { id: 'creator', group: 'special', scope: 'team', label: 'Creator', sub: 'Made something on Game Day', icon: 'star', earned: hasCreation },
    {
      id: 'giveaway',
      group: 'special',
      scope: 'team',
      label: 'Giveaway Night',
      sub: 'Represented a giveaway game',
      icon: 'shirt',
      earned: Object.values(t).some((x) => x.marks.some((m) => m.kind === 'giveaway')),
    },
  ];
}

export const teamName = (id: string) => `${TEAMS[id].city} ${TEAMS[id].name}`.replace('Charlotte Charlotte FC', 'Charlotte FC');

export const seatLine = (seat: SeatAssignment) => (seat.kind === 'seat' ? `Section ${seat.section} • Row ${seat.row} • Seat ${seat.seat}` : 'Standing Room Only');

export const seatShort = (seat: SeatAssignment) => (seat.kind === 'seat' ? `Seat ${seat.section} • Row ${seat.row} • Seat ${seat.seat}` : 'Standing Room Only');

export const fmt = (n: number) => n.toLocaleString('en-US');
