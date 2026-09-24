import { useMemo, useState } from 'react';
import { Link, Navigate, useParams } from 'react-router-dom';
import { useStore } from '../../state/store';
import { fmt, gameById, minutesUntil, teamName } from '../../state/selectors';
import { useBack, useNow } from '../../state/hooks';
import { TEAMS } from '../../data/teams';
import type { Game } from '../../data/types';
import { Icon } from '../../components/Icon';
import { CrabMascot, Scene } from '../../components/Scene';
import { AREAS, statusLine } from './GameDayHub';
import './areas.css';

export function GameDayArea() {
  const { gameId = '', area = '' } = useParams();
  const { state } = useStore();
  const now = useNow();
  const back = useBack(`/gameday/${gameId}`);
  const game = gameById(state, gameId);
  const meta = AREAS.find((a) => a.id === area);
  if (!game || !meta || !state.data.tickets[gameId]) return <Navigate to="/gameday" replace />;
  const home = TEAMS[game.homeId];
  const away = TEAMS[game.awayId];

  return (
    <main className={`screen theme-dark area area-${area}`}>
      <div className="topbar area-bar">
        <button className="icon-btn" onClick={back} aria-label="Back to Game Day Hub">
          <Icon name="back" />
        </button>
        <h1>{meta.title}</h1>
        <span className="icon-btn" aria-hidden="true" />
      </div>
      <p className="area-context">
        {home.short} vs {away.short} · {statusLine(game, minutesUntil(state, game, now))}
      </p>
      <div className="wrap">
        {area === 'ballpark' && <Ballpark game={game} />}
        {area === 'play' && <Play game={game} />}
        {area === 'create' && <Create game={game} />}
        {area === 'bench' && <Bench game={game} />}
        {area === 'around' && <AroundYou game={game} />}
        {area === 'team' && <TeamOffers game={game} />}
      </div>
    </main>
  );
}

/* ---------------- FROM THE BALLPARK ---------------- */
function Ballpark({ game }: { game: Game }) {
  const { state, dispatch } = useStore();
  const saved = state.activity[game.id]?.photo;
  const live = game.status === 'live';
  const save = () => {
    dispatch({ type: 'activity', gameId: game.id, patch: { photo: true } });
    dispatch({
      type: 'addMemory',
      memory: { id: `mem-${Date.now()}`, kind: 'photo', title: 'From the Ballpark', date: game.shortDate + ', ' + game.season, gameId: game.id, art: 'ballpark' },
    });
  };
  return (
    <>
      <div className="bp-hero area-card">
        <Scene kind="ballpark" />
        {live && <span className="pill live bp-live">Live</span>}
        <div className="bp-hero-cap">
          <strong>{live ? 'Live from the ballpark' : game.status === 'final' ? 'Final from the ballpark' : 'Pregame at the ballpark'}</strong>
          <small>{game.venue}</small>
        </div>
      </div>
      <button className="btn block ghost bp-save" onClick={save} disabled={saved}>
        <Icon name={saved ? 'check' : 'passport'} size={18} /> {saved ? 'Saved to your Passport' : 'Save this view to your Passport'}
      </button>
      <div className="area-h">
        <h2>Top moments</h2>
      </div>
      <div className="bp-moments">
        {(['bp', 'crowd', 'fireworks', 'sunset'] as const).map((k, i) => (
          <div key={k} className="bp-moment">
            <Scene kind={k} />
            <span className="bp-play" aria-hidden="true">
              ▶
            </span>
            <small>{['Batting practice', 'Crowd on its feet', 'Postgame fireworks tonight', 'Harbor at first pitch'][i]}</small>
          </div>
        ))}
      </div>
      <div className="area-h">
        <h2>Updates</h2>
      </div>
      <ul className="area-card feed">
        {[
          ['news', 'Tonight’s lineup is posted', '6:05 PM'],
          ['sparkle', 'Orange Hat Night giveaway for fans at the park', '5:40 PM'],
          ['camera', 'Batting practice: three onto Eutaw Street', '5:15 PM'],
          ['around', 'Clear skies · 72° at first pitch', '4:30 PM'],
        ].map(([icon, text, time]) => (
          <li key={text} className="row-link">
            <Icon name={icon as 'news'} size={20} />
            <span className="grow">
              <strong>{text}</strong>
              <small>{time}</small>
            </span>
          </li>
        ))}
      </ul>
    </>
  );
}

