import { useId } from 'react';
import type { PinKind } from '../data/pins';
import './pins.css';

/**
 * Enamel collector pin. Gold die-struck edge, colored enamel fill, glossy highlight.
 * `ghost` draws the empty debossed slot shown on the Pin Board before a pin is earned.
 */
export function PinBadge({ kind, season, size = 56, ghost, title }: { kind: PinKind; season?: string; size?: number | string; ghost?: boolean; title?: string }) {
  const uid = useId().replace(/:/g, '');
  const gold = `url(#g-${uid})`;
  const yr = season ? `’${season.slice(2)}` : '';
  const edge = ghost ? { fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeDasharray: '3 3' } : { stroke: gold, strokeWidth: 3.2 };
  const enamel = (c: string) => (ghost ? 'none' : c);
  const ink = ghost ? 'currentColor' : '#fff';

  let body;
  switch (kind) {
    case 'opener':
      // pennant
      body = (
        <>
          <path d="M8 12 L56 30 L8 48 Z" fill={enamel('#e8601c')} strokeLinejoin="round" {...edge} />
          <rect x="4" y="8" width="5" height="46" rx="2" fill={ghost ? 'none' : gold} stroke={ghost ? 'currentColor' : 'none'} />
          {!ghost && <path d="M12 18 L40 29" stroke="#fff" strokeOpacity="0.35" strokeWidth="2" strokeLinecap="round" />}
          <text x="25" y="33" textAnchor="middle" fontFamily="Bebas Neue, sans-serif" fontSize="12" fill={ink}>
            1ST
          </text>
          <text x="25" y="42" textAnchor="middle" fontFamily="Bebas Neue, sans-serif" fontSize="7.5" fill={ink} opacity="0.9">
            GAME {yr}
          </text>
        </>
      );
      break;
    case 'games-10':
    case 'games-25':
    case 'games-50':
      // home plate
      body = (
        <>
          <path d="M10 10 H50 V34 L30 54 L10 34 Z" fill={enamel(kind === 'games-10' ? '#1d3a7a' : kind === 'games-25' ? '#6b2a86' : '#8e2a22')} strokeLinejoin="round" {...edge} />
          {!ghost && <path d="M15 15 H45" stroke="#fff" strokeOpacity="0.3" strokeWidth="2.4" strokeLinecap="round" />}
          <text x="30" y="36" textAnchor="middle" fontFamily="Bebas Neue, sans-serif" fontSize="21" fill={ghost ? 'currentColor' : '#ffd27a'}>
            {kind.split('-')[1]}
          </text>
          <text x="30" y="45" textAnchor="middle" fontFamily="Bebas Neue, sans-serif" fontSize="6.5" fill={ink}>
            GAME {yr}
          </text>
        </>
      );
      break;
    case 'fan-of-game':
      // shield with star and ribbon
      body = (
        <>
          <path d="M30 5 L52 13 V30 C52 44 42 52 30 57 C18 52 8 44 8 30 V13 Z" fill={enamel('#f0a52a')} strokeLinejoin="round" {...edge} />
          <path
            d="M30 14 l4.2 8.6 9.4 1.4 -6.8 6.6 1.6 9.4 -8.4 -4.4 -8.4 4.4 1.6 -9.4 -6.8 -6.6 9.4 -1.4 z"
            fill={ghost ? 'none' : '#fff7de'}
            stroke={ghost ? 'currentColor' : '#b36b12'}
            strokeWidth="1"
          />
          <path d="M4 40 H56 L52 46 L56 52 H4 L8 46 Z" fill={enamel('#0d1b3d')} {...(ghost ? edge : { stroke: gold, strokeWidth: 1.6 })} />
          <text x="30" y="49" textAnchor="middle" fontFamily="Bebas Neue, sans-serif" fontSize="6.4" letterSpacing="0.3" fill={ink}>
            FAN OF THE GAME
          </text>
        </>
      );
      break;
    case 'rivalry':
      body = (
        <>
          <circle cx="30" cy="30" r="24" fill={enamel('#141414')} {...edge} />
          <g stroke={ghost ? 'currentColor' : '#d9a066'} strokeWidth="4.2" strokeLinecap="round">
            <line x1="17" y1="41" x2="41" y2="15" />
            <line x1="43" y1="41" x2="19" y2="15" />
          </g>
          <circle cx="30" cy="34" r="6" fill={ghost ? 'none' : '#f6f1e4'} stroke={ghost ? 'currentColor' : '#c8202a'} strokeWidth="1.2" />
          <text x="30" y="52" textAnchor="middle" fontFamily="Bebas Neue, sans-serif" fontSize="7" fill={ghost ? 'currentColor' : '#ff7b3a'}>
            RIVALRY {yr}
          </text>
        </>
      );
      break;
    case 'july-4th':
      body = (
        <>
          <path d="M30 4 L35 20 L52 14 L42 28 L56 38 L39 39 L38 56 L30 42 L22 56 L21 39 L4 38 L18 28 L8 14 L25 20 Z" fill={enamel('#1f3b8f')} strokeLinejoin="round" {...edge} />
          <circle cx="30" cy="31" r="9" fill={ghost ? 'none' : '#c8102e'} stroke={ghost ? 'currentColor' : '#fff'} strokeWidth="1.4" />
          <text x="30" y="35" textAnchor="middle" fontFamily="Bebas Neue, sans-serif" fontSize="10" fill={ink}>
            4TH
          </text>
        </>
      );
      break;
    case 'road-trip':
      body = (
        <>
          <rect x="7" y="12" width="46" height="34" rx="7" fill={enamel('#1d6b43')} {...edge} />
          <path d="M18 30 H36 M31 24 L37 30 L31 36" stroke={ink} strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round" />
          <text x="30" y="21" textAnchor="middle" fontFamily="Bebas Neue, sans-serif" fontSize="7" fill={ink}>
            ROAD GAME
          </text>
          <text x="30" y="43" textAnchor="middle" fontFamily="Bebas Neue, sans-serif" fontSize="7" fill={ink}>
            {season ?? ''}
          </text>
        </>
      );
      break;
  }

  return (
    <svg
      viewBox="0 0 60 60"
      width={size}
      height={size}
      className={`pin ${ghost ? 'ghost' : ''}`}
      role={title ? 'img' : undefined}
      aria-label={title}
      aria-hidden={title ? undefined : true}
    >
      <defs>
        <linearGradient id={`g-${uid}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#fff1b8" />
          <stop offset="0.35" stopColor="#e7b54a" />
          <stop offset="0.7" stopColor="#a8741a" />
          <stop offset="1" stopColor="#f3d27a" />
        </linearGradient>
      </defs>
      {body}
    </svg>
  );
}
