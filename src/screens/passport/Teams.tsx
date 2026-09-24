import { useState } from 'react';
import { Link, Navigate, useParams } from 'react-router-dom';
import { useStore } from '../../state/store';
import { allTickets, fmt, teamName, teamStats } from '../../state/selectors';
import { LEAGUE_NAMES, TEAMS } from '../../data/teams';
import { MONTHS } from '../../data/history';
import type { League } from '../../data/types';
import { Icon } from '../../components/Icon';
import { TeamMark } from '../../components/TeamMark';
import { TicketArt } from '../../components/TicketArt';
import { PHeader, SectionTitle, Stat, Stub } from './parts';

const LEAGUE_ORDER: League[] = ['MLB', 'NHL', 'NBA', 'NFL', 'MLS', 'WNBA'];

export function Leagues() {
  const { state } = useStore();
  const tickets = allTickets(state);
  const followedLeagues = new Set(state.data.followed.map((id) => TEAMS[id].league));
  return (
    <main className="screen theme-dark passport">
      <PHeader title="Your leagues" />
      <div className="wrap">
        <div className="lg-grid">
          {LEAGUE_ORDER.map((l) => (
            <div key={l} className={`lg-chip ${followedLeagues.has(l) ? 'on' : ''}`}>
              <b>{l}</b>
              <small>{followedLeagues.has(l) ? 'Following' : '—'}</small>
            </div>
          ))}
          <Link to="/passport/add-team" className="lg-chip add" aria-label="Add a team">
            <Icon name="plus" />
          </Link>
        </div>
        <SectionTitle title="Games by league" />
        <div className="card p-list">
          {LEAGUE_ORDER.filter((l) => followedLeagues.has(l)).map((l) => {
            const n = tickets.filter((t) => TEAMS[t.fanTeamId].league === l).length;
            return (
              <div key={l} className="row-link">
                <span className="lg-badge">{l}</span>
                <span className="grow">
                  <strong>{LEAGUE_NAMES[l]}</strong>
                  <small>
                    {n} game{n === 1 ? '' : 's'} represented
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

export function Teams() {
  const { state } = useStore();
  return (
    <main className="screen theme-dark passport">
      <PHeader title="Your teams" />
      <div className="wrap">
        <div className="p-teamlist">
          {state.data.followed.map((id, i) => {
            const st = teamStats(state, id);
            return (
              <Link key={id} to={`/passport/teams/${id}`} className={`p-team ${i === 0 ? 'primary' : ''}`} style={{ ['--team' as string]: TEAMS[id].primary }}>
                <TeamMark id={id} size={44} />
                <span className="grow">
                  <strong>{teamName(id)}</strong>
                  <small>
                    {TEAMS[id].league} · {st.games} game{st.games === 1 ? '' : 's'}
                    {st.games ? ` · ${fmt(st.miles)} miles` : ''}
                  </small>
                </span>
                <Icon name="chevron" size={18} />
              </Link>
            );
          })}
        </div>
        <Link to="/passport/add-team" className="btn block ghost add-team-btn">
          <Icon name="plus" size={18} /> Add a team
        </Link>
      </div>
    </main>
  );
}

export function TeamHome() {
  const { teamId = '' } = useParams();
  const { state } = useStore();
  const team = TEAMS[teamId];
  if (!team) return <Navigate to="/passport/teams" replace />;
  const st = teamStats(state, teamId);
  return (
    <main className="screen theme-dark passport">
      <PHeader title={teamName(teamId)} back="/passport/teams" />
      <div className="wrap">
        <div className="th-hero" style={{ ['--team' as string]: team.primary }}>
          <div className="th-art">
            <TicketArt theme={st.tickets[0]?.art ?? 'baltimore-harbor'} image={st.tickets[0]?.artImage} date="" time="" lite />
          </div>
          <div className="th-id">
            <TeamMark id={teamId} size={64} />
            <div>
              <strong className="display">{teamName(teamId)}</strong>
              <small>
                {team.league} · {team.venue}
              </small>
            </div>
          </div>
        </div>
        <div className="p-stats three">
          <Stat value={st.games} label="Games" accent />
          <Stat value={fmt(st.miles)} label="Miles" accent />
          <Stat value={st.seasons.length} label={st.seasons.length === 1 ? 'Season' : 'Seasons'} />
        </div>

        {st.games > 0 ? (
          <>
            <SectionTitle title="Your ticket book" to={`/passport/tickets/${teamId}`} link={`All ${st.games}`} />
            <div className="p-book-strip">
              {st.tickets.slice(0, 6).map((t) => (
                <Stub key={t.id} t={t} />
              ))}
            </div>
            <SectionTitle title="Team stats & history" />
            <div className="card p-list">
              <div className="row-link">
                <Icon name="trophy" size={22} />
                <span className="grow">
                  <strong>
                    {st.wins}–{st.losses} when you represented
                  </strong>
                  <small>Record across {st.games} games</small>
                </span>
              </div>
              {st.seasons.map((s) => {
                const ts = st.tickets.filter((t) => t.season === s);
                return (
                  <Link key={s} to={`/passport/seasons/${s}`} className="row-link">
                    <Icon name="calendar" size={22} />
                    <span className="grow">
                      <strong>{s} season</strong>
                      <small>
                        {ts.length} games · {ts.filter((t) => t.result === 'W').length}–{ts.filter((t) => t.result === 'L').length} ·{' '}
                        {fmt(ts.reduce((n, t) => n + t.distanceMiles, 0))} miles
                      </small>
                    </span>
                    <Icon name="chevron" size={18} />
                  </Link>
                );
              })}
            </div>
          </>
        ) : (
          <p className="p-empty">No games represented with the {team.name} yet. Your first ticket will start this book.</p>
        )}
      </div>
    </main>
  );
}

export function SeasonSummary() {
  const { season = '' } = useParams();
  const { state } = useStore();
  const tickets = allTickets(state).filter((t) => t.season === season);
  const wins = tickets.filter((t) => t.result === 'W').length;
  const losses = tickets.filter((t) => t.result === 'L').length;
  const miles = tickets.reduce((n, t) => n + t.distanceMiles, 0);
  const byMonth = MONTHS.map((m) => ({ m, n: tickets.filter((t) => t.shortDate.startsWith(m)).length }));
  const max = Math.max(1, ...byMonth.map((b) => b.n));
  const leagues = [...new Set(tickets.map((t) => TEAMS[t.fanTeamId].league))];
  const last = tickets[0];
  return (
    <main className="screen theme-dark passport">
      <PHeader title={`${season} season`} />
      <div className="wrap">
        <div className="ss-head card">
          <span className="eyebrow">{leagues.join(' · ')}</span>
          <strong className="display">Your {season} season</strong>
          {last && (
            <small>
              Through {last.shortDate}, {season}
            </small>
          )}
        </div>
        <div className="p-stats three">
          <Stat value={tickets.length} label="Games represented" accent />
          <Stat value={fmt(miles)} label="Miles represented" accent />
          <Stat value={`${wins}-${losses}`} label="Record when you watched" />
        </div>
        <SectionTitle title="Monthly breakdown" />
        <div className="card ss-chart" role="img" aria-label={byMonth.map((b) => `${b.m}: ${b.n}`).join(', ')}>
          {byMonth.map((b) => (
            <div key={b.m} className="ss-col">
              <span className="ss-n">{b.n}</span>
              <span className="ss-bar" style={{ height: `${(b.n / max) * 100}%` }} />
              <span className="ss-m">{b.m}</span>
            </div>
          ))}
        </div>
        <SectionTitle title="Tickets this season" />
        <div className="tb-grid">
          {tickets.map((t) => (
            <Stub key={t.id} t={t} />
          ))}
        </div>
      </div>
    </main>
  );
}

export function AddTeam() {
  const { state, dispatch } = useStore();
  const [q, setQ] = useState('');
  const [league, setLeague] = useState<string | null>(null);
  const list = Object.values(TEAMS).filter((t) => (!league || t.league === league) && (!q || `${t.city} ${t.name} ${t.league}`.toLowerCase().includes(q.toLowerCase())));
  return (
    <main className="screen theme-dark passport">
      <PHeader title="Add a team" back="/passport/teams" />
      <div className="wrap">
        <p className="p-sub">Build your fandom. Choose a league.</p>
        <div className="lg-grid">
          {LEAGUE_ORDER.map((l) => (
            <button key={l} className={`lg-chip ${league === l ? 'on' : ''}`} aria-pressed={league === l} onClick={() => setLeague(league === l ? null : l)}>
              <b>{l}</b>
            </button>
          ))}
        </div>
        <label className="p-search">
          <Icon name="search" size={18} />
          <span className="sr-only">Search for your team</span>
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search for your team" />
        </label>
        <div className="card p-list">
          {list.map((t) => {
            const on = state.data.followed.includes(t.id);
            return (
              <div key={t.id} className="row-link">
                <TeamMark id={t.id} size={36} />
                <span className="grow">
                  <strong>{teamName(t.id)}</strong>
                  <small>{t.league}</small>
                </span>
                <button className={`follow ${on ? 'on' : ''}`} aria-pressed={on} onClick={() => dispatch({ type: 'toggleFollow', teamId: t.id })}>
                  {on ? 'Following' : 'Follow'}
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </main>
  );
}
