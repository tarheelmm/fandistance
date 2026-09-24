import { useState } from 'react';
import { Link, Navigate, useParams } from 'react-router-dom';
import { useStore } from '../../state/store';
import { allTickets, fmt, gameById, seatShort, teamName } from '../../state/selectors';
import { TEAMS } from '../../data/teams';
import { Ticket } from '../../components/Ticket';
import { Icon } from '../../components/Icon';
import { PHeader, Stub } from './parts';

/** Every ticket, kept forever: original artwork, seat, final score, earned marks. */
export function TicketBook() {
  const { teamId } = useParams();
  const { state } = useStore();
  const all = allTickets(state);
  const scoped = teamId ? all.filter((t) => t.fanTeamId === teamId) : all;
  const seasons = [...new Set(scoped.map((t) => t.season))].sort().reverse();
  const teams = [...new Set(all.map((t) => t.fanTeamId))];
  const [season, setSeason] = useState<string>('all');
  const [team, setTeam] = useState<string>('all');
  const shown = scoped.filter((t) => (season === 'all' || t.season === season) && (teamId || team === 'all' || t.fanTeamId === team));
  const title = teamId ? `${TEAMS[teamId].name} ticket book` : 'Ticket book';

  return (
    <main className="screen theme-dark passport">
      <PHeader title={title} back={teamId ? `/passport/teams/${teamId}` : '/passport'} />
      <div className="wrap">
        <p className="tb-count">
          <b className="display">{shown.length}</b> {shown.length === 1 ? 'ticket' : 'tickets'} · one game, one ticket
        </p>
        <div className="chip-row" role="group" aria-label="Season">
          <button className="chip" aria-pressed={season === 'all'} onClick={() => setSeason('all')}>
            All
          </button>
          {seasons.map((s) => (
            <button key={s} className="chip" aria-pressed={season === s} onClick={() => setSeason(s)}>
              {s} season
            </button>
          ))}
        </div>
        {!teamId && teams.length > 1 && (
          <div className="chip-row tb-teams" role="group" aria-label="Team">
            <button className="chip" aria-pressed={team === 'all'} onClick={() => setTeam('all')}>
              All teams
            </button>
            {teams.map((id) => (
              <button key={id} className="chip" aria-pressed={team === id} onClick={() => setTeam(id)}>
                {TEAMS[id].name}
              </button>
            ))}
          </div>
        )}
        <div className="tb-grid">
          {shown.map((t) => (
            <Stub key={t.id} t={t} />
          ))}
        </div>
      </div>
    </main>
  );
}