/* ---------------- PLAY ---------------- */
const TRIVIA = {
  q: 'Oriole Park at Camden Yards opened in which year?',
  options: ['1989', '1992', '1995', '1998'],
  answer: '1992',
  split: [9, 62, 21, 8],
};
const POLL = { q: 'What’s your game-day snack tonight?', options: ['Crab fries', 'Pit beef', 'Crab cake', 'Peanuts'], split: [38, 24, 27, 11] };

function Play({ game }: { game: Game }) {
  const { state, dispatch } = useStore();
  const act = state.activity[game.id] ?? {};
  const [pick, setPick] = useState<string | undefined>(act.trivia);
  return (
    <>
      <section className="area-card play-card" aria-labelledby="trivia-h">
        <div className="play-tag">Tonight’s activity · Trivia</div>
        <h2 id="trivia-h" className="play-q">
          {TRIVIA.q}
        </h2>
        <div className="play-options" role="radiogroup" aria-labelledby="trivia-h">
          {TRIVIA.options.map((o, i) => {
            const answered = !!act.trivia;
            return (
              <button
                key={o}
                role="radio"
                aria-checked={pick === o}
                disabled={answered}
                className={`play-opt ${pick === o ? 'picked' : ''} ${answered && o === TRIVIA.answer ? 'answer' : ''}`}
                onClick={() => setPick(o)}
              >
                <span className="play-letter">{'ABCD'[i]}</span>
                <span className="grow">{o}</span>
                {answered && <span className="play-pct">{TRIVIA.split[i]}%</span>}
                {answered && <span className="play-bar" style={{ width: `${TRIVIA.split[i]}%` }} aria-hidden="true" />}
              </button>
            );
          })}
        </div>
        {!act.trivia ? (
          <button className="btn block" disabled={!pick} onClick={() => pick && dispatch({ type: 'activity', gameId: game.id, patch: { trivia: pick } })}>
            Submit answer
          </button>
        ) : (
          <p className="play-result">
            The answer is <b>{TRIVIA.answer}</b>. {fmt(1204)} fans played along tonight. Just for fun — it’s added to your game story.
          </p>
        )}
      </section>

      <section className="area-card play-card" aria-labelledby="poll-h">
        <div className="play-tag green">Fan poll</div>
        <h2 id="poll-h" className="play-q">
          {POLL.q}
        </h2>
        <div className="play-options">
          {POLL.options.map((o, i) => (
            <button
              key={o}
              className={`play-opt ${act.poll === o ? 'picked' : ''}`}
              disabled={!!act.poll}
              onClick={() => dispatch({ type: 'activity', gameId: game.id, patch: { poll: o } })}
            >
              <span className="grow">{o}</span>
              {act.poll && <span className="play-pct">{POLL.split[i]}%</span>}
              {act.poll && <span className="play-bar" style={{ width: `${POLL.split[i]}%` }} aria-hidden="true" />}
            </button>
          ))}
        </div>
      </section>
      <Link to={`/gameday/${game.id}/create`} className="more-link">
        More activities: today’s coloring page <Icon name="chevron" size={16} />
      </Link>
    </>
  );
}

/* ---------------- CREATE ---------------- */
const PALETTE = ['#f26a1b', '#111111', '#ffffff', '#d7262e', '#e0a23a', '#1d4d8f', '#3a9a52', '#8a5a2a'];

