import type { TicketView } from '../../state/selectors';

const TIERS = [
  { at: 10, name: 'Team thank-you', text: 'A digital thank-you from the team and member pricing at the team store' },
  { at: 25, name: 'Remote member', text: 'Early access to giveaway items and watch-party invites' },
  { at: 50, name: 'Season member perks', text: 'The same recognition season ticket members get: a shout-out at the park and member events' },
];

/** Preview: every ticket is an attendance record teams could reward, like season ticket perks. */
export function TeamPerks({ tickets, season }: { tickets: TicketView[]; season?: string }) {
  const count = tickets.filter((t) => t.season === season).length;
  const next = TIERS.find((t) => count < t.at);
  return (
    <section className="p-perks card" aria-label="Team perks preview">
      <p className="p-perks-lede">
        Every ticket in your Passport is a record that you showed up. When teams join FanDistance, that record is what earns perks, the way season ticket members are thanked.
      </p>
      <div className="p-perks-count">
        <b className="display">{count}</b>
        <span>
          games on record in {season}
          {next && (
            <>
              <br />
              {(next.at - count).toLocaleString('en-US')} more to reach {next.name}
            </>
          )}
        </span>
      </div>
      <ol className="p-perks-list">
        {TIERS.map((t) => {
          const met = count >= t.at;
          return (
            <li key={t.at} className={met ? 'met' : ''}>
              <div className="p-perks-row">
                <strong>{t.name}</strong>
                <small>{met ? 'Reached' : `${t.at} games`}</small>
              </div>
              <p>{t.text}</p>
              <span className="p-perks-bar" aria-hidden="true">
                <i style={{ width: `${Math.min(1, count / t.at) * 100}%` }} />
              </span>
            </li>
          );
        })}
      </ol>
      <p className="p-perks-note">Preview. Perks are not offered yet and will depend on each team.</p>
    </section>
  );
}
