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
