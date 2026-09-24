import { useId } from 'react';
import type { Memory } from '../data/types';

/** Lightweight illustrated "photos" for moments and memories. */
export function Scene({ kind, colors, className }: { kind: Memory['art'] | 'bp' | 'crowd' | 'dog' | 'sunset'; colors?: Record<string, string>; className?: string }) {
  const uid = useId().replace(/:/g, '');
  const g = (s: string) => `${s}-${uid}`;
  const common = { viewBox: '0 0 160 120', preserveAspectRatio: 'xMidYMid slice', className: `scene ${className ?? ''}`, 'aria-hidden': true } as const;

  switch (kind) {
    case 'ballpark':
    case 'bp':
      return (
        <svg {...common}>
          <defs>
            <linearGradient id={g('s')} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor={kind === 'bp' ? '#5fa8e8' : '#f59a4a'} />
              <stop offset="1" stopColor={kind === 'bp' ? '#cfe6fa' : '#ffd9a0'} />
            </linearGradient>
          </defs>
          <rect width="160" height="120" fill={`url(#${g('s')})`} />
          <path d="M0 52 h160 v20 H0Z" fill="#6a2b18" />
          {Array.from({ length: 16 }, (_, i) => (
            <rect key={i} x={3 + i * 10} y="56" width="4" height="5" rx="2" fill="#ffc56a" opacity="0.8" />
          ))}
          <path d="M0 64 C40 58 120 58 160 64 V74 H0Z" fill="#1c2436" />
          <path d="M0 74 H160 V120 H0Z" fill="#3a9a52" />
          <g fill="#fff" opacity="0.08">
            {[0, 1, 2, 3, 4].map((i) => (
              <path key={i} d={`M${i * 40 - 20} 120 L${i * 40 + 10} 74 L${i * 40 + 30} 74 L${i * 40} 120Z`} />
            ))}
          </g>
          <path d="M50 120 L80 88 L110 120Z" fill="#c98b56" />
          <path d="M66 112 L80 98 L94 112 L80 120Z" fill="#3a9a52" stroke="#fff" strokeWidth="1" />
          <line x1="16" y1="16" x2="16" y2="64" stroke="#1c2436" strokeWidth="1.5" />
          <rect x="8" y="10" width="16" height="8" fill="#1c2436" />
          <line x1="144" y1="12" x2="144" y2="64" stroke="#1c2436" strokeWidth="1.5" />
          <rect x="136" y="6" width="16" height="8" fill="#1c2436" />
        </svg>
      );
    case 'fireworks':
      return (
        <svg {...common}>
          <rect width="160" height="120" fill="#0b1026" />
          {[
            [44, 34, '#ffb34a'],
            [110, 28, '#ff5a5a'],
            [82, 52, '#ffe07a'],
          ].map(([x, y, c], k) => (
            <g key={k} stroke={c as string} strokeWidth="1.6" strokeLinecap="round">
              {Array.from({ length: 14 }, (_, i) => {
                const a = (i / 14) * Math.PI * 2;
                return (
                  <line
                    key={i}
                    x1={(x as number) + Math.cos(a) * 5}
                    y1={(y as number) + Math.sin(a) * 5}
                    x2={(x as number) + Math.cos(a) * 20}
                    y2={(y as number) + Math.sin(a) * 20}
                  />
                );
              })}
            </g>
          ))}
          <path d="M0 96 C40 86 120 86 160 96 V120 H0Z" fill="#141b33" />
          <g fill="#ffc56a" opacity="0.7">
            {Array.from({ length: 30 }, (_, i) => (
              <circle key={i} cx={(i * 5.3) % 160} cy={100 + (i % 4) * 4} r="0.9" />
            ))}
          </g>
        </svg>
      );
    case 'mascot':
    case 'coloring':
      return (
        <svg {...common}>
          <rect width="160" height="120" fill={colors?.bg ?? '#f5efe2'} />
          <g transform="translate(80 64)">
            <CrabMascot colors={colors} />
          </g>
        </svg>
      );
    case 'scorecard':
      return (
        <svg {...common}>
          <rect width="160" height="120" fill="#efe6d2" />
          {Array.from({ length: 7 }, (_, r) => (
            <line key={r} x1="10" y1={20 + r * 14} x2="150" y2={20 + r * 14} stroke="#b5a47f" />
          ))}
          {Array.from({ length: 9 }, (_, c) => (
            <line key={c} x1={40 + c * 12} y1="14" x2={40 + c * 12} y2="104" stroke="#b5a47f" />
          ))}
          <g stroke="#1d3d8f" strokeWidth="1.4" fill="none">
            <path d="M46 30 l4 -4 l4 4 l-4 4z" />
            <path d="M58 44 l4 -4" />
            <circle cx="74" cy="58" r="3" />
            <path d="M94 72 l4 -4 l4 4" />
          </g>
          <text x="12" y="12" fontSize="8" fontFamily="Bebas Neue" fill="#8e2a22">
            SCORECARD
          </text>
        </svg>
      );
    case 'fan':
    case 'crowd':
      return (
        <svg {...common}>
          <rect width="160" height="120" fill="#f08a2e" />
          <circle cx="80" cy="50" r="22" fill="#e9b48a" />
          <path d="M56 42 C58 22 102 22 104 42 C94 36 66 36 56 42Z" fill="#111" />
          <path d="M60 40 C64 30 96 30 100 40 Z" fill="#f26a1b" />
          <path d="M44 120 C46 86 114 86 116 120Z" fill="#111" />
          <rect x="40" y="84" width="80" height="26" rx="3" fill="#fff" transform="rotate(-6 80 97)" />
          <text x="80" y="102" textAnchor="middle" fontFamily="Bebas Neue" fontSize="15" fill="#f26a1b" transform="rotate(-6 80 97)">
            GO BALTIMORE!
          </text>
        </svg>
      );
    case 'skyline':
    case 'sunset':
      return (
        <svg {...common}>
          <defs>
            <linearGradient id={g('k')} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#3a1a3e" />
              <stop offset="0.6" stopColor="#f07a3a" />
              <stop offset="1" stopColor="#ffd08a" />
            </linearGradient>
          </defs>
          <rect width="160" height="120" fill={`url(#${g('k')})`} />
          <path d="M0 84 V64 h10 v-10 h8 v10 h10 v-24 h10 v24 h8 v-36 l4 -6 l4 6 v36 h12 v-18 h14 v18 h10 v-30 h12 v30 h12 v-14 h14 v14 h10 v20Z" fill="#1c0f14" />
          <rect y="84" width="160" height="36" fill="#2a1a22" />
          <g stroke="#ffb45a" opacity="0.7">
            <line x1="60" y1="92" x2="100" y2="92" />
            <line x1="50" y1="100" x2="110" y2="100" />
          </g>
        </svg>
      );
    case 'crab':
      return (
        <svg {...common}>
          <rect width="160" height="120" fill="#6b4a2e" />
          {[0, 1, 2].map((i) => (
            <line key={i} x1="0" y1={30 + i * 34} x2="160" y2={26 + i * 34} stroke="#4a3220" strokeWidth="2" />
          ))}
          <ellipse cx="80" cy="74" rx="56" ry="18" fill="#e9dcc3" />
          <g transform="translate(80 66) scale(0.9)">
            <ellipse rx="32" ry="17" fill="#d9481f" />
            <path d="M-20 -6 C-34 -18 -46 -14 -48 -4 C-44 -10 -36 -10 -30 -4Z M20 -6 C34 -18 46 -14 48 -4 C44 -10 36 -10 30 -4Z" fill="#c9401c" />
          </g>
          <rect x="120" y="24" width="24" height="34" rx="3" fill="#e0a23a" />
          <rect x="120" y="30" width="24" height="8" fill="#1d4d8f" />
        </svg>
      );
    case 'dog':
      return (
        <svg {...common}>
          <rect width="160" height="120" fill="#8fb6d8" />
          <ellipse cx="80" cy="70" rx="30" ry="34" fill="#c68a4a" />
          <ellipse cx="54" cy="54" rx="10" ry="20" fill="#8a5a2a" />
          <ellipse cx="106" cy="54" rx="10" ry="20" fill="#8a5a2a" />
          <circle cx="70" cy="62" r="3" fill="#111" />
          <circle cx="90" cy="62" r="3" fill="#111" />
          <ellipse cx="80" cy="76" rx="6" ry="4" fill="#111" />
          <path d="M50 100 L110 100 L104 120 L56 120Z" fill="#f26a1b" />
        </svg>
      );
  }
}

