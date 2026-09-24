import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import type { Badge } from '../../data/types';
import { TEAMS } from '../../data/teams';
import type { TicketView } from '../../state/selectors';
import { useBack } from '../../state/hooks';
import { Icon } from '../../components/Icon';
import { TicketArt } from '../../components/TicketArt';

export function PHeader({ title, back = '/passport', right }: { title: string; back?: string | false; right?: ReactNode }) {
  const goBack = useBack(back || '/passport');
  return (
    <div className="topbar p-bar">
      {back !== false ? (
        <button className="icon-btn" onClick={goBack} aria-label="Back">
          <Icon name="back" />
        </button>
      ) : (
        <span className="icon-btn" aria-hidden="true" />
      )}
      <h1>{title}</h1>
      {right ?? <span className="icon-btn" aria-hidden="true" />}
    </div>
  );
}

export function Stat({ value, label, accent }: { value: ReactNode; label: string; accent?: boolean }) {
  return (
    <div className={`p-stat ${accent ? 'accent' : ''}`}>
      <b>{value}</b>
      <span>{label}</span>
    </div>
  );
}

/** Compact ticket-book stub: game info + a window onto the frozen artwork. */
export function Stub({ t }: { t: TicketView }) {
  const opp = TEAMS[t.fanTeamId === t.homeId ? t.awayId : t.homeId];
  const home = t.fanTeamId === t.homeId;
  const fs = t.finalScore;
  const fanScore = fs ? (home ? fs.home : fs.away) : undefined;
  const oppScore = fs ? (home ? fs.away : fs.home) : undefined;
  return (
    <Link
      to={`/passport/ticket/${t.id}`}
      className="stub"
      aria-label={`${t.shortDate}, ${t.season}: ${home ? 'vs' : 'at'} ${opp.city}${fs ? `, ${t.result === 'W' ? 'win' : 'loss'} ${fanScore}–${oppScore}` : ''}${t.pins.length ? `, ${t.pins.length} ${t.pins.length === 1 ? 'pin' : 'pins'}` : ''}${t.memoryCount ? `, ${t.memoryCount} ${t.memoryCount === 1 ? 'memory' : 'memories'}` : ''}`}
    >
      <div className="stub-info">
        <b>{t.shortDate.toUpperCase()}</b>
        <span>
          {home ? 'vs' : '@'} {opp.abbr}
        </span>
        {fs ? (
          <span className={`stub-res ${t.result === 'W' ? 'w' : 'l'}`}>
            {t.result} {fanScore}–{oppScore}
          </span>
        ) : (
          <span className="stub-res live">{t.live ? 'LIVE' : 'TODAY'}</span>
        )}
        <small>{t.seat.kind === 'seat' ? `${t.seat.section}-${t.seat.row}-${t.seat.seat}` : 'SRO'}</small>
        {t.pins.length + t.memoryCount > 0 && (
          <small className="stub-keeps">
            {[t.pins.length && `${t.pins.length} ${t.pins.length === 1 ? 'pin' : 'pins'}`, t.memoryCount && `${t.memoryCount} ${t.memoryCount === 1 ? 'memory' : 'memories'}`]
              .filter(Boolean)
              .join(' · ')}
          </small>
        )}
      </div>
      <div className="stub-art">
        <TicketArt theme={t.art} image={t.artImage} date="" time="" lite />
        {t.marks.length + t.pins.length > 0 && (
          <span className="stub-mark" aria-hidden="true">
            <Icon name="star" size={11} stroke={2.4} />
          </span>
        )}
        {t.checkedIn && <span className="stub-stamp" aria-hidden="true" />}
      </div>
    </Link>
  );
}

export function BadgeMedal({ b, size = 64 }: { b: Badge; size?: number }) {
  const ring = b.earned ? '#e0a23a' : '#3a4256';
  const fill = b.earned ? (b.group === 'streak' ? '#3a1408' : '#1a1206') : '#141a28';
  const ink = b.earned ? '#f4d58a' : '#5b6478';
  return (
    <svg
      viewBox="0 0 64 64"
      width={size}
      height={size}
      role="img"
      aria-label={`${b.label}${b.earned ? ', earned' : ', not yet earned'}`}
      className={`medal ${b.earned ? 'earned' : 'locked'}`}
    >
      <circle cx="32" cy="32" r="30" fill={fill} stroke={ring} strokeWidth="3" />
      <circle cx="32" cy="32" r="24.5" fill="none" stroke={ring} strokeWidth="1" strokeDasharray="2 2.4" />
      {b.icon === 'number' && (
        <>
          <text x="32" y="37" textAnchor="middle" fontFamily="Bebas Neue, sans-serif" fontSize="24" fill={ink}>
            {b.value}
          </text>
          <text x="32" y="47" textAnchor="middle" fontFamily="Montserrat, sans-serif" fontSize="5.6" fontWeight="800" fill={ink} letterSpacing="0.8">
            GAMES
          </text>
        </>
      )}
      {b.icon === 'flame' && (
        <>
          <path
            d="M32 13 C38 21 44 25 42 35 C41 41 37 45 32 45 C26 45 22 41 22 35 C22 29 26 27 28 21 C30 25 32 26 33 27 C34 23 33 18 32 13 Z"
            fill={b.earned ? '#f26a1b' : '#3a4256'}
          />
          <path d="M32 31 C35 34 36 37 35 40 C34 42 33 43 32 43 C30 43 28 41 29 38 C29 36 31 34 32 31 Z" fill={b.earned ? '#ffd27a' : '#4b5468'} />
          <text x="32" y="54" textAnchor="middle" fontFamily="Montserrat, sans-serif" fontSize="5.4" fontWeight="800" fill={ink}>
            {b.value} GAME
          </text>
        </>
      )}
      {b.icon !== 'number' && b.icon !== 'flame' && (
        <g transform="translate(20 18)" fill="none" stroke={ink} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path
            d={
              {
                star: 'M12 1.5l3.3 6.7 7.4 1.1-5.4 5.2 1.3 7.3L12 18.4l-6.6 3.4 1.3-7.3L1.3 9.3l7.4-1.1Z',
                family: 'M7 9a3 3 0 1 0 0-6 3 3 0 0 0 0 6Zm10 0a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM1 21c0-4 2.7-7 6-7s6 3 6 7m-2 0c0-3 2.7-6 6-6s6 2.5 6 6',
                teams: 'M3 4h7v7H3Zm11 0h7v7h-7ZM3 15h7v7H3Zm11 0h7v7h-7Z',
                founding: 'M12 2l2.5 5 5.5.5-4 4 1 5.5L12 14.5 7 17l1-5.5-4-4 5.5-.5ZM6 22h12',
                shirt: 'M8 2 3 5l2 5 2-1v13h10V9l2 1 2-5-5-3c0 2-1.8 3.5-4 3.5S8 4 8 2Z',
                first: 'M5 22V3m0 1h13l-3 4.5L18 13H5',
                number: '',
                flame: '',
              }[b.icon]
            }
          />
        </g>
      )}
    </svg>
  );
}

/** `jid` makes the section a Passport jump-bar target (`#jump-<jid>`). */
export function SectionTitle({ title, to, link, jid }: { title: string; to?: string; link?: string; jid?: string }) {
  return (
    <div className="section-title" id={jid ? `jump-${jid}` : undefined}>
      <h2>{title}</h2>
      {to && <Link to={to}>{link ?? 'See all'}</Link>}
    </div>
  );
}
