import { useState } from 'react';
import { gamesLabel, gamesMiles } from '../../state/format';
import { Link } from 'react-router-dom';
import { useStore } from '../../state/store';
import { allTickets, badges, fmt, teamName, totals } from '../../state/selectors';
import type { Badge, Memory } from '../../data/types';
import { Icon } from '../../components/Icon';
import { Scene } from '../../components/Scene';
import { BadgeMedal, PHeader, SectionTitle, Stat } from './parts';
import { MemorableGames } from './PassportHome';

const GROUPS: { id: Badge['group'][]; title: string }[] = [
  { id: ['milestone'], title: 'Milestone badges' },
  { id: ['streak'], title: 'Streak badges' },
  { id: ['special', 'family', 'multi-team', 'founding'], title: 'Special badges' },
];

/** Recognition, not competition: no XP, no points, no rankings. */
export function Recognition() {
  const { state } = useStore();
  const all = badges(state);
  const [scope, setScope] = useState<'all' | 'fandistance' | 'team'>('all');
  const shown = all.filter((b) => scope === 'all' || b.scope === scope);
  return (
    <main className="screen theme-dark passport">
      <PHeader title="Recognition" />
      <div className="wrap">
        <p className="p-sub">Badges you’ve earned by representing. Recognition is based on your story — never a score.</p>
        <div className="chip-row">
          {(
            [
              ['all', `All (${all.length})`],
              ['fandistance', `FanDistance (${all.filter((b) => b.scope === 'fandistance').length})`],
              ['team', `Team (${all.filter((b) => b.scope === 'team').length})`],
            ] as const
          ).map(([k, l]) => (
            <button key={k} className="chip" aria-pressed={scope === k} onClick={() => setScope(k)}>
              {l}
            </button>
          ))}
        </div>
        {GROUPS.map((g) => {
          const list = shown.filter((b) => g.id.includes(b.group));
          if (!list.length) return null;
          return (
            <section key={g.title}>
              <SectionTitle title={g.title} />
              <div className="badge-grid">
                {list.map((b) => (
                  <div key={b.id} className={`badge-cell ${b.earned ? '' : 'locked'}`}>
                    <BadgeMedal b={b} size={62} />
                    <strong>{b.label}</strong>
                    <small>{b.earned ? b.sub : 'Not yet'}</small>
                  </div>
                ))}
              </div>
            </section>
          );
        })}
      </div>
    </main>
  );
}

export function FanStats() {
  const { state } = useStore();
  const { games, miles, tickets } = totals(state);
  const longest = Math.max(5, state.data.streakBefore + 1);
  const special = tickets.filter((t) => t.marks.length).length;
  const venue = tickets.filter((t) => t.location === 'venue').length;
  return (
    <main className="screen theme-dark passport">
      <PHeader title="Fan stats" />
      <div className="wrap">
        <p className="p-sub">All sports · all teams · your impact over time.</p>
        <div className="p-stats four">
          <Stat value={fmt(games)} label="Games represented" accent />
          <Stat value={fmt(miles)} label="Miles represented" accent />
          <Stat value={longest} label="Longest streak" />
          <Stat value={special} label="Special games" />
        </div>
        <div className="card p-list">
          <div className="row-link">
            <Icon name="map" size={22} />
            <span className="grow">
              <strong>Beyond the venue</strong>
              <small>{gamesLabel(games - venue)} represented from somewhere else</small>
            </span>
          </div>
          <div className="row-link">
            <Icon name="gameday" size={22} />
            <span className="grow">
              <strong>At the venue</strong>
              <small>
                {venue} game{venue === 1 ? '' : 's'} represented in person
              </small>
            </span>
          </div>
        </div>
        <SectionTitle title="Big games" />
        <MemorableGames />
        <SectionTitle title="By team" />
        <div className="card p-list">
          {[...new Set(allTickets(state).map((t) => t.fanTeamId))].map((id) => {
            const ts = tickets.filter((t) => t.fanTeamId === id);
            return (
              <div key={id} className="row-link">
                <Icon name="ticket" size={20} />
                <span className="grow">
                  <strong>{teamName(id)}</strong>
                  <small>
                    {gamesMiles(
                      ts.length,
                      ts.reduce((n, t) => n + t.distanceMiles, 0),
                    )}
                  </small>
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </main>
  );
}

export function Memories() {
  const { state, dispatch } = useStore();
  const [tab, setTab] = useState<'all' | Memory['kind']>('all');
  const list = state.data.memories.filter((m) => tab === 'all' || m.kind === tab);
  const add = () =>
    dispatch({
      type: 'addMemory',
      memory: {
        id: `mem-${Date.now()}`,
        kind: 'photo',
        title: 'New memory',
        date: 'Today',
        art: (['skyline', 'fan', 'ballpark', 'fireworks'] as const)[state.data.memories.length % 4],
      },
    });
  return (
    <main className="screen theme-dark passport">
      <PHeader title="Memories" />
      <div className="wrap">
        <p className="p-sub">Your moments, your way. You control what you collect and share.</p>
        <div className="chip-row">
          {(
            [
              ['all', 'All'],
              ['photo', 'Photos'],
              ['creation', 'Creations'],
              ['activity', 'Activities'],
            ] as const
          ).map(([k, l]) => (
            <button key={k} className="chip" aria-pressed={tab === k} onClick={() => setTab(k)}>
              {l}
            </button>
          ))}
          <Link to="/passport/pins" className="chip">
            Season pins →
          </Link>
        </div>
        <div className="mem-grid">
          {list.map((m) => (
            <figure key={m.id} className="mem">
              <Scene kind={m.art} colors={m.colors} />
              <figcaption>
                <strong>{m.title}</strong>
                <small>{m.date}</small>
              </figcaption>
            </figure>
          ))}
        </div>
        <button className="btn block ghost add-team-btn" onClick={add}>
          <Icon name="plus" size={18} /> Add new memory
        </button>
      </div>
    </main>
  );
}
