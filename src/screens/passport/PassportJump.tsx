import { useEffect, useRef, useState } from 'react';

const ITEMS: [string, string][] = [
  ['stats', 'Stats'],
  ['recognition', 'Recognition'],
  ['perks', 'Team perks'],
  ['recent', 'Last game'],
  ['tickets', 'Ticket book'],
  ['moments', 'Big games'],
  ['seasons', 'Seasons'],
  ['teams', 'Teams'],
  ['pins', 'Pins'],
  ['memories', 'Memories'],
  ['locker', 'Locker Room'],
];

/** Sticky jump bar under the Passport header: one tap to any section, highlight follows scroll. */
export function PassportJump() {
  const [active, setActive] = useState('stats');
  const lockUntil = useRef(0);
  const row = useRef<HTMLElement>(null);

  useEffect(() => {
    const onScroll = () => {
      if (Date.now() < lockUntil.current) return;
      let current = ITEMS[0][0];
      for (const [id] of ITEMS) {
        const el = document.getElementById(`jump-${id}`);
        if (el && el.getBoundingClientRect().top < 150) current = id;
      }
      setActive(current);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const chip = row.current?.querySelector<HTMLElement>(`[data-j="${active}"]`);
    if (chip && row.current) row.current.scrollTo({ left: chip.offsetLeft - 16, behavior: 'smooth' });
  }, [active]);

  const jump = (id: string) => {
    setActive(id);
    lockUntil.current = Date.now() + 700;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    document.getElementById(`jump-${id}`)?.scrollIntoView({ block: 'start', behavior: reduced ? 'auto' : 'smooth' });
  };

  return (
    <nav className="p-jump" aria-label="Jump to a Passport section" ref={row}>
      {ITEMS.map(([id, label]) => (
        <button key={id} className="p-jump-chip" data-j={id} aria-current={active === id ? 'true' : undefined} onClick={() => jump(id)}>
          {label}
        </button>
      ))}
    </nav>
  );
}
