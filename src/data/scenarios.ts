import type { BenchPost, Fan, Game, HistoryGame, Memory, Scenario, ScenarioId, Ticket } from './types';
import { buildHistory, type HistorySpec } from './history';

export const SCENARIOS: Scenario[] = [
  { id: 'A', title: 'Baltimore vs Boston', blurb: 'Ticket window just opened · 55 min to first pitch' },
  { id: 'B', title: 'Standing Room Only', blurb: 'Every seat is taken — ticket issues as SRO' },
  { id: 'C', title: 'Multiple eligible games', blurb: 'Orioles, Hurricanes and Ravens all ready' },
  { id: 'D', title: 'Completed game', blurb: 'Final 7–3 added to the same ticket' },
  { id: 'E', title: 'Milestone game', blurb: 'Game #50 in progress — end it to earn marks' },
  { id: 'F', title: 'Established fan Passport', blurb: '6 teams · 5 leagues · 2 seasons · 37 games' },
];

export interface ScenarioData {
  clock: string;
  fan: Fan;
  games: Game[];
  tickets: Record<string, Ticket>;
  history: HistoryGame[];
  followed: string[];
  memories: Memory[];
  bench: BenchPost[];
  streakBefore: number;
  /** Past games where the fan was spotlighted as Fan of the Game */
  spotlights: string[];
}

const FAN: Fan = {
  name: 'Alex',
  handle: 'Alex M.',
  homeCity: 'Charlotte, NC',
  fanSince: 'April 2026',
  location: 'beyond',
  distanceMiles: 392,
};

const baseGame = (over: Partial<Game> = {}): Game => ({
  id: 'bal-bos-0524',
  homeId: 'BAL',
  awayId: 'BOS',
  dateLabel: 'SAT, MAY 24, 2027',
  timeLabel: '7:05 PM ET',
  shortDate: 'May 24',
  isoDate: '2027-05-24',
  season: '2027',
  venue: 'Oriole Park at Camden Yards',
  art: 'baltimore-harbor',
  artImage: 'blue-crab',
  status: 'window',
  startsInMin: 55,
  seat: { kind: 'seat', section: '330', row: '9', seat: '14' },
  joinedCount: 8315,
  finalScore: { home: 7, away: 3 },
  ...over,
});

const tomorrow = (): Game =>
  baseGame({
    id: 'bal-bos-0525',
    dateLabel: 'SUN, MAY 25, 2027',
    timeLabel: '1:35 PM ET',
    shortDate: 'May 25',
    isoDate: '2027-05-25',
    status: 'scheduled',
    startsInMin: 60 * 15,
    joinedCount: 0,
  });

export const issueTicketFor = (game: Game, fan: Fan, now: number): Ticket => ({
  id: `tkt-${game.id}`,
  gameId: game.id,
  art: game.art,
  artImage: game.artImage,
  issuedAt: now,
  seat: game.seat ?? { kind: 'sro', area: 'Standing Room Only' },
  joinedCount: game.joinedCount,
  location: fan.location,
  distanceMiles: fan.location === 'venue' ? 0 : fan.distanceMiles,
  marks: [],
});

const REGULAR: HistorySpec[] = [
  { teamId: 'BAL', season: '2026', count: 5, months: [2, 5] },
  { teamId: 'CAR', season: '2026', count: 1, months: [5, 6] },
  { teamId: 'BAL', season: '2027', count: 9, months: [0, 1], lastDay: 22 },
];

const MILESTONE: HistorySpec[] = [
  { teamId: 'BAL', season: '2026', count: 22, months: [0, 5] },
  { teamId: 'CAR', season: '2026', count: 5, months: [5, 6] },
  { teamId: 'BAL', season: '2027', count: 22, months: [0, 1], lastDay: 22 },
];

const ESTABLISHED: HistorySpec[] = [
  { teamId: 'BAL', season: '2026', count: 12, months: [0, 5] },
  { teamId: 'CAR', season: '2026', count: 4, months: [5, 6] },
  { teamId: 'BLT', season: '2026', count: 3, months: [5, 6] },
  { teamId: 'WAS', season: '2026', count: 1, months: [3, 3] },
  { teamId: 'CLT', season: '2027', count: 1, months: [0, 0] },
  { teamId: 'BAL', season: '2027', count: 15, months: [0, 1], lastDay: 22, winRate: 0.66 },
];

const MEMORIES_BASE: Memory[] = [
  { id: 'm1', kind: 'photo', title: 'Opening Day watch party', date: 'Apr 3, 2027', art: 'ballpark' },
  { id: 'm2', kind: 'photo', title: 'Fireworks night', date: 'Jul 4, 2026', art: 'fireworks' },
  { id: 'm3', kind: 'creation', title: 'Mascot coloring page', date: 'May 18, 2027', art: 'mascot' },
];

const MEMORIES_RICH: Memory[] = [
  ...MEMORIES_BASE,
  {
    id: 'm4',
    kind: 'creation',
    title: 'Crab night coloring',
    date: 'Aug 9, 2026',
    art: 'coloring',
    colors: { shell: '#E0542B', claw: '#C23B22', plate: '#F4E3C1', bg: '#1E3A5F' },
  },
  { id: 'm5', kind: 'activity', title: 'Scored every inning', date: 'Jun 12, 2026', art: 'scorecard' },
  { id: 'm6', kind: 'photo', title: "LET'S GO O'S!", date: 'May 10, 2027', art: 'fan' },
  { id: 'm7', kind: 'photo', title: 'Harbor at sunset', date: 'Apr 19, 2027', art: 'skyline' },
  { id: 'm8', kind: 'activity', title: 'Crab feast with family', date: 'Sep 1, 2026', art: 'crab' },
];

