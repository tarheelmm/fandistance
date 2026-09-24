import { useId, type ReactNode } from 'react';
import type { ArtThemeId } from '../data/types';

interface Props {
  theme: ArtThemeId;
  /** e.g. ['05', '24', '27'] — date identity painted into the artwork */
  date: string;
  time: string;
  /** Skip expensive filters for small thumbnails */
  lite?: boolean;
}

/**
 * Collectible poster artwork. Generated once per game and frozen on the ticket:
 * team identity, city/local culture, venue elements, game specifics and date/time.
 */
export function TicketArt({ theme, date, time, lite }: Props) {
  const uid = useId().replace(/:/g, '');
  switch (theme) {
    case 'baltimore-harbor':
      return <BaltimoreHarbor uid={uid} date={date} time={time} lite={lite} />;
    case 'raleigh-ice':
      return (
        <Poster
          uid={uid}
          date={date}
          time={time}
          lite={lite}
          sky={['#120508', '#5b0f18', '#c81d2c', '#f0a07a']}
          accent="#ce1126"
          ink="#0d0d0f"
          skyline="raleigh"
          emblem="hockey"
          motif="oaks"
        />
      );
    case 'baltimore-gridiron':
      return (
        <Poster
          uid={uid}
          date={date}
          time={time}
          lite={lite}
          sky={['#0b0620', '#241773', '#6a3fb8', '#e0b24a']}
          accent="#9e7c0c"
          ink="#09061a"
          skyline="baltimore"
          emblem="football"
          motif="flag"
        />
      );
    case 'charlotte-pitch':
      return (
        <Poster
          uid={uid}
          date={date}
          time={time}
          lite={lite}
          sky={['#02121f', '#0b3a5c', '#1a85c8', '#9fd6f5']}
          accent="#1a85c8"
          ink="#02070c"
          skyline="charlotte"
          emblem="soccer"
          motif="crown"
        />
      );
    case 'dc-court':
      return (
        <Poster
          uid={uid}
          date={date}
          time={time}
          lite={lite}
          sky={['#07122a', '#002b5c', '#c8102e', '#f6b3c0']}
          accent="#c8102e"
          ink="#050b19"
          skyline="dc"
          emblem="basketball"
          motif="blossom"
        />
      );
  }
}

/* ------------------------------------------------------------------ */
/* Baltimore harbor — primary storyboard artwork                       */
/* ------------------------------------------------------------------ */

