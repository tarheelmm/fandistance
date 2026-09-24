import { useId } from 'react';
import './brand.css';

interface Props {
  /** 'navy' letters on light backgrounds, 'outlined' navy with light edge for dark backgrounds, 'mono' single color */
  tone?: 'light-bg' | 'dark-bg' | 'mono-white';
  /** Run the launch sequence: route draws Point A → stadium, then stadium pulses. */
  animate?: boolean;
  className?: string;
  title?: string;
}

/**
 * The FD mark. The pin (you, wherever you are) is joined by a dotted route
 * (the distance we travel to support) that terminates at the stadium in the D
 * (the team, the game, the connection).
 */
export function FDMark({ tone = 'light-bg', animate = false, className, title = 'FanDistance' }: Props) {
  const uid = useId().replace(/:/g, '');
  const navy = tone === 'mono-white' ? '#fff' : '#0d1b3d';
  const red = tone === 'mono-white' ? '#fff' : '#d7262e';
  const gap = tone === 'light-bg' ? '#ffffff' : tone === 'dark-bg' ? '#0a1224' : 'transparent';
  const edge = tone === 'dark-bg' ? 'rgba(255,255,255,.85)' : 'none';
  const route = 'M52 44 C 66 78, 104 98, 150 112 S 176 122, 182 124';

  return (
    <svg viewBox="0 0 270 200" className={`fd-mark ${animate ? 'is-animating' : ''} ${className ?? ''}`} role="img" aria-label={title}>
      <defs>
        <radialGradient id={`glow-${uid}`}>
          <stop offset="0" stopColor="#fff6d8" stopOpacity="0.95" />
          <stop offset="0.45" stopColor="#ffb25a" stopOpacity="0.55" />
          <stop offset="1" stopColor="#ff7a1a" stopOpacity="0" />
        </radialGradient>
        <mask id={`route-${uid}`} maskUnits="userSpaceOnUse">
          <path className="fd-route-reveal" d={route} pathLength={1} fill="none" stroke="#fff" strokeWidth="16" strokeLinecap="round" />
        </mask>
      </defs>

      <g transform="translate(42 0) skewX(-14)">
        {/* D */}
        <path d="M118 62 H192 C224 62 242 86 242 116 C242 148 222 170 190 170 H118 Z" fill={red} />
        {/* F — stroked in the background colour so it sits cleanly over the D */}
        <path
          d="M30 30 H176 L168 68 H78 V92 H146 L139 126 H78 V170 H30 Z"
          fill={navy}
          stroke={tone === 'dark-bg' ? edge : gap}
          strokeWidth={tone === 'dark-bg' ? 2 : 6}
          paintOrder="stroke"
          strokeLinejoin="round"
        />
      </g>

      {/* Stadium destination, centred in the D */}
      <g className="fd-stadium" transform="translate(206 124)">
        <circle className="fd-stadium-glow" r="46" fill={`url(#glow-${uid})`} />
        <Stadium navy={tone === 'mono-white' ? '#0d1b3d' : navy} />
      </g>

      {/* Dotted route: halo + dots, revealed by the mask when animating */}
      <g mask={animate ? `url(#route-${uid})` : undefined}>
        <path d={route} fill="none" stroke={navy} strokeWidth="8" strokeLinecap="round" strokeDasharray="0.1 11" opacity={tone === 'mono-white' ? 0 : 0.9} />
        <path d={route} fill="none" stroke="#fff" strokeWidth="5" strokeLinecap="round" strokeDasharray="0.1 11" />
      </g>

      {/* Point A — the fan */}
      <g className="fd-pin" transform="translate(52 20)">
        <path d="M0 26 C-9 15 -15 9 -15 0 A15 15 0 1 1 15 0 C15 9 9 15 0 26 Z" fill={navy} stroke={tone === 'dark-bg' ? edge : 'none'} strokeWidth="1.5" />
        <circle r="7.5" fill="#fff" />
        <circle r="4.5" fill={red === '#fff' ? '#0d1b3d' : red} />
      </g>
    </svg>
  );
}

export function Stadium({ navy = '#0d1b3d', scale = 1 }: { navy?: string; scale?: number }) {
  const arches = [-24, -16, -8, 0, 8, 16, 24];
  return (
    <g transform={`scale(${scale})`}>
      {[-20, 0, 20].map((x, i) => (
        <g key={x}>
          <line x1={x} y1={-14} x2={x} y2={i === 1 ? -36 : -31} stroke={navy} strokeWidth="2.2" />
          <path d={`M${x} ${i === 1 ? -36 : -31} l11 3.5 l-11 3.5 z`} fill={navy} />
        </g>
      ))}
      <path d="M-33 -10 V12 Q0 26 33 12 V-10 Q0 4 -33 -10 Z" fill={navy} />
      <ellipse cx="0" cy="-10" rx="33" ry="9.5" fill={navy} />
      <ellipse cx="0" cy="-10" rx="27" ry="6.2" fill="#fff" />
      <ellipse cx="0" cy="-9.4" rx="21" ry="4" fill="#d7262e" />
      <path d="M-33 -1 Q0 12 33 -1" stroke="#fff" strokeWidth="1.6" fill="none" />
      {arches.map((x) => {
        const y = 4 + (1 - (x / 30) ** 2) * 4.5;
        return x === 0 ? (
          <path key={x} d={`M-4.5 ${y + 8} V${y + 1} A4.5 4.5 0 0 1 4.5 ${y + 1} V${y + 8} Z`} fill="#fff" />
        ) : (
          <rect key={x} x={x - 2.4} y={y} width="4.8" height="6.5" rx="2.4" fill="#fff" />
        );
      })}
    </g>
  );
}

export function Wordmark({ tone = 'light-bg', tagline = true, size = 'lg' }: { tone?: 'light-bg' | 'dark-bg'; tagline?: boolean; size?: 'sm' | 'md' | 'lg' }) {
  return (
    <div className={`fd-wordmark ${tone} ${size}`}>
      <div className="fd-wordmark-name">
        <span className="fan">FAN</span> <span className="dist">DISTANCE</span>
      </div>
      {tagline && (
        <div className="fd-tagline">
          <i aria-hidden="true" />
          <span>Representing from everywhere</span>
          <i aria-hidden="true" />
        </div>
      )}
    </div>
  );
}

/** Compact lockup used in app headers: FD icon + FAN DISTANCE. */
export function Lockup({ tone = 'dark-bg' }: { tone?: 'light-bg' | 'dark-bg' }) {
  return (
    <span className={`fd-lockup ${tone}`}>
      <FDMark tone={tone} className="fd-lockup-mark" />
      <span className="fd-lockup-name">
        <span className="fan">FAN</span> <span className="dist">DISTANCE</span>
      </span>
    </span>
  );
}
