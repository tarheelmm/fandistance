import { useEffect, useRef, useState } from 'react';
import { FDMark, Wordmark } from '../components/FDMark';
import './launch.css';

/**
 * Storyboard 1 launch:
 *   0.0s  FD logo with Point A and stadium visible
 *   0.3–1.5s  dotted route travels from Point A to the stadium
 *   ~1.5s  stadium pulses on arrival
 *   1.5–2.2s  hold logo, wordmark, REPRESENTING FROM EVERYWHERE
 *   then enter Home. No spinner, progress bar, loading text or skip.
 */
export function Launch({ onDone }: { onDone: () => void }) {
  const [leaving, setLeaving] = useState(false);
  const done = useRef(onDone);
  done.current = onDone;
  useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const hold = reduced ? 1200 : 2250;
    const t1 = setTimeout(() => setLeaving(true), hold);
    const t2 = setTimeout(() => done.current(), hold + 320);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, []);

  return (
    <div className={`launch ${leaving ? 'leaving' : ''}`} role="img" aria-label="FanDistance — Representing from everywhere">
      <StadiumBackdrop />
      <div className="launch-center">
        <div className="launch-mark">
          <FDMark tone="dark-bg" animate />
        </div>
        <div className="launch-word">
          <Wordmark tone="dark-bg" />
        </div>
      </div>
    </div>
  );
}

function StadiumBackdrop() {
  return (
    <div className="launch-bg" aria-hidden="true">
      <svg viewBox="0 0 390 844" preserveAspectRatio="xMidYMid slice">
        <defs>
          <radialGradient id="lb-sky" cx="0.5" cy="0.25" r="0.8">
            <stop offset="0" stopColor="#1d3566" />
            <stop offset="0.5" stopColor="#0b1733" />
            <stop offset="1" stopColor="#050a17" />
          </radialGradient>
          <radialGradient id="lb-light">
            <stop offset="0" stopColor="#fff" stopOpacity="0.95" />
            <stop offset="0.25" stopColor="#dbe8ff" stopOpacity="0.5" />
            <stop offset="1" stopColor="#9fb9ff" stopOpacity="0" />
          </radialGradient>
          <linearGradient id="lb-field" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#0b1a33" />
            <stop offset="1" stopColor="#1b2d4d" />
          </linearGradient>
          <linearGradient id="lb-haze" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#6d8fd6" stopOpacity="0" />
            <stop offset="1" stopColor="#6d8fd6" stopOpacity="0.25" />
          </linearGradient>
        </defs>
        <rect width="390" height="844" fill="url(#lb-sky)" />
        {/* light banks */}
        {[
          [52, 150],
          [338, 150],
        ].map(([x, y], k) => (
          <g key={k}>
            <circle cx={x} cy={y} r="120" fill="url(#lb-light)" opacity="0.55" />
            <g transform={`translate(${x - 26} ${y - 20}) rotate(${k ? 12 : -12} 26 20)`}>
              <rect width="52" height="40" rx="3" fill="#0d1628" />
              {Array.from({ length: 20 }, (_, i) => (
                <rect key={i} x={3 + (i % 5) * 10} y={3 + Math.floor(i / 5) * 9} width="7" height="6" rx="1.5" fill="#fff" />
              ))}
            </g>
          </g>
        ))}
        {/* tiered stands with crowd */}
        {[
          [470, '#0c1630', '#23345a'],
          [515, '#0a132a', '#1d2c4d'],
          [560, '#09112a', '#1a2744'],
        ].map(([y, fill, dot], k) => (
          <g key={k}>
            <path d={`M0 ${y} C90 ${(y as number) - 26} 300 ${(y as number) - 26} 390 ${y} V${(y as number) + 60} H0 Z`} fill={fill as string} />
            <g fill={dot as string}>
              {Array.from({ length: 120 }, (_, i) => (
                <circle key={i} cx={(i * 3.3 + k * 7) % 390} cy={(y as number) - 14 + ((i * 11) % 30)} r={1.3 + (i % 3) * 0.3} />
              ))}
            </g>
          </g>
        ))}
        <path d="M0 600 C80 580 310 580 390 600 V620 H0 Z" fill="#0a1224" />
        <rect y="540" width="390" height="80" fill="url(#lb-haze)" />
        {/* field with mowing stripes in perspective */}
        <path d="M0 620 H390 V844 H0 Z" fill="url(#lb-field)" />
        <g fill="#fff" opacity="0.05">
          {Array.from({ length: 9 }, (_, i) => (
            <path key={i} d={`M${195 + (i - 4) * 18} 620 L${195 + (i - 4) * 90} 844 L${195 + (i - 3.5) * 90} 844 L${195 + (i - 3.5) * 18} 620 Z`} />
          ))}
        </g>
        <rect width="390" height="844" fill="#000" opacity="0.08" />
      </svg>
    </div>
  );
}
