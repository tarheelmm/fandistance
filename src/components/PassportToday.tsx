import { Link } from 'react-router-dom';
import { Icon } from './Icon';
import { useTodayInPassport } from '../state/hooks';
import './passport-today.css';

/** GAME DAY creates moments. PASSPORT remembers them. */
export function PassportToday({
  gameId,
  cta = 'View in Passport',
  to = '/passport',
  variant = 'dashed',
}: {
  gameId?: string;
  cta?: string;
  to?: string;
  variant?: 'dashed' | 'card';
}) {
  const { items, ticket } = useTodayInPassport(gameId);
  return (
    <section className={`pt ${variant}`} aria-labelledby="pt-h">
      <div className="pt-head">
        <h2 id="pt-h">Today in your Passport</h2>
        <Icon name="passport" size={20} />
      </div>
      {!ticket && <p className="pt-sub">Get today’s ticket to start adding to your fandom history.</p>}
      {ticket && <p className="pt-sub">This updates throughout the game.</p>}
      <ul className="check-list">
        {items.map((it) => (
          <li key={it.label} className={it.done ? '' : 'todo'}>
            <span className="tick">{it.done && <Icon name="check" size={13} stroke={3} />}</span>
            {it.label}
          </li>
        ))}
      </ul>
      <Link to={to} className="pt-cta">
        {cta} <span aria-hidden="true">→</span>
      </Link>
    </section>
  );
}