function BaltimoreHarbor({ uid, date, time, lite }: { uid: string; date: string; time: string; lite?: boolean }) {
  const id = (s: string) => `${s}-${uid}`;
  return (
    <svg viewBox="0 0 300 360" preserveAspectRatio="xMidYMid slice" className="ticket-art-svg" aria-hidden="true">
      <defs>
        <linearGradient id={id('sky')} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#140d0a" />
          <stop offset="0.28" stopColor="#4a1d0e" />
          <stop offset="0.52" stopColor="#b3471a" />
          <stop offset="0.66" stopColor="#f08a2e" />
          <stop offset="0.72" stopColor="#ffc56a" />
        </linearGradient>
        <radialGradient id={id('sun')} cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor="#fff4c8" />
          <stop offset="0.35" stopColor="#ffd27a" stopOpacity="0.9" />
          <stop offset="1" stopColor="#ff8a2a" stopOpacity="0" />
        </radialGradient>
        <linearGradient id={id('water')} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#8a3a17" />
          <stop offset="0.4" stopColor="#3b1a10" />
          <stop offset="1" stopColor="#120a08" />
        </linearGradient>
        <linearGradient id={id('wood')} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#6b4a2e" />
          <stop offset="1" stopColor="#2c1c10" />
        </linearGradient>
        <linearGradient id={id('folds')} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#000" stopOpacity="0.28" />
          <stop offset="0.14" stopColor="#fff" stopOpacity="0.12" />
          <stop offset="0.3" stopColor="#000" stopOpacity="0.3" />
          <stop offset="0.47" stopColor="#fff" stopOpacity="0.16" />
          <stop offset="0.63" stopColor="#000" stopOpacity="0.26" />
          <stop offset="0.8" stopColor="#fff" stopOpacity="0.1" />
          <stop offset="1" stopColor="#000" stopOpacity="0.35" />
        </linearGradient>
        <radialGradient id={id('vignette')} cx="0.5" cy="0.45" r="0.75">
          <stop offset="0.6" stopColor="#000" stopOpacity="0" />
          <stop offset="1" stopColor="#000" stopOpacity="0.55" />
        </radialGradient>
        <radialGradient id={id('crab')} cx="0.45" cy="0.35" r="0.7">
          <stop offset="0" stopColor="#ff8a4a" />
          <stop offset="0.55" stopColor="#d9481f" />
          <stop offset="1" stopColor="#8a2410" />
        </radialGradient>
        {!lite && (
          <filter id={id('wave')} x="-5%" y="-10%" width="110%" height="120%">
            <feTurbulence type="fractalNoise" baseFrequency="0.009 0.028" numOctaves="2" seed="4" />
            <feDisplacementMap in="SourceGraphic" scale="12" xChannelSelector="R" yChannelSelector="G" />
          </filter>
        )}
        {!lite && (
          <filter id={id('grain')}>
            <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" stitchTiles="stitch" />
            <feColorMatrix values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 0.16 0" />
            <feComposite in2="SourceGraphic" operator="in" />
          </filter>
        )}
        <clipPath id={id('flagClip')}>
          <path d="M0 6 C40 -4 80 14 120 4 C140 -1 155 2 165 6 L165 112 C150 106 132 104 118 110 C80 124 40 104 0 114 Z" />
        </clipPath>
      </defs>

      {/* Sky + sun */}
      <rect width="300" height="360" fill={`url(#${id('sky')})`} />
      <circle cx="176" cy="238" r="70" fill={`url(#${id('sun')})`} />
      <circle cx="176" cy="238" r="18" fill="#fff1c2" opacity="0.95" />

      {/* Stadium light towers — venue */}
      <LightTower x={22} y={150} />
      <LightTower x={282} y={132} />

      {/* Distant skyline */}
      <g fill="#2a130c">
        <path d="M0 236 V214 h10 v-8 h8 v12 h10 v-26 h12 v26 h8 v-40 h6 l3 -8 l3 8 h6 v40 h10 v-18 h14 v18 h8 V196 h16 v40 Z" />
        {/* clock tower (a Baltimore landmark silhouette) */}
        <path d="M112 236 V168 h14 v68 Z M110 168 h18 l-9 -26 Z" />
        <rect x="114" y="174" width="10" height="10" rx="5" fill="#ffcf7a" opacity="0.85" />
        <path d="M200 236 V186 h18 v-14 h14 v14 h10 v50 Z M246 236 V200 h22 v-22 h10 v58 Z M280 236 v-30 h20 v30 Z" />
      </g>
      <g fill="#ffcf7a" opacity="0.7">
        {Array.from({ length: 26 }, (_, i) => (
          <rect key={i} x={6 + ((i * 37) % 290)} y={200 + ((i * 13) % 30)} width="2" height="2" />
        ))}
      </g>

      {/* B&O-style brick warehouse — venue element */}
      <g>
        <path d="M-2 250 V214 L60 205 L150 214 V250 Z" fill="#5c2616" />
        <path d="M-2 214 L60 205 L150 214" stroke="#2a0f08" strokeWidth="2" fill="none" />
        {Array.from({ length: 13 }, (_, i) => (
          <g key={i}>
            <rect x={4 + i * 11} y={219} width="5" height="7" rx="2.5" fill={i % 3 === 0 ? '#ffc56a' : '#2b0e07'} />
            <rect x={4 + i * 11} y={232} width="5" height="7" rx="2.5" fill={i % 4 === 1 ? '#ffc56a' : '#2b0e07'} />
          </g>
        ))}
      </g>

      {/* Harbor water */}
      <rect y="248" width="300" height="70" fill={`url(#${id('water')})`} />
      <g stroke="#ffb45a" strokeLinecap="round" opacity="0.75">
        {[
          [150, 256, 60],
          [140, 264, 80],
          [160, 272, 50],
          [130, 281, 96],
          [175, 290, 40],
          [110, 298, 70],
        ].map(([x, y, w], i) => (
          <line key={i} x1={x} y1={y} x2={x + w} y2={y} strokeWidth={i < 2 ? 2 : 1.4} />
        ))}
      </g>

      {/* Tall ship at the Inner Harbor */}
      <g fill="#1a0c07" stroke="#1a0c07">
        <path d="M34 272 L118 272 L108 286 L44 286 Z" stroke="none" />
        <line x1="54" y1="272" x2="54" y2="186" strokeWidth="2" />
        <line x1="78" y1="272" x2="78" y2="176" strokeWidth="2.2" />
        <line x1="100" y1="272" x2="100" y2="194" strokeWidth="2" />
        <g strokeWidth="1.3">
          <line x1="44" y1="200" x2="64" y2="200" />
          <line x1="46" y1="222" x2="62" y2="222" />
          <line x1="66" y1="192" x2="90" y2="192" />
          <line x1="68" y1="214" x2="88" y2="214" />
          <line x1="92" y1="208" x2="108" y2="208" />
        </g>
        <g strokeWidth="0.6" opacity="0.8">
          <line x1="78" y1="176" x2="34" y2="272" />
          <line x1="78" y1="176" x2="118" y2="270" />
          <line x1="54" y1="186" x2="100" y2="194" />
        </g>
      </g>

      {/* Flagpole + Maryland flag */}
      <line x1="118" y1="300" x2="118" y2="22" stroke="#caa15a" strokeWidth="3" />
      <circle cx="118" cy="20" r="4" fill="#f3cf6e" />
      <g transform="translate(120 28) rotate(-3) scale(1.06)">
        <g filter={lite ? undefined : `url(#${id('wave')})`} clipPath={`url(#${id('flagClip')})`}>
          <MarylandFlag uid={uid} />
          <rect x="-2" y="-4" width="170" height="130" fill={`url(#${id('folds')})`} style={{ mixBlendMode: 'multiply' }} />
        </g>
      </g>

      {/* Dock planks */}
      <path d="M0 300 L300 290 V360 H0 Z" fill={`url(#${id('wood')})`} />
      <g stroke="#1f140b" strokeWidth="1.2" opacity="0.7">
        <line x1="0" y1="318" x2="300" y2="310" />
        <line x1="0" y1="338" x2="300" y2="331" />
        <line x1="72" y1="300" x2="60" y2="360" />
        <line x1="190" y1="294" x2="196" y2="360" />
      </g>

      {/* Team cap (orange & black) */}
      <g transform="translate(58 306)">
        <ellipse cx="4" cy="30" rx="44" ry="7" fill="#000" opacity="0.4" />
        <path d="M-34 22 C-34 -8 -12 -24 10 -24 C32 -24 44 -6 42 20 Z" fill="#141414" />
        <path d="M-14 -20 C-2 -26 18 -26 28 -18 C34 -6 34 10 30 20 L-18 22 C-24 8 -22 -10 -14 -20 Z" fill="#df4601" />
        <path d="M-34 22 C-18 16 24 16 60 26 C44 36 -6 38 -36 30 Z" fill="#0e0e0e" />
        <circle cx="8" cy="-24" r="3" fill="#0e0e0e" />
        {/* generic songbird crest */}
        <path d="M-2 4 C0 -6 10 -12 18 -8 C22 -6 23 -2 27 -2 C23 1 21 1 19 1 C16 10 6 13 -2 10 Z" fill="#111" />
        <circle cx="16" cy="-5" r="1.4" fill="#fff" />
        <path d="M24 -4 l6 1.5 l-6 1.5 z" fill="#f5c048" />
      </g>

      {/* Baseball */}
      <g transform="translate(118 334)">
        <circle r="11" fill="#f6f1e4" />
        <path d="M-7 -8 C-3 -3 -3 3 -7 8 M7 -8 C3 -3 3 3 7 8" stroke="#c8202a" strokeWidth="1.3" fill="none" strokeDasharray="1.6 1.4" />
      </g>

      {/* Steamed crab on a plate — local culture */}
      <g transform="translate(196 318)">
        <ellipse cx="0" cy="18" rx="62" ry="14" fill="#000" opacity="0.4" />
        <ellipse cx="0" cy="12" rx="58" ry="14" fill="#e9dcc3" />
        <ellipse cx="0" cy="10" rx="48" ry="10" fill="#d6c6a6" />
        <g stroke="#b3361a" strokeWidth="5" strokeLinecap="round" fill="none">
          <path d="M-22 8 l-18 10 l-6 -2" />
          <path d="M-18 13 l-14 12" />
          <path d="M22 8 l18 10 l6 -2" />
          <path d="M18 13 l14 12" />
        </g>
        <path d="M-20 -6 C-34 -18 -46 -14 -48 -4 C-44 -10 -36 -10 -30 -4 Z" fill="#c9401c" />
        <path d="M-48 -4 l-4 -10 l8 3 z" fill="#8a2410" />
        <path d="M20 -6 C34 -18 46 -14 48 -4 C44 -10 36 -10 30 -4 Z" fill="#c9401c" />
        <path d="M48 -4 l4 -10 l-8 3 z" fill="#8a2410" />
        <ellipse cx="0" cy="0" rx="32" ry="17" fill={`url(#${id('crab')})`} />
        <g fill="#ffd08a" opacity="0.8">
          <circle cx="-12" cy="-6" r="1.6" />
          <circle cx="6" cy="-9" r="1.3" />
          <circle cx="14" cy="-2" r="1.6" />
          <circle cx="-4" cy="3" r="1.2" />
          <circle cx="-20" cy="2" r="1.1" />
        </g>
        <circle cx="-7" cy="-15" r="2.2" fill="#1a0a05" />
        <circle cx="7" cy="-15" r="2.2" fill="#1a0a05" />
      </g>

      {/* Date crate — date/time identity */}
      <g transform="translate(252 296) rotate(4)">
        <rect x="-24" y="-8" width="52" height="40" fill="#a8783f" />
        <rect x="-24" y="-8" width="52" height="40" fill="none" stroke="#5a3a18" strokeWidth="2" />
        <line x1="-24" y1="12" x2="28" y2="12" stroke="#5a3a18" strokeWidth="1" opacity="0.6" />
        <text x="2" y="7" textAnchor="middle" fontFamily="Bebas Neue, sans-serif" fontSize="13" fill="#2a1508" letterSpacing="0.5">
          {date}
        </text>
        <text x="2" y="26" textAnchor="middle" fontFamily="Bebas Neue, sans-serif" fontSize="10" fill="#2a1508" letterSpacing="0.5">
          {time}
        </text>
      </g>

      <rect width="300" height="360" fill={`url(#${id('vignette')})`} />
      {!lite && <rect width="300" height="360" filter={`url(#${id('grain')})`} fill="#000" opacity="0.9" style={{ mixBlendMode: 'overlay' }} />}
    </svg>
  );
}

