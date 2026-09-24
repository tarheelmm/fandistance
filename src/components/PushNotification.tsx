import { useEffect, useState } from 'react';
import type { Game } from '../data/types';
import { TEAMS } from '../data/teams';
import { FDMark } from './FDMark';
import { Icon } from './Icon';
import './push.css';

const dismissed = new Set<string>();

/**
 * One consolidated notification when the ticket window opens (1 hour before).
 * Tapping it begins ticket generation immediately — no confirmation, no line.
 */
export function PushNotification({ games, onOpen }: { games: Game[]; onOpen: () => void }) {
  const key = games.map((g) => g.id).join('|');
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (dismissed.has(key)) return;
    const t = setTimeout(() => setOpen(true), 450);
    return () => clearTimeout(t);
  }, [key]);

  if (dismissed.has(key) && !open) return null;

  const close = () => {
    dismissed.add(key);
    setOpen(false);
  };

  const g = games[0];
  const home = TEAMS[g.homeId];
  const away = TEAMS[g.awayId];
  const many = games.length > 1;

  return (
    <div className={`push ${open ? 'open' : ''}`} aria-live="polite">
      <button
        className="push-body"
        onClick={() => {
          close();
          onOpen();
        }}
        aria-label={`FanDistance notification: Get in line, it's almost game time! ${many ? `${games.length} games are ready.` : `${home.short} vs ${away.short}, ${g.timeLabel}.`} Tap to get today's ticket.`}
        tabIndex={open ? 0 : -1}
      >
        <span className="push-icon">
          <FDMark tone="dark-bg" />
        </span>
        <span className="push-text">
          <span className="push-app">
            FANDISTANCE <em>now</em>
          </span>
          <strong>GET IN LINE, IT’S ALMOST GAME TIME!</strong>
          {many ? (
            <span>
              {games.length} games are ready: {games.map((x) => `${TEAMS[x.homeId].short}${TEAMS[x.homeId].sport === 'football' ? ' Football' : ''}`).join(', ')}
            </span>
          ) : (
            <span>
              {home.short} vs {away.short} · {g.timeLabel.replace(' ET', '')}
            </span>
          )}
          <span>Get today’s {many ? 'tickets' : 'ticket'}.</span>
        </span>
      </button>
      <button className="push-x icon-btn" onClick={close} aria-label="Dismiss notification" tabIndex={open ? 0 : -1}>
        <Icon name="close" size={16} />
      </button>
    </div>
  );
}