/** Fillable coloring page mascot. Region ids: shell, claw, cap, bill, plate, bat. */
export function CrabMascot({ colors, onFill, interactive }: { colors?: Record<string, string>; onFill?: (region: string) => void; interactive?: boolean }) {
  const c = (k: string, d = '#ffffff') => colors?.[k] ?? d;
  const hit = (k: string) =>
    interactive
      ? {
          onClick: () => onFill?.(k),
          role: 'button',
          'aria-label': `Color the ${k}`,
          tabIndex: 0,
          onKeyDown: (e: React.KeyboardEvent) => (e.key === 'Enter' || e.key === ' ') && onFill?.(k),
          style: { cursor: 'pointer' },
        }
      : {};
  const stroke = { stroke: '#1a1a1a', strokeWidth: 2.2, strokeLinejoin: 'round' as const };
  return (
    <g>
      <ellipse cx="0" cy="40" rx="62" ry="10" fill={c('plate')} {...stroke} {...hit('plate')} />
      {/* legs */}
      <g fill="none" stroke="#1a1a1a" strokeWidth="2.2" strokeLinecap="round">
        <path d="M-26 18 l-18 12 M-22 24 l-12 14 M26 18 l18 12 M22 24 l12 14" />
      </g>
      {/* bat */}
      <path d="M36 -30 L58 -52 C61 -55 65 -51 62 -48 L40 -26 Z" fill={c('bat', '#ffffff')} {...stroke} {...hit('bat')} />
      {/* claws */}
      <path d="M-30 -2 C-44 -12 -52 -26 -44 -34 C-38 -40 -30 -34 -34 -26 C-28 -30 -22 -24 -26 -18 Z" fill={c('claw')} {...stroke} {...hit('claw')} />
      <path d="M30 -2 C40 -14 44 -26 38 -30 C34 -32 30 -28 32 -22 C28 -26 22 -22 26 -16 Z" fill={c('claw')} {...stroke} {...hit('claw')} />
      {/* shell */}
      <path d="M-38 6 C-38 -18 -18 -26 0 -26 C18 -26 38 -18 38 6 C38 24 18 30 0 30 C-18 30 -38 24 -38 6 Z" fill={c('shell')} {...stroke} {...hit('shell')} />
      {/* face */}
      <circle cx="-10" cy="-2" r="6" fill="#fff" {...stroke} />
      <circle cx="10" cy="-2" r="6" fill="#fff" {...stroke} />
      <circle cx="-9" cy="-1" r="2.5" fill="#1a1a1a" />
      <circle cx="11" cy="-1" r="2.5" fill="#1a1a1a" />
      <path d="M-10 12 Q0 20 10 12" fill="none" stroke="#1a1a1a" strokeWidth="2.2" strokeLinecap="round" />
      {/* cap */}
      <path d="M-22 -22 C-22 -40 22 -40 22 -22 Z" fill={c('cap')} {...stroke} {...hit('cap')} />
      <path d="M14 -24 C24 -26 34 -24 38 -20 C30 -18 20 -18 12 -20 Z" fill={c('bill')} {...stroke} {...hit('bill')} />
    </g>
  );
}