function LightTower({ x, y }: { x: number; y: number }) {
  return (
    <g>
      <line x1={x} y1={y} x2={x} y2={250} stroke="#1a0c07" strokeWidth="2.4" />
      <rect x={x - 11} y={y - 12} width="22" height="13" rx="1.5" fill="#1a0c07" />
      <g fill="#fff4cf">{[0, 1, 2, 3].map((c) => [0, 1].map((r) => <rect key={`${c}${r}`} x={x - 9 + c * 5} y={y - 10 + r * 5} width="3.4" height="3.4" rx="0.8" />))}</g>
      <circle cx={x} cy={y - 5} r="22" fill="#fff4cf" opacity="0.16" />
    </g>
  );
}

/** The Maryland state flag: Calvert (gold/black) and Crossland (red/white) quarters. */
function MarylandFlag({ uid }: { uid: string }) {
  const W = 165;
  const H = 116;
  const qw = W / 2;
  const qh = H / 2;
  return (
    <g>
      <Calvert x={0} y={0} w={qw} h={qh} uid={`${uid}a`} />
      <Crossland x={qw} y={0} w={qw} h={qh} uid={`${uid}b`} />
      <Crossland x={0} y={qh} w={qw} h={qh} uid={`${uid}c`} />
      <Calvert x={qw} y={qh} w={qw} h={qh} uid={`${uid}d`} />
    </g>
  );
}

