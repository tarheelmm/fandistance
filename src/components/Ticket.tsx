import { useMemo, type CSSProperties } from 'react';
import type { MilestoneMark } from '../data/types';
import { TEAMS } from '../data/teams';
import type { TicketView } from '../state/selectors';
import { fmt } from '../state/selectors';
import { TicketArt } from './TicketArt';
import { FDMark } from './FDMark';
import { TeamMark } from './TeamMark';
import { PinBadge } from './PinBadge';
import { Icon } from './Icon';
import './ticket.css';

/**
 * blank    — Preparing: essentially blank white paper, faint FD watermark
 * printing — Light sweep travels top → bottom, artwork revealed behind it
 * printed  — Artwork complete, seat not yet assigned (dashes)
 * assigned — Section / Row / Seat pop forward above the barcode
 * static   — The collectible as it lives on (no entrance motion)
 */
export type TicketPhase = 'blank' | 'printing' | 'printed' | 'assigned' | 'static';

interface Props {
  view: TicketView;
  phase?: TicketPhase;
  /** ms for the printing sweep */
  printMs?: number;
  /** animate the checked-in stamp landing */
  stampIn?: boolean;
  /** animate the final score being added */
  scoreIn?: boolean;
  lite?: boolean;
  className?: string;
  style?: CSSProperties;
}

