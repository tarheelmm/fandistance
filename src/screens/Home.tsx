import { useState } from 'react';
import { gamesLabel, plural, scorePair } from '../state/format';
import { Link, useNavigate } from 'react-router-dom';
import { useStore } from '../state/store';
import { eligibleGames, fmt, lastGame, minutesUntil, nextGame, seatLine, teamName, ticketedToday, ticketView, totals } from '../state/selectors';
import { useNow } from '../state/hooks';
import { TEAMS } from '../data/teams';
import type { Game } from '../data/types';
import { Lockup } from '../components/FDMark';
import { TeamMark } from '../components/TeamMark';
import { Ticket } from '../components/Ticket';
import { Icon } from '../components/Icon';
import { PassportToday } from '../components/PassportToday';
import { PushNotification } from '../components/PushNotification';
import './home.css';

export function Home() {
  const { state } = useStore();
  const navigate = useNavigate();
  const now = useNow();
  const eligible = eligibleGames(state);
  const held = ticketedToday(state);
  const next = nextGame(state);
  const [reminderClosed, setReminderClosed] = useState(false);

  // The game you're already part of stays dominant; other ready games surface as in-app reminders.
  const primary = held.find((g) => g.status !== 'final') ?? eligible[0] ?? next;
  const showReminder = held.length > 0 && eligible.length > 0 && !reminderClosed;
  const others = showReminder ? [] : eligible.filter((g) => g.id !== primary?.id);
  const recapGame = held.find((g) => g.status === 'final');
  const last = lastGame(state);
  const { games } = totals(state);

  // Tapping the notification or an eligible game begins ticket generation immediately.
  const getTicket = (g: Game) => navigate(`/ticket/${g.id}/print`);

  return (
    <main className="screen theme-dark home">
      {eligible.length > 0 && held.length === 0 && <PushNotification games={eligible} onOpen={() => getTicket(eligible[0])} />}

      <header className="home-head wrap">
        <Lockup />
        <Link to="/passport/locker-room" className="home-avatar" aria-label="Your Locker Room">
          <span>{state.data.fan.name[0]}</span>
        </Link>
      </header>

      <div className="wrap">
        <p className="home-hello">
          Welcome back, {state.data.fan.name}! <span>{primary?.status === 'final' || !primary ? 'Your fandom history is up to date.' : 'Ready for tonight.'}</span>
        </p>

        {showReminder && (
          <div className="multi-reminder" role="status">
            <div>
              <strong>
                {eligible.length} more game{eligible.length > 1 ? 's' : ''} {eligible.length > 1 ? 'are' : 'is'} ready
              </strong>
              <small>{eligible.map((g) => `${teamName(g.homeId)} · ${g.timeLabel.replace(' ET', '')}`).join('  •  ')}</small>
              <button className="mr-cta" onClick={() => getTicket(eligible[0])}>
                Get {eligible.length > 1 ? 'their tickets' : 'your ticket'} →
              </button>
            </div>
            <button className="icon-btn" aria-label="Dismiss" onClick={() => setReminderClosed(true)}>
              <Icon name="close" size={18} />
            </button>
          </div>
        )}

        {primary && <NextGame game={primary} now={now} onGetTicket={getTicket} />}

        {others.length > 0 && (
          <section aria-label="Also ready tonight">
            <div className="section-title">
              <h2>Also ready tonight</h2>
            </div>
            <div className="also-list">
              {others.map((g) => (
                <button key={g.id} className="also-row card" onClick={() => getTicket(g)}>
                  <TeamMark id={g.homeId} size={40} />
                  <span className="grow">
                    <strong>
                      {TEAMS[g.homeId].short} vs {TEAMS[g.awayId].short}
                    </strong>
                    <small>
                      {TEAMS[g.homeId].league} · {g.timeLabel}
                    </small>
                  </span>
                  <span className="also-cta">Get ticket</span>
                </button>
              ))}
            </div>
          </section>
        )}

        {recapGame && state.data.tickets[recapGame.id] ? (
          <GameRecap gameId={recapGame.id} />
        ) : (
          last && (
            <section aria-labelledby="last-h">
              <div className="section-title">
                <h2 id="last-h">Last game</h2>
                <Link to={`/passport/ticket/${last.id}`}>Recap</Link>
              </div>
              <Link to={`/passport/ticket/${last.id}`} className="last-game card">
                <div className="lg-thumb">
                  <Ticket view={last} lite />
                </div>
                <div className="lg-body">
                  <div className="eyebrow">
                    {last.shortDate}, {last.season} · Final
                  </div>
                  <div className="lg-score">
                    <span>{scorePair(last)[0]}</span>
                    <span>{scorePair(last)[1]}</span>
                  </div>
                  <div className={`lg-result ${last.result === 'W' ? 'w' : 'l'}`}>{last.result === 'W' ? 'Win' : 'Loss'} while you represented</div>
                  <small>{seatLine(last.seat)}</small>
                </div>
              </Link>
            </section>
          )
        )}

        <div className="section-title">
          <h2>Your fandom</h2>
          <Link to="/passport">Open Passport</Link>
        </div>
        <PassportToday gameId={(held[0] ?? primary)?.id} cta="Open Passport" variant="card" />
        <p className="home-foot">
          {gamesLabel(games)} represented · {plural(state.data.followed.length, 'team')} · since {state.data.fan.fanSince}
        </p>
      </div>
    </main>
  );
}