function Calvert({ x, y, w, h, uid }: { x: number; y: number; w: number; h: number; uid: string }) {
  const pw = w / 6;
  const band = `M${x} ${y + h * 0.18} L${x + w * 0.2} ${y} L${x + w} ${y + h * 0.82} L${x + w * 0.8} ${y + h} Z`;
  const pales = (invert: boolean) =>
    Array.from({ length: 6 }, (_, i) => <rect key={i} x={x + i * pw} y={y} width={pw + 0.4} height={h} fill={(i % 2 === 0) !== invert ? '#e8b43a' : '#0f0f10'} />);
  return (
    <g>
      <clipPath id={`bend-${uid}`}>
        <path d={band} />
      </clipPath>
      {pales(false)}
      <g clipPath={`url(#bend-${uid})`}>{pales(true)}</g>
    </g>
  );
}

function Crossland({ x, y, w, h, uid }: { x: number; y: number; w: number; h: number; uid: string }) {
  const cx = x + w / 2;
  const cy = y + h / 2;
  const a = Math.min(w, h) * 0.36;
  const t = a * 0.28;
  const cross: ReactNode = (
    <g>
      <rect x={cx - t / 2} y={cy - a} width={t} height={a * 2} />
      <rect x={cx - a} y={cy - t / 2} width={a * 2} height={t} />
      {[
        [0, -1],
        [0, 1],
        [-1, 0],
        [1, 0],
      ].map(([dx, dy], i) => (
        <g key={i}>
          <circle cx={cx + dx * a} cy={cy + dy * a} r={t * 0.62} />
          <circle cx={cx + dx * a + dy * t * 0.7} cy={cy + dy * a - dx * t * 0.7} r={t * 0.52} />
          <circle cx={cx + dx * a - dy * t * 0.7} cy={cy + dy * a + dx * t * 0.7} r={t * 0.52} />
        </g>
      ))}
    </g>
  );
  return (
    <g>
      <clipPath id={`w-${uid}`}>
        <rect x={x} y={y} width={w / 2} height={h / 2} />
        <rect x={cx} y={cy} width={w / 2} height={h / 2} />
      </clipPath>
      <clipPath id={`r-${uid}`}>
        <rect x={cx} y={y} width={w / 2} height={h / 2} />
        <rect x={x} y={cy} width={w / 2} height={h / 2} />
      </clipPath>
      <rect x={x} y={y} width={w} height={h} fill="#c8102e" />
      <g clipPath={`url(#w-${uid})`}>
        <rect x={x} y={y} width={w} height={h} fill="#f7f3ea" />
        <g fill="#c8102e">{cross}</g>
      </g>
      <g clipPath={`url(#r-${uid})`} fill="#f7f3ea">
        {cross}
      </g>
    </g>
  );
}

