export type Sport = 'baseball' | 'hockey' | 'football' | 'soccer' | 'basketball';
export type League = 'MLB' | 'NHL' | 'NFL' | 'MLS' | 'WNBA' | 'NBA';

export interface Team {
  id: string;
  city: string;
  name: string; // "Orioles"
  short: string; // "Baltimore"
  abbr: string; // "BAL"
  league: League;
  sport: Sport;
  primary: string;
  secondary: string;
  venue: string;
  venueCity: string;
}

/** Visual theme used to generate a game's poster artwork. */
export type ArtThemeId = 'baltimore-harbor' | 'raleigh-ice' | 'baltimore-gridiron' | 'charlotte-pitch' | 'dc-court';

export type GameStatus = 'scheduled' | 'window' | 'live' | 'final';

export interface Game {
  id: string;
  homeId: string;
  awayId: string;
  /** Display date/time for the demo (the storyboard dates), e.g. "SAT, MAY 24, 2027" */
  dateLabel: string;
  timeLabel: string; // "7:05 PM ET"
  shortDate: string; // "May 24"
  isoDate: string; // 2027-05-24
  season: string; // "2027"
  venue: string;
  art: ArtThemeId;
  status: GameStatus;
  /** minutes until first pitch at the moment the scenario loads */
  startsInMin: number;
  /** Every virtual seat is taken — tickets issue as Standing Room Only. */
  standingRoomOnly?: boolean;
  seat?: SeatAssignment;
  joinedCount: number;
  /** Scripted result for the demo — only surfaced once status is 'final'. */
  finalScore?: { home: number; away: number };
  /** Game-specific moments (e.g. giveaway night) that become ticket marks at final. */
  milestones?: MilestoneMark[];
}

export type SeatAssignment = { kind: 'seat'; section: string; row: string; seat: string } | { kind: 'sro'; area: string };

export type MilestoneKind = 'games' | 'streak' | 'giveaway' | 'historic' | 'special';

export interface MilestoneMark {
  kind: MilestoneKind;
  label: string; // "50 GAMES"
  detail: string; // "Your 50th game represented"
  value?: string; // "50"
}

export type FanLocation = 'venue' | 'beyond';

/**
 * ONE GAME = ONE TICKET.
 * A ticket is created once and only ever receives additive fields.
 * `art` and `issuedAt` are frozen at issue time and never change.
 */
export interface Ticket {
  id: string; // `tkt-${gameId}`
  gameId: string;
  art: ArtThemeId;
  issuedAt: number;
  seat: SeatAssignment;
  joinedCount: number;
  location: FanLocation;
  distanceMiles: number;
  checkedInAt?: number;
  finalScore?: { home: number; away: number };
  marks: MilestoneMark[];
}

export interface Memory {
  id: string;
  kind: 'photo' | 'creation' | 'activity';
  title: string;
  gameId?: string;
  date: string;
  art: 'ballpark' | 'fireworks' | 'mascot' | 'coloring' | 'scorecard' | 'fan' | 'crab' | 'skyline';
  colors?: Record<string, string>;
}

export interface Badge {
  id: string;
  group: 'milestone' | 'streak' | 'special' | 'family' | 'multi-team' | 'founding';
  scope: 'fandistance' | 'team';
  label: string;
  sub: string;
  value?: string;
  icon: 'number' | 'flame' | 'star' | 'family' | 'teams' | 'founding' | 'shirt' | 'first';
  earned: boolean;
  earnedOn?: string;
}

export interface HistoryGame {
  id: string;
  teamId: string;
  opponent: string; // "NYY"
  home: boolean;
  date: string; // "May 20"
  season: string;
  result: 'W' | 'L';
  score: string; // "6-4"
  seat: string; // "331-8-2" or "SRO"
  art: ArtThemeId;
  miles: number;
}

export interface FollowedTeam {
  teamId: string;
  games: number;
  miles: number;
  seasons: number;
  since: string;
}

export interface Fan {
  name: string;
  handle: string;
  homeCity: string;
  fanSince: string;
  location: FanLocation;
  distanceMiles: number; // from the primary venue
}

export interface BenchPost {
  id: string;
  author: string;
  city: string;
  text: string;
  minsAgo: number;
  likes: number;
  replies: number;
  mine?: boolean;
  liked?: boolean;
}

export type ScenarioId = 'A' | 'B' | 'C' | 'D' | 'E' | 'F';

export interface Scenario {
  id: ScenarioId;
  title: string;
  blurb: string;
}