function NextGame({ game, now, onGetTicket }: { game: Game; now: number; onGetTicket: (g: Game) => void }) {
  const { state } = useStore();
  const home = TEAMS[game.homeId];
  const away = TEAMS[game.awayId];
  const ticket = state.data.tickets[game.id];
  const mins = minutesUntil(state, game, now);
  const windowOpen = !ticket && (game.status === 'window' || game.status === 'live');
  const opensAt = game.timeLabel.replace(/(\d+):(\d+)/, (_, h: string, m: string) => `${Number(h) === 1 ? 12 : Number(h) - 1}:${m}`);

  return (
    <section className={`next-game ${windowOpen ? 'is-open' : ''}`} aria-labelledby="ng-h" style={{ ['--team' as string]: home.primary }}>
      <div className="ng-top">
        <span className="eyebrow" id="ng-h">
          Next game
        </span>
        {game.status === 'live' ? (
          <span className="pill live">Live</span>
        ) : game.status === 'final' ? (
          <span className="pill ng-final">Final</span>
        ) : mins > 0 && mins < 180 ? (
          <span className="pill ng-count">First pitch in {mins} min</span>
        ) : (
          <span className="pill ng-count">{game.dateLabel.split(',')[0]}</span>
        )}
      </div>

      {windowOpen && (
        <button className="ng-getinline" onClick={() => onGetTicket(game)}>
          <span className="display">
            Get in line,
            <br />
            it’s almost game time!
          </span>
        </button>
      )}

      <div className="ng-matchup">
        <div className="ng-team">
          <TeamMark id={home.id} size={64} />
          <span>{home.short}</span>
        </div>
        <span className="ng-vs">vs</span>
        <div className="ng-team">
          <TeamMark id={away.id} size={64} />
          <span>{away.short}</span>
        </div>
      </div>
      <div className="ng-meta">
        <strong>
          {game.dateLabel} · {game.timeLabel}
        </strong>
        <span>{game.venue}</span>
      </div>

      {windowOpen && (
        <>
          <button className="btn block ng-cta" onClick={() => onGetTicket(game)}>
            Get today’s ticket
          </button>
          <p className="ng-note">Your ticket window is open. It’s printed the moment you tap.</p>
        </>
      )}

      {ticket && (
        <Link to={`/gameday/${game.id}`} className="ng-held">
          <div className="ng-held-thumb">
            <Ticket view={ticketView(state, ticket)} lite />
          </div>
          <div className="ng-held-body">
            <span className="eyebrow">Your ticket</span>
            <strong>{seatLine(ticket.seat)}</strong>
            <span className="btn ng-enter">{game.status === 'final' ? 'View game' : 'Enter Game Day'}</span>
          </div>
        </Link>
      )}

      {!ticket && game.status === 'scheduled' && (
        <p className="ng-note ng-closed">
          <Icon name="bell" size={16} /> Tickets open 1 hour before first pitch · {opensAt}. We’ll let you know.
        </p>
      )}
    </section>
  );
}

function GameRecap({ gameId }: { gameId: string }) {
  const { state } = useStore();
  const t = state.data.tickets[gameId];
  const view = ticketView(state, t);
  const home = TEAMS[view.homeId];
  const away = TEAMS[view.awayId];
  const act = state.activity[gameId] ?? {};
  const acts = [act.trivia, act.poll, act.coloring, act.photo].filter(Boolean).length;
  const { games } = totals(state);
  return (
    <section aria-labelledby="recap-h" className="recap">
      <div className="section-title">
        <h2 id="recap-h">Game recap</h2>
        <Link to={`/passport/ticket/${t.id}`}>Your ticket</Link>
      </div>
      <Link to={`/passport/ticket/${t.id}`} className="recap-card card">
        <div className="recap-score">
          <span className="eyebrow">Last game · Final</span>
          <div className="display">
            {home.short} {view.finalScore!.home} · {away.short} {view.finalScore!.away}
          </div>
        </div>
        <div className="recap-grid">
          <div className="recap-ticket">
            <Ticket view={view} lite />
          </div>
          <ul className="check-list">
            <li>
              <span className="tick">
                <Icon name="check" size={13} stroke={3} />
              </span>
              Game {games} represented
            </li>
            <li>
              <span className="tick">
                <Icon name="check" size={13} stroke={3} />
              </span>
              {seatLine(t.seat)}
            </li>
            <li>
              <span className="tick">
                <Icon name="check" size={13} stroke={3} />
              </span>
              {t.location === 'venue' ? 'Represented at the venue' : `${fmt(t.distanceMiles)} miles represented`}
            </li>
            <li>
              <span className="tick">
                <Icon name="check" size={13} stroke={3} />
              </span>
              You joined {fmt(t.joinedCount + 1)} fans
            </li>
            {acts > 0 && (
              <li>
                <span className="tick">
                  <Icon name="check" size={13} stroke={3} />
                </span>
                {acts} {acts > 1 ? 'activities' : 'activity'} completed
              </li>
            )}
            {view.pins.map((p) => (
              <li key={p.kind}>
                <span className="tick gold">
                  <Icon name="star" size={12} stroke={2.6} />
                </span>
                New pin: {p.title}
              </li>
            ))}
            {t.marks.map((m) => (
              <li key={m.label}>
                <span className="tick gold">
                  <Icon name="star" size={12} stroke={2.6} />
                </span>
                {m.detail}
              </li>
            ))}
          </ul>
        </div>
        <p className="recap-note">Same ticket, now with the final score. It lives in your Passport.</p>
      </Link>
    </section>
  );
}