function Create({ game }: { game: Game }) {
  const { state, dispatch } = useStore();
  const [color, setColor] = useState(PALETTE[0]);
  const [fills, setFills] = useState<Record<string, string>>({});
  const saved = state.activity[game.id]?.coloring;
  const save = () => {
    dispatch({ type: 'activity', gameId: game.id, patch: { coloring: true } });
    dispatch({
      type: 'addMemory',
      memory: {
        id: `mem-${Date.now()}`,
        kind: 'creation',
        title: 'Today’s coloring page',
        date: `${game.shortDate}, ${game.season}`,
        gameId: game.id,
        art: 'coloring',
        colors: { bg: '#f5efe2', ...fills },
      },
    });
  };
  return (
    <>
      <section className="area-card create-card" aria-labelledby="color-h">
        <h2 id="color-h" className="play-q">
          Today’s coloring page
        </h2>
        <p className="create-hint">Pick a color, then tap the crab, cap, claws, bat or plate.</p>
        <svg viewBox="-80 -64 160 120" className="create-canvas" role="group" aria-label="Coloring page">
          <rect x="-80" y="-64" width="160" height="120" fill="#fff" />
          <CrabMascot colors={fills} interactive onFill={(r) => !saved && setFills((f) => ({ ...f, [r]: color }))} />
        </svg>
        <div className="create-palette" role="radiogroup" aria-label="Colors">
          {PALETTE.map((p) => (
            <button
              key={p}
              role="radio"
              aria-checked={color === p}
              aria-label={`Color ${p}`}
              className={`swatch ${color === p ? 'on' : ''}`}
              style={{ background: p }}
              onClick={() => setColor(p)}
            />
          ))}
        </div>
        <button className="btn block" onClick={save} disabled={saved || Object.keys(fills).length === 0}>
          {saved ? 'Saved to your Passport' : 'Save my art'}
        </button>
      </section>
      <p className="create-note">Your art is saved to Memories in your Passport. You choose if it’s shared.</p>
    </>
  );
}

/* ---------------- THE BENCH ---------------- */
function Bench({ game }: { game: Game }) {
  const { state, dispatch } = useStore();
  const [tab, setTab] = useState<'thread' | 'map' | 'photos'>('thread');
  const [sort, setSort] = useState<'top' | 'recent'>('top');
  const [draft, setDraft] = useState('');
  const home = TEAMS[game.homeId];
  const posts = useMemo(() => {
    const p = [...state.data.bench];
    return sort === 'top' ? p.sort((a, b) => Number(!!b.mine) - Number(!!a.mine) || b.likes - a.likes) : p.sort((a, b) => a.minsAgo - b.minsAgo);
  }, [state.data.bench, sort]);
  const count = 4328 + state.data.bench.filter((p) => p.mine).length;

  const send = () => {
    const text = draft.trim();
    if (!text) return;
    dispatch({ type: 'post', post: { id: `p-${Date.now()}`, author: state.data.fan.handle, city: state.data.fan.homeCity, text, minsAgo: 0, likes: 0, replies: 0, mine: true } });
    dispatch({ type: 'activity', gameId: game.id, patch: { posted: (state.activity[game.id]?.posted ?? 0) + 1 } });
    setDraft('');
    setSort('recent');
  };

  return (
    <>
      <div className="bench-hero">
        <p className="bench-tag display">
          Same game. Different place.
          <br />
          Still together.
        </p>
        <div>
          <strong>{teamName(home.id)} game thread</strong>
          <small>
            <Icon name="users" size={14} /> {fmt(count)} fans in the thread
          </small>
        </div>
      </div>
      <div className="seg" role="tablist" aria-label="The Bench">
        {(
          [
            ['thread', 'Thread'],
            ['map', 'Fan map'],
            ['photos', 'Photo wall'],
          ] as const
        ).map(([k, l]) => (
          <button key={k} role="tab" aria-selected={tab === k} className={tab === k ? 'on' : ''} onClick={() => setTab(k)}>
            {l}
          </button>
        ))}
      </div>

      {tab === 'thread' && (
        <>
          <div className="chip-row bench-sort">
            <button className="chip" aria-pressed={sort === 'top'} onClick={() => setSort('top')}>
              Top
            </button>
            <button className="chip" aria-pressed={sort === 'recent'} onClick={() => setSort('recent')}>
              Recent
            </button>
          </div>
          <ul className="bench-list area-card">
            {posts.map((p) => (
              <li key={p.id} className="bench-post">
                <span className="bench-av" style={{ background: avatarColor(p.author) }}>
                  {p.author[0]}
                </span>
                <div className="grow">
                  <div className="bench-meta">
                    <strong>{p.author}</strong>
                    <small>
                      {p.city} · {p.minsAgo ? `${p.minsAgo}m` : 'now'}
                    </small>
                  </div>
                  <p>{p.text}</p>
                  <div className="bench-actions">
                    <button className={p.liked ? 'on' : ''} onClick={() => dispatch({ type: 'like', id: p.id })} aria-pressed={!!p.liked} aria-label={`Like, ${p.likes} likes`}>
                      <Icon name="heart" size={16} /> {p.likes}
                    </button>
                    <span>
                      <Icon name="reply" size={16} /> {p.replies}
                    </span>
                  </div>
                </div>
              </li>
            ))}
          </ul>
          <p className="bench-guide">Be respectful. Support your team and fellow fans. Different locations, same passion.</p>
          <form
            className="bench-compose"
            onSubmit={(e) => {
              e.preventDefault();
              send();
            }}
          >
            <label className="sr-only" htmlFor="bench-input">
              Join the conversation
            </label>
            <input id="bench-input" value={draft} onChange={(e) => setDraft(e.target.value)} placeholder="Join the conversation…" maxLength={280} autoComplete="off" />
            <button type="submit" className="icon-btn" aria-label="Post to The Bench" disabled={!draft.trim()}>
              <Icon name="send" />
            </button>
          </form>
        </>
      )}

      {tab === 'map' && <FanMap />}

      {tab === 'photos' && (
        <div className="photo-wall">
          {(['bp', 'dog', 'sunset', 'fan', 'crab', 'fireworks'] as const).map((k, i) => (
            <figure key={k}>
              <Scene kind={k} />
              <figcaption>{['From Section 88', 'Game day buddy', 'Harbor view', 'Charlotte, NC', 'Crab night', 'Last homestand'][i]}</figcaption>
            </figure>
          ))}
        </div>
      )}
    </>
  );
}

