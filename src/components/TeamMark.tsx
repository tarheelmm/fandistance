import { TEAMS } from '../data/teams';

/** Neutral monogram roundel in team colours (no league/team logos). */
export function TeamMark({ id, size = 36 }: { id: string; size?: number | string }) {
  const t = TEAMS[id];
  const label = t.abbr.length > 2 && t.sport !== 'baseball' ? t.abbr : t.abbr.slice(0, 3);
  return (
    <svg viewBox="0 0 40 40" width={size} height={size} className="team-mark" role="img" aria-label={`${t.city} ${t.name}`} style={{ flex: 'none' }}>
      <circle cx="20" cy="20" r="19" fill={t.primary} stroke={t.secondary} strokeWidth="2" />
      <circle cx="20" cy="20" r="15.5" fill="none" stroke="#fff" strokeOpacity="0.35" strokeWidth="0.8" />
      <text x="20" y="25.2" textAnchor="middle" fontFamily="Bebas Neue, sans-serif" fontSize={label.length > 2 ? 14 : 17} fill="#fff" letterSpacing="0.5">
        {label}
      </text>
    </svg>
  );
}
