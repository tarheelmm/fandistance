import { describe, expect, it } from 'vitest';
import { initialState, reducer } from './store';
import { allTickets } from './selectors';

const GAME = 'bal-bos-0524';

describe('ticket lifecycle: one game = one ticket', () => {
  it('issues exactly one ticket per game, even when requested again', () => {
    let s = initialState('A', 1000);
    s = reducer(s, { type: 'issueTicket', gameId: GAME, now: 2000 });
    const first = s.data.tickets[GAME];
    s = reducer(s, { type: 'issueTicket', gameId: GAME, now: 9000 });
    expect(Object.keys(s.data.tickets)).toEqual([GAME]);
    expect(s.data.tickets[GAME]).toBe(first);
    expect(first.seat).toEqual({ kind: 'seat', section: '330', row: '9', seat: '14' });
    expect(first.joinedCount).toBe(8315);
  });

  it('adds check-in, final score and marks to the same ticket without changing its artwork', () => {
    let s = initialState('A', 1000);
    s = reducer(s, { type: 'issueTicket', gameId: GAME, now: 2000 });
    const issued = s.data.tickets[GAME];
    s = reducer(s, { type: 'checkIn', gameId: GAME, now: 3000 });
    s = reducer(s, { type: 'setGameStatus', gameId: GAME, status: 'final' });
    const t = s.data.tickets[GAME];
    expect(t.id).toBe(issued.id);
    expect(t.art).toBe(issued.art);
    expect(t.artImage).toBe('blue-crab');
    expect(t.artImage).toBe(issued.artImage);
    expect(t.issuedAt).toBe(issued.issuedAt);
    expect(t.checkedInAt).toBe(3000);
    expect(t.finalScore).toEqual({ home: 7, away: 3 });
    expect(Object.keys(s.data.tickets)).toHaveLength(1);
  });

  it('awards milestone marks additively on the 50th game (scenario E)', () => {
    let s = initialState('E', 1000);
    const before = s.data.tickets[GAME];
    s = reducer(s, { type: 'setGameStatus', gameId: GAME, status: 'final' });
    const labels = s.data.tickets[GAME].marks.map((m) => m.label);
    expect(labels).toEqual(['50 GAMES', '5-GAME STREAK', 'GIVEAWAY']);
    expect(s.data.tickets[GAME].art).toBe(before.art);
    expect(s.data.tickets[GAME].artImage).toBe('giveaway-day');
  });

  it('keeps the ticket permanently in the Passport ticket book', () => {
    let s = initialState('A', 1000);
    const n = allTickets(s).length;
    s = reducer(s, { type: 'issueTicket', gameId: GAME, now: 2000 });
    s = reducer(s, { type: 'setGameStatus', gameId: GAME, status: 'final' });
    const book = allTickets(s);
    expect(book).toHaveLength(n + 1);
    expect(book[0].id).toBe(`tkt-${GAME}`);
    expect(book[0].finalScore).toEqual({ home: 7, away: 3 });
  });

  it('issues Standing Room Only when every seat is taken (scenario B)', () => {
    let s = initialState('B', 1000);
    s = reducer(s, { type: 'issueTicket', gameId: GAME, now: 2000 });
    expect(s.data.tickets[GAME].seat.kind).toBe('sro');
  });
});

describe('approved Baltimore Baseball artwork', () => {
  it('gives every past Baltimore Baseball ticket an approved concept, with Opening Day on each season opener', () => {
    const book = allTickets(initialState('F', 1000)).filter((t) => t.fanTeamId === 'BAL');
    expect(book.every((t) => t.artImage)).toBe(true);
    const openers = ['2026', '2027'].map((season) => book.filter((t) => t.season === season).at(-1)!);
    for (const t of openers) expect(t.artImage).toBe('opening-day');
  });
});

describe('season pins', () => {
  const finalA = () => {
    let s = initialState('A', 1000);
    s = reducer(s, { type: 'issueTicket', gameId: GAME, now: 2000 });
    return reducer(s, { type: 'setGameStatus', gameId: GAME, status: 'final' });
  };

  it('pins nothing to tonight’s ticket until the game is final', () => {
    let s = initialState('A', 1000);
    s = reducer(s, { type: 'issueTicket', gameId: GAME, now: 2000 });
    expect(allTickets(s)[0].pins).toEqual([]);
  });

  it('pins the 10th game of the season to tonight’s ticket once it is final', () => {
    const t = allTickets(finalA())[0];
    expect(t.pins.map((p) => p.title)).toContain('10th Game of 2027');
  });

  it('pins the first game of each season to that season’s opener', () => {
    const bal = allTickets(finalA()).filter((t) => t.fanTeamId === 'BAL');
    for (const season of ['2026', '2027']) {
      const opener = bal.filter((t) => t.season === season).at(-1)!;
      expect(opener.pins.map((p) => p.kind)).toContain('opener');
    }
  });

  it('adds a Fan of the Game pin to the same ticket when the fan is spotlighted', () => {
    let s = finalA();
    const before = s.data.tickets[GAME];
    s = reducer(s, { type: 'spotlight', gameId: GAME });
    const t = allTickets(s)[0];
    expect(t.pins.map((p) => p.kind)).toEqual(expect.arrayContaining(['games-10', 'fan-of-game']));
    expect(s.data.tickets[GAME].artImage).toBe(before.artImage);
    expect(Object.keys(s.data.tickets)).toHaveLength(1);
  });

  it('shows past Fan of the Game pins in the established fan’s passport (scenario F)', () => {
    const pins = allTickets(initialState('F', 1000)).flatMap((t) => t.pins);
    expect(pins.filter((p) => p.kind === 'fan-of-game')).toHaveLength(2);
  });
});

describe('demo restarts', () => {
  const tonight = (s: ReturnType<typeof initialState>) => s.data.games[0];

  it('keeps the canonical storyboard game when there is no seed', () => {
    const g = tonight(initialState('A', 1000));
    expect(g.seat).toEqual({ kind: 'seat', section: '330', row: '9', seat: '14' });
    expect(g.joinedCount).toBe(8315);
    expect(g.artImage).toBe('blue-crab');
  });

  it('gives each restart new art, seat and crowd, never repeating the art just shown', () => {
    let s = initialState('A', 1000);
    const seen = new Set<string>();
    for (let seed = 1; seed <= 12; seed++) {
      const before = tonight(s).artImage;
      s = reducer(s, { type: 'loadScenario', id: 'A', now: 2000, seed });
      const g = tonight(s);
      expect(g.artImage).not.toBe(before);
      seen.add(`${g.artImage}|${JSON.stringify(g.seat)}|${g.joinedCount}`);
    }
    expect(seen.size).toBe(12);
  });

  it('varies past tickets too, while scenario rules still hold', () => {
    const a = reducer(initialState('A', 1000), { type: 'loadScenario', id: 'A', now: 2000, seed: 101 });
    const b = reducer(initialState('A', 1000), { type: 'loadScenario', id: 'A', now: 2000, seed: 202 });
    const arts = (s: typeof a) =>
      allTickets(s)
        .map((t) => t.artImage)
        .join();
    expect(arts(a)).not.toBe(arts(b));
    // tonight is still the 10th Baltimore game of 2027, so the pin still lands at final
    let s = reducer(a, { type: 'issueTicket', gameId: GAME, now: 3000 });
    s = reducer(s, { type: 'setGameStatus', gameId: GAME, status: 'final' });
    expect(allTickets(s)[0].pins.map((p) => p.title)).toContain('10th Game of 2027');
  });
});
