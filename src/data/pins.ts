/**
 * Season pins: collectible memories earned on a specific game and pinned to that game's ticket.
 * Pins are scoped to one team's season (first game of the 2027 Orioles season, 10th game, …).
 * They recognize participation; none of them rank fans against each other.
 */
export type PinKind = 'opener' | 'games-10' | 'games-25' | 'games-50' | 'fan-of-game' | 'rivalry' | 'july-4th' | 'road-trip';

export interface Pin {
  kind: PinKind;
  teamId: string;
  season: string;
  ticketId: string;
  date: string; // "May 24"
  title: string; // "10th Game of 2027"
}

export interface PinDef {
  kind: PinKind;
  name: string;
  /** Shown on an empty slot of the Pin Board */
  hint: (season: string) => string;
  /** Only for teams/sports where it applies */
  applies?: (teamId: string, sport: string) => boolean;
}

export const RIVALS: Record<string, string> = { BAL: 'NYY', CAR: 'WSH', BLT: 'PIT', CLT: 'ATL', WAS: 'NYL' };

export const PIN_DEFS: PinDef[] = [
  { kind: 'opener', name: 'First Game', hint: (s) => `Represent your first game of ${s}` },
  { kind: 'games-10', name: '10th Game', hint: (s) => `Represent 10 games in ${s}` },
  { kind: 'fan-of-game', name: 'Fan of the Game', hint: () => 'Get spotlighted by the team on Game Day' },
  { kind: 'rivalry', name: 'Rivalry Game', hint: () => 'Represent a rivalry game', applies: (t) => !!RIVALS[t] },
  { kind: 'road-trip', name: 'Road Game', hint: () => 'Represent a road game' },
  { kind: 'july-4th', name: 'July 4th', hint: () => 'Represent the July 4th game', applies: (_t, sport) => sport === 'baseball' },
  { kind: 'games-25', name: '25th Game', hint: (s) => `Represent 25 games in ${s}` },
  { kind: 'games-50', name: '50th Game', hint: (s) => `Represent 50 games in ${s}` },
];

export const pinDef = (k: PinKind) => PIN_DEFS.find((d) => d.kind === k)!;

const ORD: Record<number, string> = { 1: '1st', 10: '10th', 25: '25th', 50: '50th' };

export interface PinCandidate {
  id: string;
  teamId: string;
  opponentId: string;
  home: boolean;
  season: string;
  date: string;
  sortKey: number;
  final: boolean;
  fanOfGame: boolean;
}

/** Awards pins across a fan's tickets. Only games that are final count toward season order. */
export function awardPins(tickets: PinCandidate[]): Map<string, Pin[]> {
  const out = new Map<string, Pin[]>();
  const add = (t: PinCandidate, kind: PinKind, title: string) => {
    const list = out.get(t.id) ?? [];
    list.push({ kind, teamId: t.teamId, season: t.season, ticketId: t.id, date: t.date, title });
    out.set(t.id, list);
  };
  const groups = new Map<string, PinCandidate[]>();
  for (const t of tickets) {
    if (t.fanOfGame) add(t, 'fan-of-game', 'Fan of the Game');
    if (!t.final) continue;
    const k = `${t.teamId}|${t.season}`;
    groups.set(k, [...(groups.get(k) ?? []), t]);
  }
  for (const list of groups.values()) {
    list.sort((a, b) => a.sortKey - b.sortKey);
    let rivalry = false;
    let road = false;
    list.forEach((t, i) => {
      const n = i + 1;
      if (n === 1) add(t, 'opener', `1st Game of ${t.season}`);
      if (n === 10 || n === 25 || n === 50) add(t, `games-${n}` as PinKind, `${ORD[n]} Game of ${t.season}`);
      if (!rivalry && RIVALS[t.teamId] === t.opponentId) {
        rivalry = true;
        add(t, 'rivalry', `Rivalry Game ${t.season}`);
      }
      if (!road && !t.home) {
        road = true;
        add(t, 'road-trip', `First Road Game ${t.season}`);
      }
      if (t.date === 'Jul 4') add(t, 'july-4th', `July 4th ${t.season}`);
    });
  }
  return out;
}