const avatarColor = (name: string) => ['#f26a1b', '#5b46c9', '#1b8ea6', '#2f9e5b', '#d7262e', '#0d1b3d'][name.length % 6];

const MAP_DOTS = [
  { city: 'Baltimore, MD', n: 1024, x: 262, y: 92 },
  { city: 'Washington, DC', n: 642, x: 256, y: 100 },
  { city: 'Charlotte, NC', n: 392, x: 238, y: 128 },
  { city: 'Tampa, FL', n: 318, x: 232, y: 176 },
  { city: 'Atlanta, GA', n: 287, x: 214, y: 140 },
  { city: 'Chicago, IL', n: 164, x: 190, y: 84 },
  { city: 'Denver, CO', n: 88, x: 120, y: 96 },
  { city: 'Los Angeles, CA', n: 131, x: 36, y: 124 },
];

function FanMap() {
  const { state } = useStore();
  const total = MAP_DOTS.reduce((n, d) => n + d.n, 0) + 1;
  return (
    <>
      <div className="area-card fanmap">
        <svg viewBox="0 0 300 200" role="img" aria-label="Map of where fans are representing from">
          <path
            d="M20 70 C30 40 70 34 110 38 L170 40 C200 36 230 44 258 56 L280 64 C284 80 274 96 268 108 C262 124 250 132 246 150 C244 170 236 186 226 190 C222 172 214 160 196 158 C170 158 150 170 128 164 C104 158 86 150 64 150 C44 146 28 132 22 112 C18 98 16 84 20 70 Z"
            fill="#1c2d52"
            stroke="#2c3f69"
          />
          {MAP_DOTS.map((d) => (
            <g key={d.city}>
              <circle cx={d.x} cy={d.y} r={3 + Math.sqrt(d.n) / 5} fill="#f26a1b" opacity="0.28" />
              <circle cx={d.x} cy={d.y} r="3" fill="#f26a1b" />
            </g>
          ))}
          {state.prefs.showOnFanMap && (
            <g transform="translate(238 128)">
              <circle r="7" fill="none" stroke="#f6f1e7" strokeWidth="2" />
              <text x="10" y="-8" fontSize="9" fontWeight="700" fill="#f6f1e7">
                You’re here
              </text>
            </g>
          )}
        </svg>
      </div>
      <p className="fanmap-total">
        <b>{fmt(total)}</b> fans representing tonight
      </p>
      <ul className="area-card feed">
        {MAP_DOTS.slice(0, 5).map((d) => (
          <li key={d.city} className="row-link">
            <Icon name="around" size={18} />
            <span className="grow">
              <strong>{d.city}</strong>
            </span>
            <b>{fmt(d.n)}</b>
          </li>
        ))}
      </ul>
    </>
  );
}

