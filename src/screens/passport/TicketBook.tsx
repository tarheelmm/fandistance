import { useState } from 'react';
import { Link, Navigate, useParams } from 'react-router-dom';
import { useStore } from '../../state/store';
import { allTickets, fmt, gameById, keepsakes, seatShort, teamName } from '../../state/selectors';
import { Scene } from '../../components/Scene';
import { TEAMS } from '../../data/teams';
import { Ticket } from '../../components/Ticket';
import { Icon } from '../../components/Icon';
import { PinBadge } from '../../components/PinBadge';
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
  const title = teamId ? `${teamName(teamId)} ticket book` : 'Ticket book';

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
                {teamName(id)}
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
  const keep = keepsakes(state, t.gameId);
  const isHistory = !current;
  // Older tickets predate per-game keepsakes; their story still notes how the fan took part.
  const pastInvolvement = isHistory ? ['Joined The Bench conversation', 'Trivia completed'] : [];
  const hasKeepsakes = t.pins.length + t.marks.length + keep.count > 0;

  const fmtTime = (ms?: number) => (ms ? new Date(ms).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }) : '');
  const life = [
    { label: 'Issued', done: true, note: current ? `${fmtTime(current.issuedAt)} · artwork printed` : 'Artwork printed' },
    { label: 'Checked in', done: t.checkedIn, note: t.location === 'venue' ? 'At the venue' : 'Beyond the venue' },
    { label: 'Game final', done: !!t.finalScore, note: t.finalScore ? 'Score added' : game?.status === 'live' ? 'In progress' : 'Pending' },
    {
      label: 'Milestone moment',
      done: t.marks.length + t.pins.length > 0,
      note: t.marks.length || t.pins.length ? [...t.marks.map((m) => m.label), ...t.pins.map((p) => p.title)].join(' · ') : 'Only when earned',
    },
  ];

  return (
    <main className="screen theme-dark passport td">
      <PHeader title={`${t.shortDate}, ${t.season}`} back="/passport/tickets" />
      <div className="wrap">
        <div className="td-ticket">
          <Ticket view={t} />
        </div>

        {hasKeepsakes && (
          <section className="td-keeps card" aria-labelledby="keeps-h">
            <h2 id="keeps-h" className="display">
              Memories from this game
            </h2>
            <p className="td-sub">Everything you earned and made on Game Day stays with this ticket.</p>

            {t.pins.length > 0 && (
              <>
                <h3 className="td-h3">Pinned to this ticket</h3>
                <ul className="td-inv td-pins">
                  {t.pins.map((p) => (
                    <li key={p.kind}>
                      <PinBadge kind={p.kind} season={p.season} size={34} /> {p.title}
                    </li>
                  ))}
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

            {keep.memories.length > 0 && (
              <>
                <h3 className="td-h3">Photos &amp; creations</h3>
                <div className="td-mems">
                  {keep.memories.map((m) => (
                    <Link key={m.id} to="/passport/memories" className="mem" aria-label={m.title}>
                      <Scene kind={m.art} colors={m.colors} />
                      <span>{m.title}</span>
                    </Link>
                  ))}
                </div>
              </>
            )}

            {(keep.trivia || keep.poll) && (
              <>
                <h3 className="td-h3">Your picks</h3>
                <ul className="td-inv td-picks">
                  {keep.trivia && (
                    <li>
                      <Icon name="play" size={18} />
                      <span>
                        <small>{keep.trivia.question}</small>
                        <span>
                          You picked <b>{keep.trivia.pick}</b>
                          {keep.trivia.correct ? ' · correct' : ` · the answer was ${keep.trivia.answer}`}
                        </span>
                      </span>
                    </li>
                  )}
                  {keep.poll && (
                    <li>
                      <Icon name="users" size={18} />
                      <span>
                        <small>{keep.poll.question}</small>
                        <span>
                          <b>{keep.poll.pick}</b> · {keep.poll.share}% of fans picked it too
                        </span>
                      </span>
                    </li>
                  )}
                </ul>
              </>
            )}

            {keep.posts.length > 0 && (
              <>
                <h3 className="td-h3">Your posts on The Bench</h3>
                <ul className="td-posts">
                  {keep.posts.map((p) => (
                    <li key={p.id}>
                      <p>“{p.text}”</p>
                      <small>
                        <Icon name="heart" size={13} /> {p.likes} · <Icon name="reply" size={13} /> {p.replies}
                      </small>
                    </li>
                  ))}
                </ul>
              </>
            )}
          </section>
        )}

        <section className="td-story card" aria-labelledby="gs-h">
          <h2 id="gs-h" className="display">
            Game story
          </h2>
          <p className="td-sub">
            {TEAMS[t.awayId].short} @ {home.short} · {t.venue}
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

          {pastInvolvement.length > 0 && (
            <>
              <h3 className="td-h3">Your involvement</h3>
              <ul className="td-inv">
                {pastInvolvement.map((label) => (
                  <li key={label}>
                    <Icon name={label.includes('Bench') ? 'bench' : 'play'} size={18} /> {label}
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