export function Ticket({ view, phase = 'static', printMs = 2800, stampIn, scoreIn, lite, className, style }: Props) {
  const home = TEAMS[view.homeId];
  const away = TEAMS[view.awayId];
  const [, mon, day, yr] = view.dateLabel.match(/^\w+, (\w+) (\d+), (\d+)$/) ?? [];
  const monthNum = String(['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'].indexOf(mon) + 1).padStart(2, '0');
  const artDate = `${monthNum}·${day}·${yr?.slice(2)}`;
  const seatShown = phase === 'assigned' || phase === 'static';
  const seat = view.seat;

  return (
    <div
      className={`ticket phase-${phase} ${lite ? 'is-lite' : ''} ${className ?? ''}`}
      style={{ ...style, ['--print-ms' as string]: `${printMs}ms` }}
      role="img"
      aria-label={ticketLabel(view, seatShown)}
    >
      <div className="ticket-paper">
        {/* Blank stock: what the fan sees before printing */}
        <div className="ticket-blank" aria-hidden="true">
          <div className="ticket-watermark">
            <FDMark tone="mono-white" />
            <span>FANDISTANCE</span>
          </div>
        </div>

        {/* Everything that prints onto the stock */}
        <div className="ticket-print">
          <div className="ticket-art">
            <TicketArt theme={view.art} image={view.artImage} date={artDate} time={view.timeLabel.replace(' ET', '')} lite={lite} />
            <div className="ticket-brand">
              <span className="ticket-brand-fd">FD</span>
              <span>
                <b>FANDISTANCE</b>
                <small>REPRESENTING FROM EVERYWHERE</small>
              </span>
            </div>
            {view.marks.length > 0 && <Marks marks={view.marks} />}
            {view.checkedIn && <Stamp view={view} animate={stampIn} />}
            {view.pins.length > 0 && (
              <div className={`ticket-pins ${scoreIn ? 'pin-in' : ''}`}>
                {view.pins.slice(0, 3).map((p) => (
                  <PinBadge key={p.kind} kind={p.kind} season={p.season} title={p.title} />
                ))}
                {view.pins.length > 3 && <span className="pin-more">+{view.pins.length - 3}</span>}
              </div>
            )}
            {view.memoryCount > 0 && (
              <span className="ticket-keeps">
                <Icon name="image" size={12} stroke={2.4} /> {view.memoryCount} {view.memoryCount === 1 ? 'MEMORY' : 'MEMORIES'}
              </span>
            )}
          </div>

          <div className="ticket-title">
            <div className="ticket-matchup">
              {away.short.toUpperCase()} @ {home.short.toUpperCase()}
            </div>
            <div className="ticket-when">
              {view.dateLabel} • {view.timeLabel}
            </div>
            <div className="ticket-venue">{view.venue.toUpperCase()}</div>
          </div>

          {view.finalScore && (
            <div className={`ticket-score ${scoreIn ? 'score-in' : ''}`}>
              <div className="ts-team">
                <TeamMark id={away.id} size="1.05em" />
                <span className="ts-name">{away.short.toUpperCase()}</span>
                <span className="ts-num">{view.finalScore.away}</span>
              </div>
              <span className="ts-final">FINAL</span>
              <div className="ts-team right">
                <span className="ts-num">{view.finalScore.home}</span>
                <span className="ts-name">{home.short.toUpperCase()}</span>
                <TeamMark id={home.id} size="1.05em" />
              </div>
            </div>
          )}

          <div className="ticket-perf" aria-hidden="true" />

          <div className="ticket-stub">
            {seat.kind === 'seat' ? (
              <div className="ticket-seat">
                {(
                  [
                    ['SECTION', seat.section],
                    ['ROW', seat.row],
                    ['SEAT', seat.seat],
                  ] as const
                ).map(([label, val], i) => (
                  <div key={label} className="seat-col">
                    <span className="seat-label">{label}</span>
                    <span className={`seat-val ${seatShown ? 'shown' : ''}`} style={{ animationDelay: `${i * 110}ms` }}>
                      {seatShown ? val : '—'}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="ticket-seat sro">
                <span className="seat-label">GENERAL ADMISSION</span>
                <span className={`seat-val ${seatShown ? 'shown' : ''}`}>{seatShown ? 'STANDING ROOM ONLY' : '—'}</span>
              </div>
            )}
            <Barcode seed={view.id} />
            <div className="ticket-foot">
              <span>FANDISTANCE</span>
              <span>{view.location === 'venue' ? 'AT THE VENUE' : `${fmt(view.distanceMiles)} MILES FROM THE ${home.sport === 'baseball' ? 'PARK' : 'VENUE'}`}</span>
            </div>
          </div>
        </div>
      </div>

      {/* The print head: bright light sweep, top → bottom (extends past the paper edges) */}
      <div className="ticket-sweep" aria-hidden="true" />
    </div>
  );
}

function ticketLabel(v: TicketView, seatShown: boolean) {
  const home = TEAMS[v.homeId];
  const away = TEAMS[v.awayId];
  const parts = [`${away.short} at ${home.short}`, v.dateLabel, v.timeLabel, v.venue];
  if (seatShown) parts.push(v.seat.kind === 'seat' ? `Section ${v.seat.section}, Row ${v.seat.row}, Seat ${v.seat.seat}` : 'Standing Room Only');
  if (v.checkedIn) parts.push('Checked in');
  if (v.finalScore) parts.push(`Final: ${away.short} ${v.finalScore.away}, ${home.short} ${v.finalScore.home}`);
  for (const m of v.marks) parts.push(m.detail);
  for (const p of v.pins) parts.push(`Pin: ${p.title}`);
  if (v.memoryCount) parts.push(`${v.memoryCount} ${v.memoryCount === 1 ? 'memory' : 'memories'} kept with this ticket`);
  return parts.join('. ');
}

function Stamp({ view, animate }: { view: TicketView; animate?: boolean }) {
  const [, mon, day, yr] = view.dateLabel.match(/^\w+, (\w+) (\d+), (\d+)$/) ?? [];
  const where = view.location === 'venue' ? 'AT THE VENUE' : 'BEYOND THE VENUE';
  return (
    <svg className={`ticket-stamp ${animate ? 'stamp-in' : ''}`} viewBox="0 0 100 100" aria-hidden="true">
      <defs>
        <path id={`arcT-${view.id}`} d="M16 50 A34 34 0 0 1 84 50" />
        <path id={`arcB-${view.id}`} d="M13 50 A37 37 0 0 0 87 50" />
      </defs>
      <circle cx="50" cy="50" r="46" fill="rgba(20,8,4,.62)" stroke="currentColor" strokeWidth="3" />
      <circle cx="50" cy="50" r="40" fill="none" stroke="currentColor" strokeWidth="1.2" />
      <circle cx="50" cy="50" r="24" fill="none" stroke="currentColor" strokeWidth="1.2" />
      <text fontSize="11" fontFamily="Bebas Neue, sans-serif" letterSpacing="1.5" fill="currentColor">
        <textPath href={`#arcT-${view.id}`} startOffset="50%" textAnchor="middle">
          CHECKED IN
        </textPath>
      </text>
      <text fontSize="7.4" fontFamily="Montserrat, sans-serif" fontWeight="700" letterSpacing="0.9" fill="currentColor">
        <textPath href={`#arcB-${view.id}`} startOffset="50%" textAnchor="middle">
          {where}
        </textPath>
      </text>
      <text x="50" y="49" textAnchor="middle" fontSize="15" fontFamily="Bebas Neue, sans-serif" fill="currentColor">
        {mon} {day}
      </text>
      <text x="50" y="62" textAnchor="middle" fontSize="11" fontFamily="Bebas Neue, sans-serif" fill="currentColor" letterSpacing="1">
        {yr}
      </text>
    </svg>
  );
}

function Marks({ marks }: { marks: MilestoneMark[] }) {
  return (
    <div className="ticket-marks">
      {marks.slice(0, 4).map((m) => (
        <MarkBadge key={m.label} mark={m} />
      ))}
    </div>
  );
}

export function MarkBadge({ mark }: { mark: MilestoneMark }) {
  return (
    <div className={`mark mark-${mark.kind}`} title={mark.detail}>
      <svg viewBox="0 0 60 60" aria-hidden="true">
        <circle cx="30" cy="30" r="27" fill="rgba(10,6,4,.78)" stroke="#e0a23a" strokeWidth="2.4" />
        <circle cx="30" cy="30" r="22" fill="none" stroke="#e0a23a" strokeWidth="0.8" strokeDasharray="1.5 2" />
        {mark.kind === 'games' && (
          <>
            <text x="30" y="35" textAnchor="middle" fontFamily="Bebas Neue, sans-serif" fontSize="22" fill="#f4d58a">
              {mark.value}
            </text>
            <text x="30" y="45" textAnchor="middle" fontFamily="Montserrat, sans-serif" fontWeight="800" fontSize="5.5" fill="#f4d58a" letterSpacing="0.6">
              GAMES
            </text>
          </>
        )}
        {mark.kind === 'streak' && (
          <>
            <path d="M30 12 C36 20 42 24 40 34 C39 40 35 44 30 44 C24 44 20 40 20 34 C20 28 24 26 26 20 C28 24 30 25 31 26 C32 22 31 17 30 12 Z" fill="#f26a1b" />
            <path d="M30 30 C33 33 34 36 33 39 C32 41 31 42 30 42 C28 42 26 40 27 37 C27 35 29 33 30 30 Z" fill="#ffd27a" />
            <text x="30" y="52" textAnchor="middle" fontFamily="Montserrat, sans-serif" fontWeight="800" fontSize="5.4" fill="#f4d58a" letterSpacing="0.4">
              {mark.value}-GAME
            </text>
          </>
        )}
        {mark.kind === 'giveaway' && (
          <>
            <path d="M18 34 C18 24 24 18 31 18 C38 18 43 24 42 33 Z" fill="#f26a1b" />
            <path d="M16 34 C26 31 38 31 48 36 C40 39 24 39 16 37 Z" fill="#111" stroke="#f4d58a" strokeWidth="0.6" />
            <text x="30" y="50" textAnchor="middle" fontFamily="Montserrat, sans-serif" fontWeight="800" fontSize="5.4" fill="#f4d58a" letterSpacing="0.4">
              GIVEAWAY
            </text>
          </>
        )}
        {mark.kind === 'historic' && (
          <>
            <path d="M22 16 h16 v8 c0 6 -4 10 -8 10 c-4 0 -8 -4 -8 -10 Z M26 34 h8 v4 h4 v4 h-16 v-4 h4 Z" fill="#e0a23a" />
            <text x="30" y="52" textAnchor="middle" fontFamily="Montserrat, sans-serif" fontWeight="800" fontSize="5" fill="#f4d58a" letterSpacing="0.3">
              HISTORIC
            </text>
          </>
        )}
        {mark.kind === 'special' && (
          <>
            <path d="M30 14 l4.7 9.6 10.5 1.5 -7.6 7.4 1.8 10.5 -9.4 -5 -9.4 5 1.8 -10.5 -7.6 -7.4 10.5 -1.5 z" fill="#e0a23a" />
            <text x="30" y="53" textAnchor="middle" fontFamily="Montserrat, sans-serif" fontWeight="800" fontSize="5" fill="#f4d58a" letterSpacing="0.3">
              {mark.value ?? 'SPECIAL'}
            </text>
          </>
        )}
      </svg>
    </div>
  );
}

function Barcode({ seed }: { seed: string }) {
  const bars = useMemo(() => {
    let h = 2166136261;
    for (const c of seed) h = Math.imul(h ^ c.charCodeAt(0), 16777619);
    const out: { x: number; w: number }[] = [];
    let x = 0;
    while (x < 196) {
      h = Math.imul(h ^ (h >>> 13), 1274126177);
      const w = 1 + ((h >>> 3) & 3) * 0.7;
      const gap = 1 + ((h >>> 7) & 1) * 1.2;
      out.push({ x, w });
      x += w + gap;
    }
    return out;
  }, [seed]);
  return (
    <svg className="ticket-barcode" viewBox="0 0 200 26" preserveAspectRatio="none" aria-hidden="true">
      {bars.map((b, i) => (
        <rect key={i} x={b.x + 2} y="0" width={b.w} height="26" fill="#161616" />
      ))}
    </svg>
  );
}