/* ---------------- AROUND YOU ---------------- */
function AroundYou({ game }: { game: Game }) {
  const { state } = useStore();
  const home = TEAMS[game.homeId];
  const places = [
    ['Harborside Tap House', '18 fans representing', '4.2 mi'],
    ['Queen City Sports Grille', '11 fans representing', '7.8 mi'],
    ['The Crab Pot Kitchen', '7 fans representing', '9.1 mi'],
  ];
  return (
    <>
      <div className="area-card around-hero">
        <div>
          <span className="eyebrow">Fans around you</span>
          <strong className="display">143 {home.short} fans</strong>
          <small>within 25 miles of {state.data.fan.homeCity} tonight</small>
        </div>
        <svg viewBox="0 0 120 90" aria-hidden="true">
          <rect width="120" height="90" rx="10" fill="#152649" />
          <path d="M0 60 C30 50 60 70 120 40" stroke="#23385f" strokeWidth="6" fill="none" />
          <path d="M40 0 C45 30 30 60 50 90" stroke="#23385f" strokeWidth="4" fill="none" />
          {[
            [30, 30],
            [80, 24],
            [66, 58],
            [96, 66],
          ].map(([x, y], i) => (
            <circle key={i} cx={x} cy={y} r="5" fill="#1b8ea6" />
          ))}
          <circle cx="58" cy="44" r="7" fill="#f26a1b" stroke="#fff" strokeWidth="2" />
        </svg>
      </div>
      <div className="area-h">
        <h2>Popular watch locations</h2>
      </div>
      <ul className="area-card feed">
        {places.map(([name, sub, dist]) => (
          <li key={name} className="row-link">
            <Icon name="around" size={20} />
            <span className="grow">
              <strong>{name}</strong>
              <small>{sub}</small>
            </span>
            <b className="dist">{dist}</b>
          </li>
        ))}
      </ul>
      <button className="btn block around-more">See more locations</button>
      <p className="create-note">
        {state.prefs.showOnFanMap ? 'You’re visible to fans nearby as a city, never an exact spot.' : 'You’re hidden from fans nearby.'} Change this in Passport → Locker Room →
        Privacy.
      </p>
    </>
  );
}

/* ---------------- TEAM & OFFERS ---------------- */
function TeamOffers({ game }: { game: Game }) {
  const home = TEAMS[game.homeId];
  return (
    <>
      <div className="team-head area-card" style={{ ['--team' as string]: home.primary }}>
        <strong>{teamName(home.id)}</strong>
        <small>Official team updates</small>
      </div>
      <ul className="area-card feed offers">
        <li className="row-link">
          <Icon name="news" size={22} />
          <span className="grow">
            <strong>Latest news</strong>
            <small>Tonight’s lineup and game notes are posted.</small>
          </span>
          <Icon name="chevron" size={18} />
        </li>
        <li className="row-link">
          <Icon name="tag" size={22} />
          <span className="grow">
            <strong>Special offer</strong>
            <small>10% off at the Team Store this weekend.</small>
          </span>
          <Icon name="chevron" size={18} />
        </li>
        <li className="row-link">
          <Icon name="star" size={22} />
          <span className="grow">
            <strong>Partner spotlight</strong>
            <small>A local partner offer for FanDistance fans.</small>
          </span>
          <Icon name="chevron" size={18} />
        </li>
      </ul>
      <button className="btn block ghost around-more">View all offers</button>
    </>
  );
}
