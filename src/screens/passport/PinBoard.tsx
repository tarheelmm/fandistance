import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useStore } from '../../state/store';
import { allTickets, teamName } from '../../state/selectors';
import { PIN_DEFS, type Pin } from '../../data/pins';
import { TEAMS } from '../../data/teams';
import { PinBadge } from '../../components/PinBadge';
import { TeamMark } from '../../components/TeamMark';
import { PHeader } from './parts';

/** Season pins, collected per team per season. Each earned pin opens the ticket it's pinned to. */
export function PinBoard() {
  const { state } = useStore();
  const tickets = allTickets(state);
  const seasons = [...new Set(tickets.map((t) => t.season))].sort().reverse();
  const [season, setSeason] = useState(seasons[0]);
  const inSeason = tickets.filter((t) => t.season === season);
  const teams = [...new Set(inSeason.map((t) => t.fanTeamId))];
  const earnedCount = inSeason.reduce((n, t) => n + t.pins.length, 0);

  return (
    <main className="screen theme-dark passport">
      <PHeader title="Season pins" />
      <div className="wrap">
        <p className="p-sub">Memories from each season, pinned to the ticket they came from.</p>
        <div className="chip-row" role="group" aria-label="Season">
          {seasons.map((s) => (
            <button key={s} className="chip" aria-pressed={season === s} onClick={() => setSeason(s)}>
              {s} season
            </button>
          ))}
        </div>
        <p className="pb-count">
          <b className="display">{earnedCount}</b> pins earned in {season}
        </p>

        {teams.map((teamId) => {
          const ts = inSeason.filter((t) => t.fanTeamId === teamId);
          const pins = ts.flatMap((t) => t.pins);
          const defs = PIN_DEFS.filter((d) => !d.applies || d.applies(teamId, TEAMS[teamId].sport));
          const slots: { def: (typeof defs)[number]; pin?: Pin }[] = defs.flatMap((def) => {
            const got = pins.filter((p) => p.kind === def.kind);
            return got.length ? got.map((pin) => ({ def, pin })) : [{ def }];
          });
          return (
            <section key={teamId} className="pb-board" aria-labelledby={`pb-${teamId}`}>
              <header>
                <TeamMark id={teamId} size={30} />
                <h2 id={`pb-${teamId}`}>
                  {season} {teamName(teamId)}
                </h2>
                <span>
                  {pins.length} pin{pins.length === 1 ? '' : 's'}
                </span>
              </header>
              <div className="pb-grid">
                {slots.map(({ def, pin }, i) =>
                  pin ? (
                    <Link
                      key={`${pin.kind}-${pin.ticketId}`}
                      to={`/passport/ticket/${pin.ticketId}`}
                      className="pb-slot earned"
                      aria-label={`${pin.title}, ${pin.date}. Open ticket`}
                    >
                      <PinBadge kind={pin.kind} season={pin.season} size="100%" />
                      <strong>{def.name}</strong>
                      <small>{pin.date}</small>
                    </Link>
                  ) : (
                    <div key={`${def.kind}-${i}`} className="pb-slot">
                      <PinBadge kind={def.kind} season={season} size="100%" ghost />
                      <strong>{def.name}</strong>
                      <small>{def.hint(season)}</small>
                    </div>
                  ),
                )}
              </div>
            </section>
          );
        })}
        <p className="p-principle">Pins recognize the games you represent. They aren’t points and they aren’t ranked.</p>
      </div>
    </main>
  );
}