const BENCH: BenchPost[] = [
  { id: 'b1', author: 'BirdlandAlways', city: 'Baltimore, MD', text: "Let's go O's! Rotation looks sharp tonight.", minsAgo: 2, likes: 24, replies: 3 },
  { id: 'b2', author: 'RavenFan77', city: 'Towson, MD', text: 'Great night for baseball. Harbor is glowing.', minsAgo: 3, likes: 18, replies: 2 },
  { id: 'b3', author: 'CamdenCrew', city: 'Charlotte, NC', text: 'Checking in from Charlotte, NC! Go O’s!', minsAgo: 5, likes: 32, replies: 11 },
  { id: 'b4', author: 'TerpBird', city: 'College Park, MD', text: "That's what we needed!", minsAgo: 6, likes: 9, replies: 0 },
  { id: 'b5', author: 'OriolesDad', city: 'Tampa, FL', text: 'Still representing from 912 miles away. Let’s go!', minsAgo: 8, likes: 27, replies: 4 },
];

export function buildScenario(id: ScenarioId, now: number): ScenarioData {
  const common = { fan: { ...FAN }, bench: BENCH.map((b) => ({ ...b })), spotlights: [] as string[] };
  switch (id) {
    case 'A':
      return {
        ...common,
        clock: '6:10 PM',
        games: [baseGame(), tomorrow()],
        tickets: {},
        history: buildHistory(REGULAR, 11),
        followed: ['BAL', 'CAR', 'BLT'],
        memories: MEMORIES_BASE,
        streakBefore: 2,
      };
    case 'B': {
      const game = baseGame({ standingRoomOnly: true, seat: { kind: 'sro', area: 'Standing Room Only' }, joinedCount: 45971 });
      return {
        ...common,
        clock: '6:10 PM',
        games: [game, tomorrow()],
        tickets: {},
        history: buildHistory(REGULAR, 11),
        followed: ['BAL', 'CAR', 'BLT'],
        memories: MEMORIES_BASE,
        streakBefore: 2,
      };
    }
    case 'C':
      return {
        ...common,
        clock: '7:15 PM',
        games: [
          baseGame({ status: 'live', startsInMin: -10 }),
          {
            ...baseGame(),
            id: 'car-wsh-0524',
            homeId: 'CAR',
            awayId: 'WSH',
            timeLabel: '7:00 PM ET',
            venue: 'Lenovo Center',
            art: 'raleigh-ice',
            artImage: undefined,
            status: 'live',
            startsInMin: -15,
            seat: { kind: 'seat', section: '305', row: 'F', seat: '7' },
            joinedCount: 3204,
            finalScore: { home: 4, away: 2 },
          },
          {
            ...baseGame(),
            id: 'blt-pit-0524',
            homeId: 'BLT',
            awayId: 'PIT',
            timeLabel: '8:15 PM ET',
            venue: 'M&T Bank Stadium',
            art: 'baltimore-gridiron',
            artImage: undefined,
            status: 'window',
            startsInMin: 60,
            seat: { kind: 'seat', section: '540', row: '12', seat: '3' },
            joinedCount: 12880,
            finalScore: { home: 24, away: 17 },
          },
        ],
        tickets: {},
        history: buildHistory(REGULAR, 11),
        followed: ['BAL', 'CAR', 'BLT'],
        memories: MEMORIES_BASE,
        streakBefore: 2,
      };
    case 'D': {
      const game = baseGame({ status: 'final', startsInMin: -200 });
      const t = issueTicketFor(game, FAN, now - 1000 * 60 * 260);
      return {
        ...common,
        clock: '10:32 PM',
        games: [game, tomorrow()],
        tickets: { [game.id]: { ...t, checkedInAt: t.issuedAt + 1000 * 60 * 3, finalScore: game.finalScore } },
        history: buildHistory(REGULAR, 11),
        followed: ['BAL', 'CAR', 'BLT'],
        memories: MEMORIES_BASE,
        streakBefore: 2,
      };
    }
    case 'E': {
      const game = baseGame({
        status: 'live',
        startsInMin: -40,
        artImage: 'giveaway-day',
        milestones: [{ kind: 'giveaway', label: 'GIVEAWAY', detail: 'Orange Hat Night giveaway', value: 'HAT' }],
      });
      const t = issueTicketFor(game, FAN, now - 1000 * 60 * 95);
      return {
        ...common,
        clock: '7:45 PM',
        games: [game, tomorrow()],
        tickets: { [game.id]: { ...t, checkedInAt: t.issuedAt + 1000 * 60 * 2 } },
        history: buildHistory(MILESTONE, 23),
        followed: ['BAL', 'CAR'],
        memories: MEMORIES_BASE,
        streakBefore: 4,
      };
    }
    case 'F': {
      const game = baseGame({ status: 'final', startsInMin: -210 });
      const t = issueTicketFor(game, FAN, now - 1000 * 60 * 270);
      return {
        ...common,
        clock: '10:40 PM',
        games: [game, tomorrow()],
        tickets: { [game.id]: { ...t, checkedInAt: t.issuedAt + 1000 * 60 * 4, finalScore: game.finalScore } },
        history: buildHistory(ESTABLISHED, 5),
        followed: ['BAL', 'CAR', 'BLT', 'CLT', 'WAS', 'CHA'],
        memories: MEMORIES_RICH,
        streakBefore: 3,
        spotlights: ['h-BAL-2027-6', 'h-BAL-2026-4'],
      };
    }
  }
}
