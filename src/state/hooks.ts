import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useStore } from './store';
import { gameById, seatShort, ticketView, type TicketView } from './selectors';
import { TEAMS } from '../data/teams';

export function useNow(ms = 30000) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), ms);
    return () => clearInterval(t);
  }, [ms]);
  return now;
}

export interface PassportItem {
  label: string;
  done: boolean;
}

/** "Today in Your Passport" — what today's participation has added to the fan's history. */
export function useTodayInPassport(gameId: string | undefined): { items: PassportItem[]; ticket?: TicketView } {
  const { state } = useStore();
  const game = gameId ? gameById(state, gameId) : undefined;
  const t = gameId ? state.data.tickets[gameId] : undefined;
  const act = (gameId && state.activity[gameId]) || {};
  if (!game) return { items: [] };
  const venue = TEAMS[game.homeId].venue.split(' at ')[0];
  const miles = t ? t.distanceMiles : state.data.fan.distanceMiles;
  const items: PassportItem[] = [
    { label: 'Game represented', done: !!t },
    { label: 'Ticket collected', done: !!t },
    { label: t ? seatShort(t.seat) : 'Seat assigned', done: !!t },
    { label: t?.location === 'venue' || state.data.fan.location === 'venue' ? `Represented at ${venue}` : `${miles.toLocaleString()} miles from ${venue}`, done: !!t },
  ];
  if (act.trivia || act.poll) items.push({ label: 'Activity completed', done: true });
  if (act.coloring) items.push({ label: 'Coloring page saved', done: true });
  if (act.photo || act.memory) items.push({ label: 'Memory added', done: true });
  if (act.posted) items.push({ label: 'Joined The Bench conversation', done: true });
  if (t?.finalScore) items.push({ label: 'Final score added to your ticket', done: true });
  for (const m of t?.marks ?? []) items.push({ label: `${m.detail}`, done: true });
  const ticket = t ? ticketView(state, t) : undefined;
  for (const p of ticket?.pins ?? []) items.push({ label: `Pin added to your ticket: ${p.title}`, done: true });
  return { items, ticket };
}

/** Predictable back: pop history when we navigated here in-app, else go to a sensible parent. */
export function useBack(fallback: string) {
  const navigate = useNavigate();
  const location = useLocation();
  return () => (location.key !== 'default' ? navigate(-1) : navigate(fallback, { replace: true }));
}
