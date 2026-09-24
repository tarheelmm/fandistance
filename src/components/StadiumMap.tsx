import { useId } from 'react';
import type { SeatAssignment } from '../data/types';
import './stadium.css';

const HX = 180;
const HY = 212;

const rad = (d: number) => (d * Math.PI) / 180;
const pt = (a: number, r: number) => [HX + Math.cos(rad(a)) * r, HY + Math.sin(rad(a)) * r] as const;

function wedge(a0: number, a1: number, r0: number, r1: number) {
  const [x0, y0] = pt(a0, r0);
  const [x1, y1] = pt(a0, r1);
  const [x2, y2] = pt(a1, r1);
  const [x3, y3] = pt(a1, r0);
  const large = a1 - a0 > 180 ? 1 : 0;
  return `M${x0} ${y0} L${x1} ${y1} A${r1} ${r1} 0 ${large} 1 ${x2} ${y2} L${x3} ${y3} A${r0} ${r0} 0 ${large} 0 ${x0} ${y0} Z`;
}

/* Seating bowl wraps from right field (-30°) around home plate (90°) to left field (210°). */
const A0 = -30;
const A1 = 210;

const LEVELS = [
  { base: 1, r0: 64, r1: 96, count: 30 },
  { base: 2, r0: 104, r1: 122, count: 24 },
  { base: 3, r0: 130, r1: 164, count: 24 },
];

function sectionNumber(level: number, i: number) {
  return level * 100 + 2 + i * 2;
}

/** Vertical foreshortening: gives the storyboard's angled-bowl view without CSS 3D. */
const K = 0.64;
const H = Math.ceil(384 * K);

export function StadiumMap({ seat }: { seat: SeatAssignment }) {
  const uid = useId().replace(/:/g, '');
  const target = seat.kind === 'seat' ? Number(seat.section) : null;
  let youAt: readonly [number, number] | null = null;

  const sections = LEVELS.flatMap((lv) => {
    const span = (A1 - A0) / lv.count;
    return Array.from({ length: lv.count }, (_, i) => {
      const n = sectionNumber(lv.base, i);
      const a0 = A0 + i * span + 0.7;
      const a1 = A0 + (i + 1) * span - 0.7;
      const mine = n === target;
      if (mine) youAt = pt((a0 + a1) / 2, (lv.r0 + lv.r1) / 2);
      return <path key={n} d={wedge(a0, a1, lv.r0, lv.r1)} className={`sm-sec lv${lv.base} ${mine ? 'is-mine' : ''}`} />;
    });
  });

  const [lfx, lfy] = pt(225, 172);
  const [rfx, rfy] = pt(315, 172);
  const you = youAt as readonly [number, number] | null;

  return (
    <div className="stadium-map">
      <svg
        viewBox={`0 0 360 ${H}`}
        role="img"
        aria-label={seat.kind === 'seat' ? `Stadium map with section ${seat.section} highlighted` : 'Stadium map with the standing room concourse highlighted'}
      >
        <defs>
          <linearGradient id={`grass-${uid}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#2f8f46" />
            <stop offset="1" stopColor="#3fae57" />
          </linearGradient>
          <pattern id={`mow-${uid}`} width="16" height="16" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
            <rect width="8" height="16" fill="#fff" opacity="0.07" />
          </pattern>
          <radialGradient id={`youglow-${uid}`}>
            <stop offset="0" stopColor="#ff8a3d" stopOpacity="0.9" />
            <stop offset="1" stopColor="#ff8a3d" stopOpacity="0" />
          </radialGradient>
        </defs>

        <g transform={`scale(1 ${K})`}>
          {/* bowl shell */}
          <path d={wedge(A0 - 4, A1 + 4, 58, 172)} className="sm-shell" />
          {/* outfield bleachers */}
          <path d={wedge(234, 306, 180, 198)} className="sm-sec lv0" />

          {/* field */}
          <path d={`M${HX} ${HY} L${lfx} ${lfy} A172 172 0 0 1 ${rfx} ${rfy} Z`} fill={`url(#grass-${uid})`} />
          <path d={`M${HX} ${HY} L${lfx} ${lfy} A172 172 0 0 1 ${rfx} ${rfy} Z`} fill={`url(#mow-${uid})`} />
          <path d={`M${HX} ${HY} L${lfx} ${lfy} A172 172 0 0 1 ${rfx} ${rfy} Z`} fill="none" stroke="#1b5e2c" strokeWidth="3" />
          {/* infield dirt + diamond */}
          <path d={`M${HX} ${HY + 8} L${HX - 50} ${HY - 44} Q${HX} ${HY - 106} ${HX + 50} ${HY - 44} Z`} fill="#c98b56" />
          <path d={`M${HX} ${HY} L${HX - 36} ${HY - 36} L${HX} ${HY - 72} L${HX + 36} ${HY - 36} Z`} fill="#3fae57" stroke="#fff" strokeWidth="1.6" />
          <circle cx={HX} cy={HY - 38} r="6" fill="#c98b56" />
          {[
            [HX + 36, HY - 36],
            [HX, HY - 72],
            [HX - 36, HY - 36],
          ].map(([x, y], i) => (
            <rect key={i} x={x - 3} y={y - 3} width="6" height="6" fill="#fff" transform={`rotate(45 ${x} ${y})`} />
          ))}
          <path d={`M${HX - 4} ${HY + 1} h8 v3 l-4 4 l-4 -4 z`} fill="#fff" />

          {/* seating */}
          {sections}

          {/* standing room concourse */}
          <path d={wedge(A0, A1, 124, 128)} className={`sm-concourse ${seat.kind === 'sro' ? 'is-mine' : ''}`} />

          {you && (
            <g className="sm-you" transform={`translate(${you[0]} ${you[1]})`}>
              <circle r="26" fill={`url(#youglow-${uid})`} className="sm-you-glow" />
            </g>
          )}
        </g>
        {you && (
          <g className="sm-pin" transform={`translate(${you[0]} ${you[1] * K})`}>
            <path d="M0 0 C-9 -12 -14 -18 -14 -25 A14 14 0 1 1 14 -25 C14 -18 9 -12 0 0 Z" fill="#f26a1b" stroke="#fff" strokeWidth="2" />
            <circle cy="-25" r="5.5" fill="#fff" />
          </g>
        )}
      </svg>
    </div>
  );
}