/* ------------------------------------------------------------------ */
/* Generic poster for the fan's other teams                            */
/* ------------------------------------------------------------------ */

interface PosterProps {
  uid: string;
  date: string;
  time: string;
  lite?: boolean;
  sky: [string, string, string, string];
  accent: string;
  ink: string;
  skyline: 'raleigh' | 'baltimore' | 'charlotte' | 'dc';
  emblem: 'hockey' | 'football' | 'soccer' | 'basketball';
  motif: 'oaks' | 'flag' | 'crown' | 'blossom';
}

function Poster({ uid, date, time, sky, accent, ink, skyline, emblem, motif }: PosterProps) {
  const id = (s: string) => `${s}-${uid}`;
  return (
    <svg viewBox="0 0 300 360" preserveAspectRatio="xMidYMid slice" className="ticket-art-svg" aria-hidden="true">
      <defs>
        <linearGradient id={id('sky')} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={sky[0]} />
          <stop offset="0.35" stopColor={sky[1]} />
          <stop offset="0.62" stopColor={sky[2]} />
          <stop offset="0.75" stopColor={sky[3]} />
        </linearGradient>
        <radialGradient id={id('burst')} cx="0.5" cy="0.62" r="0.6">
          <stop offset="0" stopColor="#fff" stopOpacity="0.55" />
          <stop offset="1" stopColor="#fff" stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect width="300" height="360" fill={`url(#${id('sky')})`} />
      {/* sunburst rays */}
      <g opacity="0.16" fill="#fff">
        {Array.from({ length: 14 }, (_, i) => (
          <path key={i} d="M150 230 L140 -40 L160 -40 Z" transform={`rotate(${i * 25.7 - 180} 150 230)`} />
        ))}
      </g>
      <rect width="300" height="360" fill={`url(#${id('burst')})`} />
      <Motif kind={motif} accent={accent} />
      <Skyline kind={skyline} ink={ink} />
      {/* Arena floor */}
      <path d="M0 278 Q150 256 300 278 V360 H0 Z" fill={ink} />
      <path d="M0 284 Q150 262 300 284" stroke={accent} strokeWidth="3" fill="none" opacity="0.9" />
      <g transform="translate(150 300)">
        <Emblem kind={emblem} accent={accent} />
      </g>
      <text x="24" y="342" fontFamily="Bebas Neue, sans-serif" fontSize="16" fill="#fff" opacity="0.9" letterSpacing="1">
        {date}
      </text>
      <text x="276" y="342" textAnchor="end" fontFamily="Bebas Neue, sans-serif" fontSize="16" fill="#fff" opacity="0.9" letterSpacing="1">
        {time}
      </text>
    </svg>
  );
}

