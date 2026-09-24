import { createContext, useContext, useEffect, useMemo, useReducer, type ReactNode } from 'react';
import type { BenchPost, FanLocation, GameStatus, Memory, MilestoneMark, ScenarioId } from '../data/types';
import { buildScenario, issueTicketFor, type ScenarioData } from '../data/scenarios';

export interface GameActivity {
  trivia?: string;
  poll?: string;
  coloring?: boolean;
  photo?: boolean;
  memory?: boolean;
  posted?: number;
}

export interface Prefs {
  gameReminders: boolean;
  teamNews: boolean;
  benchReplies: boolean;
  shareTickets: boolean;
  showOnFanMap: boolean;
  publicPassport: boolean;
}

export interface AppState {
  v: 3;
  scenario: ScenarioId;
  loadedAt: number;
  data: ScenarioData;
  activity: Record<string, GameActivity>;
  recapSeen: Record<string, boolean>;
  prefs: Prefs;
}

const STORAGE_KEY = 'fd.v2.state';

const DEFAULT_PREFS: Prefs = {
  gameReminders: true,
  teamNews: true,
  benchReplies: true,
  shareTickets: true,
  showOnFanMap: true,
  publicPassport: false,
};

export function initialState(scenario: ScenarioId = 'A', now = Date.now(), seed?: number, avoidArt?: string): AppState {
  return {
    v: 3,
    scenario,
    loadedAt: now,
    data: buildScenario(scenario, now, seed, avoidArt),
    activity: {},
    recapSeen: {},
    prefs: DEFAULT_PREFS,
  };
}

export type Action =
  | { type: 'loadScenario'; id: ScenarioId; now: number; seed?: number }
  | { type: 'issueTicket'; gameId: string; now: number }
  | { type: 'checkIn'; gameId: string; now: number }
  | { type: 'setGameStatus'; gameId: string; status: GameStatus }
  | { type: 'addMark'; gameId: string; mark: MilestoneMark }
  | { type: 'activity'; gameId: string; patch: GameActivity }
  | { type: 'addMemory'; memory: Memory }
  | { type: 'post'; post: BenchPost }
  | { type: 'like'; id: string }
  | { type: 'setLocation'; location: FanLocation }
  | { type: 'setPref'; key: keyof Prefs; value: boolean }
  | { type: 'recapSeen'; gameId: string }
  | { type: 'toggleFollow'; teamId: string }
  | { type: 'spotlight'; gameId: string };

export const MILESTONE_GAMES = [10, 25, 50, 75, 100, 150, 200];

/** Marks earned when a game goes final. Additive only — never touches artwork. */
export function earnedMarks(state: AppState, gameId: string): MilestoneMark[] {
  const { data } = state;
  const game = data.games.find((g) => g.id === gameId);
  const marks: MilestoneMark[] = [];
  const count = data.history.length + Object.keys(data.tickets).length;
  if (MILESTONE_GAMES.includes(count)) {
    marks.push({ kind: 'games', label: `${count} GAMES`, value: String(count), detail: `Your ${count}th game represented` });
  }
  const streak = data.streakBefore + 1;
  if (streak >= 5) {
    marks.push({ kind: 'streak', label: `${streak}-GAME STREAK`, value: String(streak), detail: `${streak} straight games represented` });
  }
  for (const m of game?.milestones ?? []) marks.push(m);
  return marks;
}

export function reducer(state: AppState, action: Action): AppState {
  const { data } = state;
  switch (action.type) {
    case 'loadScenario':
      // a seeded load is a fresh demo run: new art, seats and history, never the art just shown
      return initialState(action.id, action.now, action.seed, action.seed === undefined ? undefined : data.games[0]?.artImage);

    case 'issueTicket': {
      // ONE GAME = ONE TICKET: issuing is idempotent.
      if (data.tickets[action.gameId]) return state;
      const game = data.games.find((g) => g.id === action.gameId);
      if (!game) return state;
      const ticket = issueTicketFor(game, data.fan, action.now);
      return { ...state, data: { ...data, tickets: { ...data.tickets, [game.id]: ticket } } };
    }

    case 'checkIn': {
      const t = data.tickets[action.gameId];
      if (!t || t.checkedInAt) return state;
      return { ...state, data: { ...data, tickets: { ...data.tickets, [t.gameId]: { ...t, checkedInAt: action.now } } } };
    }

    case 'setGameStatus': {
      const games = data.games.map((g) => (g.id === action.gameId ? { ...g, status: action.status } : g));
      let tickets = data.tickets;
      const t = tickets[action.gameId];
      const game = data.games.find((g) => g.id === action.gameId);
      if (action.status === 'final' && t && !t.finalScore && game?.finalScore) {
        // Game final: ADD the score (and any earned marks) to the SAME ticket.
        const marks = earnedMarks(state, action.gameId);
        tickets = { ...tickets, [t.gameId]: { ...t, checkedInAt: t.checkedInAt ?? Date.now(), finalScore: game.finalScore, marks: [...t.marks, ...marks] } };
      }
      return { ...state, data: { ...data, games, tickets } };
    }

    case 'addMark': {
      const t = data.tickets[action.gameId];
      if (!t || t.marks.some((m) => m.label === action.mark.label)) return state;
      return { ...state, data: { ...data, tickets: { ...data.tickets, [t.gameId]: { ...t, marks: [...t.marks, action.mark] } } } };
    }

    case 'activity':
      return {
        ...state,
        activity: { ...state.activity, [action.gameId]: { ...state.activity[action.gameId], ...action.patch } },
      };

    case 'addMemory':
      return { ...state, data: { ...data, memories: [action.memory, ...data.memories] } };

    case 'post':
      return { ...state, data: { ...data, bench: [action.post, ...data.bench] } };

    case 'like':
      return {
        ...state,
        data: {
          ...data,
          bench: data.bench.map((p) => (p.id === action.id ? { ...p, liked: !p.liked, likes: p.likes + (p.liked ? -1 : 1) } : p)),
        },
      };

    case 'setLocation': {
      const fan = { ...data.fan, location: action.location };
      return { ...state, data: { ...data, fan } };
    }

    case 'setPref':
      return { ...state, prefs: { ...state.prefs, [action.key]: action.value } };

    case 'spotlight': {
      const t = data.tickets[action.gameId];
      if (!t || t.fanOfGame) return state;
      return { ...state, data: { ...data, tickets: { ...data.tickets, [t.gameId]: { ...t, fanOfGame: true } } } };
    }

    case 'toggleFollow': {
      const followed = data.followed.includes(action.teamId) ? data.followed.filter((t) => t !== action.teamId) : [...data.followed, action.teamId];
      return { ...state, data: { ...data, followed } };
    }

    case 'recapSeen':
      return { ...state, recapSeen: { ...state.recapSeen, [action.gameId]: true } };
  }
}

function load(): AppState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as AppState;
      if (parsed?.v === 3 && parsed.data?.games) return parsed;
    }
  } catch {
    /* storage unavailable — fall through to a fresh demo */
  }
  return initialState('A');
}

const Ctx = createContext<{ state: AppState; dispatch: React.Dispatch<Action> } | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, undefined, load);
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      /* ignore */
    }
  }, [state]);
  const value = useMemo(() => ({ state, dispatch }), [state]);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useStore() {
  const v = useContext(Ctx);
  if (!v) throw new Error('useStore outside StoreProvider');
  return v;
}
