import { Link } from 'react-router-dom';
import { useStore } from '../../state/store';
import { allTickets, badges, fmt, teamName, teamStats, totals } from '../../state/selectors';
import { TEAMS } from '../../data/teams';
import { FDMark } from '../../components/FDMark';
import { Icon } from '../../components/Icon';
import { TeamMark } from '../../components/TeamMark';
import { Ticket } from '../../components/Ticket';
import { Scene } from '../../components/Scene';
import { BadgeMedal, SectionTitle, Stat, Stub } from './parts';

/** PASSPORT = my fandom history. */
export function PassportHome() {
  const { state } = useStore();
  const { games, miles, seasons, leagues, tickets } = totals(state);
  const fan = state.data.fan;
  const latest = tickets.find((t) => t.finalScore) ?? tickets[0];
  const earned = badges(state).filter((b) => b.earned);
  const sports = new Set(state.data.followed.map((id) => TEAMS[id].sport)).size;

  return (
    <main className="screen theme-dark passport">
      <div className="topbar p-bar">
        <span className="icon-btn" aria-hidden="true" />
        <h1>Your Passport</h1>
        <Link to="/passport/locker-room" className="icon-btn p-locker-btn" aria-label="Locker Room">
          <Icon name="locker" />
        </Link>
      </div>

      <div className="wrap">
        {/* Passport cover: identity */}
        <section className="p-cover" aria-label="Fan identity">
          <div className="p-cover-top">
            <span className="p-cover-title">FanDistance Passport</span>
            <FDMark tone="mono-white" className="p-cover-mark" />
          </div>
          <div className="p-cover-id">
            <span className="p-avatar">{fan.name[0]}</span>
            <div>
              <strong>{fan.handle}</strong>
              <small>Representing from {fan.homeCity}</small>
              <small>Fan since {fan.fanSince}</small>
            </div>
          </div>
          <div className="p-cover-teams">
            {state.data.followed.map((id) => (
              <TeamMark key={id} id={id} size={30} />
            ))}
          </div>
        </section>

        <div className="p-stats">
          <Stat value={fmt(games)} label="Games represented" accent />
          <Stat value={fmt(miles)} label="Miles represented" accent />
          <Stat value={seasons.length} label={seasons.length === 1 ? 'Season represented' : 'Seasons represented'} />
          <Stat value={state.data.followed.length} label="Teams you follow" />
        </div>
        <p className="p-span">
          {leagues.length} leagues · {sports} sports · {seasons.join(' & ')}
        </p>

        {latest && (
          <>
            <SectionTitle title="Recent activity" to={`/passport/ticket/${latest.id}`} link="Game story" />
            <Link to={`/passport/ticket/${latest.id}`} className="p-recent card">
              <div className="p-recent-t">
                <Ticket view={latest} lite />
              </div>
              <div className="p-recent-body">
                {latest.finalScore ? (
                  <div className="p-recent-score display">
                    {TEAMS[latest.homeId].abbr} {latest.finalScore.home} · {TEAMS[latest.awayId].abbr} {latest.finalScore.away}
                  </div>
                ) : (
                  <div className="p-recent-score display">
                    {TEAMS[latest.homeId].abbr} vs {TEAMS[latest.awayId].abbr}
                  </div>
                )}
                <small>
                  {latest.shortDate}, {latest.season} · {latest.finalScore ? 'Final' : latest.live ? 'Live' : 'Today'}
                </small>
                <span className="p-recent-cta">View last game recap →</span>
              </div>
            </Link>
          </>
        )}

        <SectionTitle title="Ticket book" to="/passport/tickets" link={`All ${tickets.length}`} />
        <div className="p-book-strip" role="list">
          {tickets.slice(0, 8).map((t) => (
            <div role="listitem" key={t.id}>
              <Stub t={t} />
            </div>
          ))}
        </div>

        <SectionTitle title="Seasons" />
        <div className="card p-list">
          {seasons.map((s) => {
            const ts = tickets.filter((t) => t.season === s);
            return (
              <Link key={s} to={`/passport/seasons/${s}`} className="row-link">
                <span className="p-season-yr display">{s}</span>
                <span className="grow">
                  <strong>
                    {ts.length} games · {fmt(ts.reduce((n, t) => n + t.distanceMiles, 0))} miles
                  </strong>
                  <small>{[...new Set(ts.map((t) => TEAMS[t.fanTeamId].league))].join(' · ')}</small>
                </span>
                <Icon name="chevron" size={18} />
              </Link>
            );
          })}
        </div>

        <SectionTitle title="Your teams" to="/passport/teams" link="All teams" />
        <div className="card p-list">
          {state.data.followed.slice(0, 4).map((id) => {
            const st = teamStats(state, id);
            return (
              <Link key={id} to={`/passport/teams/${id}`} className="row-link">
                <TeamMark id={id} size={36} />
                <span className="grow">
                  <strong>{teamName(id)}</strong>
                  <small>
                    {TEAMS[id].league} · {st.games} games · {fmt(st.miles)} miles
                  </small>
                </span>
                <Icon name="chevron" size={18} />
              </Link>
            );
          })}
          <Link to="/passport/leagues" className="row-link">
            <Icon name="teams" size={22} />
            <span className="grow">
              <strong>Leagues & sports</strong>
              <small>All the leagues you follow</small>
            </span>
            <Icon name="chevron" size={18} />
          </Link>
        </div>

        <SectionTitle title="Recognition" to="/passport/recognition" link={`${earned.length} earned`} />
        <Link to="/passport/recognition" className="p-badges card" aria-label="See your recognition">
          {earned.slice(0, 5).map((b) => (
            <BadgeMedal key={b.id} b={b} size={54} />
          ))}
        </Link>
        <p className="p-principle">Recognized for your story, not a score. No points. No leaderboards.</p>

        <SectionTitle title="Memorable games" to="/passport/stats" link="Fan stats" />
        <MemorableGames />

        <SectionTitle title="Memories" to="/passport/memories" />
        <div className="p-mem-grid">
          {state.data.memories.slice(0, 6).map((m) => (
            <Link to="/passport/memories" key={m.id} className="p-mem" aria-label={m.title}>
              <Scene kind={m.art} colors={m.colors} />
            </Link>
          ))}
        </div>

        <Link to="/passport/locker-room" className="p-locker card">
          <Icon name="locker" size={30} />
          <span className="grow">
            <strong>Locker Room</strong>
            <small>Your space: profile, teams, posts, photos, notifications, privacy and sharing.</small>
          </span>
          <Icon name="chevron" size={18} />
        </Link>

        <p className="p-forever display">Your story. Forever.</p>
      </div>
    </main>
  );
}

