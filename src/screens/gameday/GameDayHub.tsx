import { useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useStore, type GameActivity } from '../../state/store';
import { eligibleGames, fmt, gameById, minutesUntil, nextGame, ticketedToday, ticketView } from '../../state/selectors';
import { useNow } from '../../state/hooks';
import { TEAMS } from '../../data/teams';
import type { Game } from '../../data/types';
import { TeamMark } from '../../components/TeamMark';
import { Ticket } from '../../components/Ticket';
import { Icon, type IconName } from '../../components/Icon';
import { PassportToday } from '../../components/PassportToday';
import './gameday.css';

export const AREAS: { id: string; title: string; icon: IconName; color: string; blurb: string }[] = [
  { id: 'ballpark', title: 'From the Ballpark', icon: 'camera', color: '#6d4fd8', blurb: 'Live looks, photos and updates' },
  { id: 'play', title: 'Play', icon: 'play', color: '#2f9e5b', blurb: 'Trivia, games and polls' },
  { id: 'create', title: 'Create', icon: 'create', color: '#f26a1b', blurb: 'Color, draw and share your art' },
  { id: 'bench', title: 'The Bench', icon: 'bench', color: '#5b46c9', blurb: 'See what fans are saying' },
  { id: 'around', title: 'Around You', icon: 'around', color: '#1b8ea6', blurb: 'Fans and watch spots near you' },
  { id: 'team', title: 'Team & Offers', icon: 'star', color: '#e2542b', blurb: 'Official news and offers' },
];

/** Once per session: the score is "added" to the ticket in front of the fan. */
const scoreSeen = new Set<string>();

export function statusLine(g: Game, mins: number) {
  if (g.status === 'final') return 'Final';
  if (g.status === 'live') return mins > -25 ? 'Top 1st' : mins > -60 ? 'Top 3rd' : 'Bottom 5th';
  return mins > 0 ? `Pregame · first pitch in ${mins} min` : 'Pregame';
}

export function GameDayHub() {
  const { gameId } = useParams();
  const { state } = useStore();
  const navigate = useNavigate();
  const now = useNow();
  const held = ticketedToday(state);
  const game = (gameId && gameById(state, gameId)) || held.find((g) => g.status !== 'final') || held[0];

  if (!game || !state.data.tickets[game.id]) return <NoActiveGame />;

  const t = state.data.tickets[game.id];
  const view = ticketView(state, t);
  const home = TEAMS[game.homeId];
  const away = TEAMS[game.awayId];
  const mins = minutesUntil(state, game, now);
  const justCheckedIn = t.checkedInAt && Date.now() - t.checkedInAt < 4000;
  const act = state.activity[game.id] ?? {};
  const benchCount = 4328 + state.data.bench.filter((p) => p.mine).length;
  const showScoreIn = !!t.finalScore && !scoreSeen.has(game.id);

  return (
    <main className="screen theme-light gd">
      <header className="gd-head">
        <div className="gd-bar">
          <span className="icon-btn" aria-hidden="true" />
          <h1>Game Day Hub</h1>
          <button className="icon-btn" aria-label="Search Game Day">
            <Icon name="search" />
          </button>
        </div>

        {held.length > 1 && (
          <div className="chip-row gd-switch" role="tablist" aria-label="Your games today">
            {held.map((g) => (
              <button
                key={g.id}
                role="tab"
                className="chip"
                aria-pressed={g.id === game.id}
                aria-selected={g.id === game.id}
                onClick={() => navigate(`/gameday/${g.id}`, { replace: true })}
              >
                {TEAMS[g.homeId].short} {TEAMS[g.homeId].sport === 'football' ? 'Football' : TEAMS[g.homeId].name}
              </button>
            ))}
          </div>
        )}

        <div className="gd-game">
          <div className="gd-game-main">
            <div className="gd-teams">
              <TeamMark id={home.id} size={34} />
              <TeamMark id={away.id} size={34} />
            </div>
            <h2 className="gd-matchup">
              {home.short} <span>vs</span> {away.short}
            </h2>
            <p className="gd-when">
              {game.dateLabel.replace(/^\w+, /, '')} • {game.timeLabel}
            </p>
            <div className="gd-status">
              {game.status === 'live' && <span className="pill live">Live</span>}
              {game.status === 'final' ? (
                <span className="gd-final">
                  Final · {home.abbr} {t.finalScore?.home ?? game.finalScore?.home} – {away.abbr} {t.finalScore?.away ?? game.finalScore?.away}
                </span>
              ) : (
                <span className="gd-state">{statusLine(game, mins)}</span>
              )}
            </div>
            <p className="gd-venue">
              <Icon name="around" size={14} /> {game.venue}
            </p>
          </div>
          <Link to={`/ticket/${game.id}`} className="gd-ticket" aria-label="Open your ticket and seat">
            <Ticket view={view} lite stampIn={!!justCheckedIn} scoreIn={showScoreIn} />
          </Link>
        </div>
        <p className="gd-seat">
          <Icon name="ticket" size={15} /> {t.seat.kind === 'seat' ? `Section ${t.seat.section} • Row ${t.seat.row} • Seat ${t.seat.seat}` : 'Standing Room Only'}
          <span>·</span> {fmt(t.joinedCount)} fans here tonight
        </p>
      </header>

      <div className="wrap">
        {game.status === 'final' && <FinalBanner gameId={game.id} />}

        <nav className="gd-grid" aria-label="Tonight’s game">
          {AREAS.map((a) => (
            <Link key={a.id} to={`/gameday/${game.id}/${a.id}`} className={`gd-tile tile-${a.id}`} style={{ ['--c' as string]: a.color }}>
              <span className="gd-tile-icon">
                <Icon name={a.icon} size={26} />
              </span>
              <strong>{a.title}</strong>
              <small>{tileSnippet(a.id, game, { benchCount, act })}</small>
            </Link>
          ))}
        </nav>

        <PassportToday gameId={game.id} to={`/passport/ticket/${t.id}`} />
      </div>
    </main>
  );
}