/** A single ticket, revisited: the same artifact issued before the game, plus its story. */
export function TicketDetail() {
  const { ticketId = '' } = useParams();
  const { state } = useStore();
  const all = allTickets(state);
  const t = all.find((x) => x.id === ticketId);
  if (!t) return <Navigate to="/passport/tickets" replace />;
  const home = TEAMS[t.homeId];
  const current = state.data.tickets[t.gameId];
  const game = gameById(state, t.gameId);
  const act = state.activity[t.gameId] ?? {};
  const memories = state.data.memories.filter((m) => m.gameId === t.gameId);
  const isHistory = !current;

  const involvement: [string, string][] = [];
  if (act.coloring) involvement.push(['create', 'Coloring page saved']);
  if (act.trivia) involvement.push(['play', 'Trivia completed']);
  if (act.poll) involvement.push(['play', 'Fan poll answered']);
  if (act.photo) involvement.push(['camera', 'Photo saved from the Ballpark']);
  if (act.posted) involvement.push(['bench', `${act.posted} post${act.posted > 1 ? 's' : ''} on The Bench`]);
  if (isHistory) involvement.push(['bench', 'Joined The Bench conversation'], ['play', 'Trivia completed']);

  const fmtTime = (ms?: number) => (ms ? new Date(ms).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }) : '');
  const life = [
    { label: 'Issued', done: true, note: current ? `${fmtTime(current.issuedAt)} · artwork printed` : 'Artwork printed' },
    { label: 'Checked in', done: t.checkedIn, note: t.location === 'venue' ? 'At the venue' : 'Beyond the venue' },
    { label: 'Game final', done: !!t.finalScore, note: t.finalScore ? 'Score added' : game?.status === 'live' ? 'In progress' : 'Pending' },
    { label: 'Milestone moment', done: t.marks.length > 0, note: t.marks.length ? t.marks.map((m) => m.label).join(' · ') : 'Only when earned' },
  ];

  return (
    <main className="screen theme-dark passport td">
      <PHeader title={`${t.shortDate}, ${t.season}`} back="/passport/tickets" />
      <div className="wrap">
        <div className="td-ticket">
          <Ticket view={t} />
        </div>

        <section className="td-story card" aria-labelledby="gs-h">
          <h2 id="gs-h" className="display">
            Game story
          </h2>
          <p className="td-sub">
            {TEAMS[t.awayId].name} @ {home.name} · {t.venue}
          </p>
          <ul className="check-list">
            <li>
              <span className="tick">
                <Icon name="check" size={13} stroke={3} />
              </span>
              Game represented
            </li>
            <li>
              <span className="tick">
                <Icon name="check" size={13} stroke={3} />
              </span>
              Ticket collected
            </li>
            <li>
              <span className="tick">
                <Icon name="check" size={13} stroke={3} />
              </span>
              {seatShort(t.seat)}
            </li>
            <li>
              <span className="tick">
                <Icon name="check" size={13} stroke={3} />
              </span>
              {t.location === 'venue' ? `Represented at ${home.venue.split(' at ')[0]}` : `${fmt(t.distanceMiles)} miles from the ${home.sport === 'baseball' ? 'park' : 'venue'}`}
            </li>
            {t.result && (
              <li>
                <span className="tick">
                  <Icon name="check" size={13} stroke={3} />
                </span>
                {t.result === 'W' ? 'A win' : 'A loss'} while you represented
              </li>
            )}
          </ul>

          {involvement.length > 0 && (
            <>
              <h3 className="td-h3">Your involvement</h3>
              <ul className="td-inv">
                {involvement.map(([icon, label]) => (
                  <li key={label}>
                    <Icon name={icon as 'play'} size={18} /> {label}
                  </li>
                ))}
                {memories.length > 0 && (
                  <li>
                    <Icon name="image" size={18} /> {memories.length} memor{memories.length > 1 ? 'ies' : 'y'} added
                  </li>
                )}
              </ul>
            </>
          )}

          {t.marks.length > 0 && (
            <>
              <h3 className="td-h3">Recognition earned</h3>
              <ul className="td-inv">
                {t.marks.map((m) => (
                  <li key={m.label}>
                    <Icon name="star" size={18} /> {m.detail}
                  </li>
                ))}
              </ul>
            </>
          )}
        </section>

        <section className="td-life card" aria-labelledby="life-h">
          <h2 id="life-h" className="display">
            One ticket. Your story.
          </h2>
          <p className="td-sub">This is the ticket issued before the game. Everything since has been added to it — the artwork never changes.</p>
          <ol className="life">
            {life.map((s) => (
              <li key={s.label} className={s.done ? 'done' : ''}>
                <span className="life-dot">{s.done && <Icon name="check" size={12} stroke={3} />}</span>
                <div>
                  <strong>{s.label}</strong>
                  <small>{s.note}</small>
                </div>
              </li>
            ))}
          </ol>
        </section>

        <Link to={`/passport/teams/${t.fanTeamId}`} className="p-locker card">
          <Icon name="ticket" size={26} />
          <span className="grow">
            <strong>{teamName(t.fanTeamId)} ticket book</strong>
            <small>See every ticket with this team</small>
          </span>
          <Icon name="chevron" size={18} />
        </Link>
      </div>
    </main>
  );
}
