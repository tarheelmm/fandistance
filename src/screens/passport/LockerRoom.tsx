import { Link } from 'react-router-dom';
import { useStore, type Prefs } from '../../state/store';
import { badges, teamName } from '../../state/selectors';
import { TEAMS } from '../../data/teams';
import { Icon, type IconName } from '../../components/Icon';
import { TeamMark } from '../../components/TeamMark';
import { Scene } from '../../components/Scene';
import { PHeader, SectionTitle } from './parts';

/** LOCKER ROOM = MY FANDOM. Lives inside Passport — never in global navigation. */
export function LockerRoom() {
  const { state } = useStore();
  const fan = state.data.fan;
  const creations = state.data.memories.filter((m) => m.kind !== 'activity');
  const mine = state.data.bench.filter((p) => p.mine);
  const earned = badges(state).filter((b) => b.earned).length;
  const rows: { to: string; icon: IconName; title: string; sub: string }[] = [
    { to: '/passport/teams', icon: 'users', title: 'My teams', sub: `${state.data.followed.length} teams · manage and add` },
    { to: '/passport/memories', icon: 'image', title: 'Posts, photos & creations', sub: `${creations.length} saved · ${mine.length} Bench post${mine.length === 1 ? '' : 's'}` },
    { to: '/passport/recognition', icon: 'trophy', title: 'Recognition', sub: `${earned} badges earned` },
    { to: '/passport/locker-room/settings', icon: 'bell', title: 'Notifications', sub: 'Game reminders & updates' },
    { to: '/passport/locker-room/settings', icon: 'lock', title: 'Privacy & sharing', sub: 'You control what you share' },
    { to: '/passport/locker-room/settings', icon: 'gear', title: 'Settings', sub: 'Profile and preferences' },
    { to: '/passport/locker-room/help', icon: 'help', title: 'Help & support', sub: 'We’re here for you' },
  ];
  return (
    <main className="screen theme-dark passport">
      <PHeader title="Locker Room" />
      <div className="wrap">
        <div className="lr-hero">
          <LockerArt teams={state.data.followed.slice(0, 3)} />
          <div className="lr-hero-text display">
            Your teams.
            <br />
            Your space.
          </div>
        </div>

        <div className="lr-id card">
          <span className="p-avatar">{fan.name[0]}</span>
          <div className="grow">
            <strong>{fan.handle}</strong>
            <small>Representing from {fan.homeCity}</small>
          </div>
          <div className="lr-teams">
            {state.data.followed.slice(0, 3).map((id) => (
              <TeamMark key={id} id={id} size={26} />
            ))}
          </div>
        </div>

        <div className="card p-list lr-rows">
          {rows.map((r) => (
            <Link key={r.title} to={r.to} className="row-link">
              <span className="lr-ic">
                <Icon name={r.icon} size={20} />
              </span>
              <span className="grow">
                <strong>{r.title}</strong>
                <small>{r.sub}</small>
              </span>
              <Icon name="chevron" size={18} />
            </Link>
          ))}
        </div>

        <SectionTitle title="Fan connections" />
        <div className="card p-list">
          {[
            ['Jordan M.', 'Family · Baltimore, MD'],
            ['Sam R.', 'Friend · Charlotte, NC'],
          ].map(([n, s]) => (
            <div key={n} className="row-link">
              <span className="lr-ic">{n[0]}</span>
              <span className="grow">
                <strong>{n}</strong>
                <small>{s}</small>
              </span>
            </div>
          ))}
        </div>

        {creations.length > 0 && (
          <>
            <SectionTitle title="Recent creations" to="/passport/memories" />
            <div className="p-mem-grid">
              {creations.slice(0, 3).map((m) => (
                <div key={m.id} className="p-mem">
                  <Scene kind={m.art} colors={m.colors} />
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </main>
  );
}

function LockerArt({ teams }: { teams: string[] }) {
  return (
    <svg viewBox="0 0 320 170" className="lr-art" aria-hidden="true">
      <defs>
        <linearGradient id="lr-w" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#2a211a" />
          <stop offset="1" stopColor="#120d09" />
        </linearGradient>
        <radialGradient id="lr-l" cx="0.5" cy="0" r="0.8">
          <stop offset="0" stopColor="#ffd9a0" stopOpacity="0.35" />
          <stop offset="1" stopColor="#ffd9a0" stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect width="320" height="170" fill="url(#lr-w)" />
      {[0, 1, 2, 3, 4].map((i) => (
        <g key={i} transform={`translate(${12 + i * 62} 10)`}>
          <rect width="56" height="150" rx="3" fill="#3a2e24" stroke="#1a130d" strokeWidth="2" />
          <rect x="4" y="4" width="48" height="10" fill="#2a2119" />
          {[0, 1, 2].map((k) => (
            <rect key={k} x={14 + k * 10} y="6" width="6" height="2" fill="#15100b" />
          ))}
        </g>
      ))}
      {teams.map((id, i) => {
        const t = TEAMS[id];
        return (
          <g key={id} transform={`translate(${74 + i * 62} 40)`}>
            <path d="M6 0 L20 -4 C22 4 34 4 36 -4 L50 0 L56 20 L46 24 L46 70 L10 70 L10 24 L0 20 Z" fill={t.primary} stroke="#0008" strokeWidth="1" />
            <text x="28" y="46" textAnchor="middle" fontFamily="Bebas Neue" fontSize="22" fill="#fff">
              {i === 0 ? '14' : i === 1 ? '9' : '330'}
            </text>
            <text x="28" y="24" textAnchor="middle" fontFamily="Bebas Neue" fontSize="9" fill="#fff" opacity="0.9">
              {t.abbr}
            </text>
          </g>
        );
      })}
      <rect width="320" height="170" fill="url(#lr-l)" />
      <rect y="150" width="320" height="20" fill="#5a4330" />
    </svg>
  );
}

const PREF_GROUPS: { title: string; items: { key: keyof Prefs; label: string; sub: string }[] }[] = [
  {
    title: 'Notifications',
    items: [
      { key: 'gameReminders', label: 'Game-time reminders', sub: 'One consolidated push when your ticket window opens, one reminder at game time if a ticket is unclaimed.' },
      { key: 'teamNews', label: 'Team announcements', sub: 'News and updates from teams you follow.' },
      { key: 'benchReplies', label: 'Bench replies', sub: 'When fans reply to you during a game.' },
    ],
  },
  {
    title: 'Privacy',
    items: [
      { key: 'showOnFanMap', label: 'Show me on the Fan Map', sub: 'Shown by city only, never an exact location.' },
      { key: 'publicPassport', label: 'Public Passport', sub: 'Let other fans view your Passport.' },
    ],
  },
  {
    title: 'Sharing',
    items: [{ key: 'shareTickets', label: 'Allow ticket sharing', sub: 'Share a ticket from your Ticket Book.' }],
  },
];

export function LockerSettings() {
  const { state, dispatch } = useStore();
  const fan = state.data.fan;
  return (
    <main className="screen theme-dark passport">
      <PHeader title="Settings & prefs" back="/passport/locker-room" />
      <div className="wrap">
        <div className="lr-profile">
          <span className="p-avatar lg">{fan.name[0]}</span>
          <strong>{fan.handle}</strong>
          <small>Representing from {fan.homeCity}</small>
          <small>
            Following{' '}
            {state.data.followed
              .map((id) => teamName(id))
              .slice(0, 2)
              .join(', ')}
            …
          </small>
        </div>
        {PREF_GROUPS.map((g) => (
          <section key={g.title}>
            <SectionTitle title={g.title} />
            <div className="card p-list">
              {g.items.map((it) => (
                <label key={it.key} className="row-link toggle-row">
                  <span className="grow">
                    <strong>{it.label}</strong>
                    <small>{it.sub}</small>
                  </span>
                  <input type="checkbox" role="switch" checked={state.prefs[it.key]} onChange={(e) => dispatch({ type: 'setPref', key: it.key, value: e.target.checked })} />
                </label>
              ))}
            </div>
          </section>
        ))}
        <p className="p-principle">Inside the app, you’ll see in-app reminders instead of duplicate push notifications.</p>
      </div>
    </main>
  );
}

export function LockerHelp() {
  const items: [IconName, string, string][] = [
    ['sparkle', 'Getting started', 'A quick guide to FanDistance'],
    ['ticket', 'Tickets & seats', 'One game, one ticket — how it works'],
    ['passport', 'Your Passport', 'Games, miles, seasons and recognition'],
    ['bench', 'The Bench', 'Community guidelines for game-day conversation'],
    ['lock', 'Privacy & data', 'What we store and what you control'],
    ['help', 'Contact us', 'We’re here to help'],
  ];
  return (
    <main className="screen theme-dark passport">
      <PHeader title="Help & support" back="/passport/locker-room" />
      <div className="wrap">
        <div className="card p-list">
          {items.map(([icon, t, s]) => (
            <div key={t} className="row-link">
              <span className="lr-ic">
                <Icon name={icon} size={20} />
              </span>
              <span className="grow">
                <strong>{t}</strong>
                <small>{s}</small>
              </span>
              <Icon name="chevron" size={18} />
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