function tileSnippet(id: string, g: Game, ctx: { benchCount: number; act: GameActivity }) {
  const live = g.status === 'live';
  switch (id) {
    case 'ballpark':
      return live ? 'Live now · 3 new moments' : g.status === 'final' ? 'Top moments from tonight' : 'Batting practice photos';
    case 'play':
      return ctx.act.trivia ? 'Trivia answered · poll open' : 'Tonight’s trivia is open';
    case 'create':
      return ctx.act.coloring ? 'Coloring page saved' : 'Today’s coloring page';
    case 'bench':
      return `${fmt(ctx.benchCount)} fans in the thread`;
    case 'around':
      return '143 fans within 25 miles';
    default:
      return '10% off at the Team Store';
  }
}

function FinalBanner({ gameId }: { gameId: string }) {
  useEffect(() => {
    const t = setTimeout(() => scoreSeen.add(gameId), 1200);
    return () => clearTimeout(t);
  }, [gameId]);
  return (
    <div className="gd-final-banner" role="status">
      <Icon name="ticket" size={20} />
      <div>
        <strong>Game final. Your ticket has been updated.</strong>
        <small>The final score was added to the same ticket you got before the game. It’s saved in your Passport.</small>
      </div>
    </div>
  );
}

function NoActiveGame() {
  const { state } = useStore();
  const navigate = useNavigate();
  const eligible = eligibleGames(state);
  const next = nextGame(state);
  const g = eligible[0] ?? next;
  return (
    <main className="screen theme-light gd">
      <header className="gd-head">
        <div className="gd-bar">
          <span className="icon-btn" aria-hidden="true" />
          <h1>Game Day</h1>
          <span className="icon-btn" aria-hidden="true" />
        </div>
      </header>
      <div className="wrap gd-empty">
        {eligible.length > 0 && g ? (
          <>
            <p className="eyebrow">Tonight</p>
            <h2 className="display">
              {TEAMS[g.homeId].short} vs {TEAMS[g.awayId].short}
            </h2>
            <p>
              {g.dateLabel} · {g.timeLabel}
              <br />
              {g.venue}
            </p>
            <p className="gd-empty-note">Game Day opens with your ticket. Your ticket window is open now.</p>
            <button className="btn block" onClick={() => navigate(`/ticket/${g.id}/print`)}>
              Get today’s ticket
            </button>
          </>
        ) : (
          <>
            <p className="eyebrow">No game right now</p>
            <h2 className="display">Game Day opens with your next ticket</h2>
            {g && (
              <p>
                Next: {TEAMS[g.homeId].short} vs {TEAMS[g.awayId].short}
                <br />
                {g.dateLabel} · {g.timeLabel}
              </p>
            )}
            <p className="gd-empty-note">Your ticket window opens 1 hour before first pitch. We’ll send one reminder.</p>
            <Link to="/passport" className="btn block ghost">
              Revisit your ticket book
            </Link>
          </>
        )}
      </div>
    </main>
  );
}