function Skyline({ kind, ink }: { kind: PosterProps['skyline']; ink: string }) {
  const paths: Record<PosterProps['skyline'], string> = {
    raleigh: 'M0 280 V236 h18 v-20 h14 v20 h12 v-44 h18 v44 h10 v-60 l9 -12 l9 12 v60 h14 v-30 h22 v30 h16 v-52 h20 v52 h14 v-26 h18 v26 h12 v-40 h16 v40 h24 V280 Z',
    baltimore: 'M0 280 V240 h16 v-14 h10 v14 h14 v-52 h8 l5 -20 l5 20 h8 v52 h18 v-34 h22 v34 h12 v-66 h20 v66 h16 v-24 h24 v24 h14 v-44 h18 v44 h30 V280 Z',
    charlotte: 'M0 280 V238 h20 v-28 h16 v28 h14 v-50 h16 v50 h10 V150 l12 -18 l12 18 v88 h14 v-60 h18 v60 h14 v-36 h20 v36 h16 v-22 h20 v22 h14 V280 Z',
    dc: 'M0 280 V246 h30 v-10 h24 v10 h20 v-16 h16 v16 h10 v-20 c0 -26 16 -40 36 -44 v-10 h4 v10 c20 4 36 18 36 44 v20 h10 v-14 h18 v14 h26 v-8 h22 v8 h24 V280 Z',
  };
  return <path d={paths[kind]} fill={ink} opacity="0.94" />;
}