export function MemorableGames() {
  const { state } = useStore();
  const tickets = allTickets(state);
  const withMarks = tickets.filter((t) => t.marks.length);
  const mostMiles = [...tickets].sort((a, b) => b.distanceMiles - a.distanceMiles)[0];
  const bigWin = [...tickets]
    .filter((t) => t.finalScore && t.result === 'W')
    .sort((a, b) => Math.abs(b.finalScore!.home - b.finalScore!.away) - Math.abs(a.finalScore!.home - a.finalScore!.away))[0];
  const rows = [
    ...withMarks.slice(0, 3).map((t) => ({ t, title: t.marks[0].detail, icon: 'star' as const })),
    bigWin && { t: bigWin, title: 'Biggest win you represented', icon: 'trophy' as const },
    mostMiles && { t: mostMiles, title: `Most miles (one game): ${fmt(mostMiles.distanceMiles)}`, icon: 'map' as const },
  ].filter(Boolean) as { t: (typeof tickets)[number]; title: string; icon: 'star' | 'trophy' | 'map' }[];
  return (
    <div className="card p-list">
      {rows.map(({ t, title, icon }) => (
        <Link key={title + t.id} to={`/passport/ticket/${t.id}`} className="row-link">
          <Icon name={icon} size={22} />
          <span className="grow">
            <strong>{title}</strong>
            <small>
              {t.shortDate}, {t.season} · {TEAMS[t.awayId].abbr} @ {TEAMS[t.homeId].abbr}
              {t.finalScore ? ` · ${t.finalScore.away}–${t.finalScore.home}` : ''}
            </small>
          </span>
          <Icon name="chevron" size={18} />
        </Link>
      ))}
    </div>
  );
}
