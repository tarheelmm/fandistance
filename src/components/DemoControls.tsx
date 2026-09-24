import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../state/store';
import { SCENARIOS } from '../data/scenarios';
import { TEAMS } from '../data/teams';
import { Icon } from './Icon';
import './demo.css';

/**
 * Reviewer-only demo controls. Deliberately separate from the consumer UI:
 * a small dashed "DEMO" tab on the screen edge (or press "D").
 */
export function DemoControls({ onRestart }: { onRestart: () => void }) {
  const { state, dispatch } = useStore();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement) return;
      if (e.key === 'd' || e.key === 'D') setOpen((o) => !o);
      if (e.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const games = state.data.games.filter((g) => g.status !== 'scheduled');
  const load = (id: (typeof SCENARIOS)[number]['id']) => {
    dispatch({ type: 'loadScenario', id, now: Date.now() });
    setOpen(false);
    navigate('/', { replace: true });
  };

  return (
    <>
      <button className="demo-tab" onClick={() => setOpen(true)} aria-label="Open demo controls" aria-expanded={open}>
        DEMO
      </button>
      {open && (
        <div className="demo-scrim" onClick={() => setOpen(false)}>
          <div className="demo-sheet" role="dialog" aria-modal="true" aria-label="Demo controls" onClick={(e) => e.stopPropagation()}>
            <div className="demo-grab" aria-hidden="true" />
            <div className="demo-head">
              <strong>Demo controls</strong>
              <span>Reviewer tools · not part of the consumer app</span>
              <button className="icon-btn" onClick={() => setOpen(false)} aria-label="Close demo controls">
                <Icon name="close" size={18} />
              </button>
            </div>

            <h3>Scenario</h3>
            <div className="demo-scen">
              {SCENARIOS.map((s) => (
                <button key={s.id} className={state.scenario === s.id ? 'on' : ''} onClick={() => load(s.id)} aria-pressed={state.scenario === s.id}>
                  <b>{s.id}</b>
                  <span>
                    <strong>{s.title}</strong>
                    <small>{s.blurb}</small>
                  </span>
                </button>
              ))}
            </div>

            <h3>Game state</h3>
            {games.map((g) => {
              const t = state.data.tickets[g.id];
              return (
                <div key={g.id} className="demo-game">
                  <div>
                    <strong>
                      {TEAMS[g.homeId].short} {TEAMS[g.homeId].name} vs {TEAMS[g.awayId].short}
                    </strong>
                    <small>
                      {g.status.toUpperCase()} · {t ? (t.finalScore ? 'ticket + score' : t.checkedInAt ? 'ticket checked in' : 'ticket issued') : 'no ticket'}
                    </small>
                  </div>
                  <div className="demo-actions">
                    <button disabled={g.status === 'live' || g.status === 'final'} onClick={() => dispatch({ type: 'setGameStatus', gameId: g.id, status: 'live' })}>
                      Start
                    </button>
                    <button
                      disabled={g.status === 'final'}
                      onClick={() => {
                        dispatch({ type: 'setGameStatus', gameId: g.id, status: 'final' });
                        setOpen(false);
                        if (t) navigate(`/gameday/${g.id}`);
                      }}
                    >
                      Game final
                    </button>
                    <button
                      disabled={!t}
                      onClick={() => dispatch({ type: 'addMark', gameId: g.id, mark: { kind: 'historic', label: 'WALK-OFF', detail: 'Historic moment: walk-off win' } })}
                    >
                      + Historic mark
                    </button>
                  </div>
                </div>
              );
            })}

            <h3>Fan location (for new tickets)</h3>
            <div className="demo-seg">
              {(
                [
                  ['beyond', 'Beyond the venue'],
                  ['venue', 'At the venue'],
                ] as const
              ).map(([k, l]) => (
                <button key={k} className={state.data.fan.location === k ? 'on' : ''} onClick={() => dispatch({ type: 'setLocation', location: k })}>
                  {l}
                </button>
              ))}
            </div>

            <button
              className="demo-restart"
              onClick={() => {
                dispatch({ type: 'loadScenario', id: state.scenario, now: Date.now() });
                setOpen(false);
                onRestart();
              }}
            >
              <Icon name="restart" size={18} /> Restart demo
            </button>
          </div>
        </div>
      )}
    </>
  );
}