function Motif({ kind, accent }: { kind: PosterProps['motif']; accent: string }) {
  if (kind === 'oaks')
    return (
      <g fill={accent} opacity="0.55">
        {[
          [40, 60, 0.9],
          [250, 90, 1.1],
          [210, 40, 0.7],
          [70, 150, 0.6],
        ].map(([x, y, s], i) => (
          <path
            key={i}
            transform={`translate(${x} ${y}) scale(${s}) rotate(${i * 40})`}
            d="M0 -30 C8 -24 14 -26 12 -16 C20 -14 22 -8 14 -2 C22 4 18 12 10 10 C12 20 4 24 0 30 C-4 24 -12 20 -10 10 C-18 12 -22 4 -14 -2 C-22 -8 -20 -14 -12 -16 C-14 -26 -8 -24 0 -30 Z"
          />
        ))}
      </g>
    );
  if (kind === 'flag')
    return (
      <g opacity="0.8" transform="translate(186 30) rotate(6)">
        {Array.from({ length: 6 }, (_, i) => (
          <rect key={i} x={i * 14} y="0" width="14" height="60" fill={i % 2 ? '#0f0f10' : '#e8b43a'} />
        ))}
        <rect x="0" y="0" width="84" height="60" fill="none" stroke="#fff" strokeOpacity="0.3" />
      </g>
    );
  if (kind === 'crown')
    return (
      <g transform="translate(150 92)" fill="none" stroke="#fff" strokeWidth="5" strokeLinejoin="round" opacity="0.85">
        <path d="M-56 30 L-64 -26 L-28 4 L0 -40 L28 4 L64 -26 L56 30 Z" />
        <line x1="-56" y1="44" x2="56" y2="44" />
      </g>
    );
  return (
    <g fill="#ffd1dc" opacity="0.85">
      {Array.from({ length: 22 }, (_, i) => (
        <circle key={i} cx={(i * 53) % 300} cy={20 + ((i * 29) % 160)} r={3 + (i % 3)} />
      ))}
      <path d="M0 40 C60 60 90 30 140 50" stroke="#3b1e14" strokeWidth="4" fill="none" />
      <path d="M300 90 C250 100 220 70 180 86" stroke="#3b1e14" strokeWidth="4" fill="none" />
    </g>
  );
}

function Emblem({ kind, accent }: { kind: PosterProps['emblem']; accent: string }) {
  switch (kind) {
    case 'hockey':
      return (
        <g>
          <path d="M-70 -70 L10 30 L40 30" stroke="#f3efe6" strokeWidth="9" strokeLinecap="round" fill="none" />
          <path d="M70 -70 L-10 30 L-40 30" stroke={accent} strokeWidth="9" strokeLinecap="round" fill="none" />
          <ellipse cx="0" cy="38" rx="22" ry="8" fill="#0a0a0a" stroke="#fff" strokeOpacity="0.4" />
        </g>
      );
    case 'football':
      return (
        <g transform="rotate(-20)">
          <ellipse rx="56" ry="32" fill="#6b3a1c" />
          <path d="M-54 0 C-40 -26 40 -26 54 0" stroke="#3e1f0c" strokeWidth="2" fill="none" />
          <line x1="-20" y1="0" x2="20" y2="0" stroke="#fff" strokeWidth="3" />
          {[-14, -7, 0, 7, 14].map((x) => (
            <line key={x} x1={x} y1="-5" x2={x} y2="5" stroke="#fff" strokeWidth="2.4" />
          ))}
          <path d="M-44 -14 v28 M44 -14 v28" stroke="#fff" strokeWidth="3" />
        </g>
      );
    case 'soccer':
      return (
        <g>
          <circle r="40" fill="#f7f7f7" />
          <path d="M0 -14 L13 -4 L8 12 L-8 12 L-13 -4 Z" fill="#111" />
          {[0, 72, 144, 216, 288].map((a) => (
            <path key={a} transform={`rotate(${a}) translate(0 -34)`} d="M0 -6 L7 0 L4 8 L-4 8 L-7 0 Z" fill="#111" />
          ))}
          <circle r="40" fill="none" stroke={accent} strokeWidth="3" />
        </g>
      );
    case 'basketball':
      return (
        <g>
          <circle r="40" fill="#e0692a" />
          <g stroke="#2a1206" strokeWidth="2.6" fill="none">
            <line x1="-40" y1="0" x2="40" y2="0" />
            <line x1="0" y1="-40" x2="0" y2="40" />
            <path d="M-28 -28 C-10 -10 -10 10 -28 28" />
            <path d="M28 -28 C10 -10 10 10 28 28" />
          </g>
          <circle r="40" fill="none" stroke={accent} strokeWidth="3" />
        </g>
      );
  }
}
