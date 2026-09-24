import { useEffect, useRef, useState } from 'react';
import { Navigate, useNavigate, useParams } from 'react-router-dom';
import { useStore } from '../state/store';
import { fmt, gameById, ticketView } from '../state/selectors';
import { Ticket, type TicketPhase } from '../components/Ticket';
import './ticket-print.css';

type Stage = 'preparing' | 'printing' | 'ready' | 'assigned' | 'joined';

const CAPTION: Record<Stage, string> = {
  preparing: 'Preparing your ticket…',
  printing: 'Printing your ticket…',
  ready: 'Your ticket is ready!',
  assigned: 'Your ticket is ready!',
  joined: 'Your ticket is ready!',
};

const PHASE: Record<Stage, TicketPhase> = {
  preparing: 'blank',
  printing: 'printing',
  ready: 'printed',
  assigned: 'assigned',
  joined: 'assigned',
};

/**
 * STATE 1  PREPARING YOUR TICKET…  blank white stock
 * STATE 2  PRINTING YOUR TICKET…   light sweep top → bottom reveals the artwork
 * STATE 3  YOUR TICKET IS READY!   artwork complete, then Section/Row/Seat pop above the barcode
 *          "You joined 8,315 others so far."
 */
export function TicketPrint() {
  const { gameId = '' } = useParams();
  const { state, dispatch } = useStore();
  const navigate = useNavigate();
  const game = gameById(state, gameId);
  const existedAtMount = useRef(!!state.data.tickets[gameId]);
  const [stage, setStage] = useState<Stage>('preparing');
  const reduced = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const T = reduced ? { prep: 700, print: 900, ready: 500, assign: 500, next: 2600 } : { prep: 1500, print: 2900, ready: 900, assign: 900, next: 2800 };

  // The ticket is issued (and saved) the moment the fan taps — leaving mid-print keeps it.
  useEffect(() => {
    if (game && !existedAtMount.current) dispatch({ type: 'issueTicket', gameId, now: Date.now() });
  }, [dispatch, game, gameId]);

  useEffect(() => {
    if (existedAtMount.current) return;
    const at = [T.prep, T.prep + T.print, T.prep + T.print + T.ready, T.prep + T.print + T.ready + T.assign];
    const stages: Stage[] = ['printing', 'ready', 'assigned', 'joined'];
    const timers = at.map((ms, i) => setTimeout(() => setStage(stages[i]), ms));
    timers.push(setTimeout(() => navigate(`/ticket/${gameId}`, { replace: true }), at[3] + T.next));
    return () => timers.forEach(clearTimeout);
  }, [gameId]);

  if (!game) return <Navigate to="/" replace />;
  // One game = one ticket: never print a second one.
  if (existedAtMount.current) return <Navigate to={`/ticket/${gameId}`} replace />;

  const ticket = state.data.tickets[gameId];
  if (!ticket) return <main className="print-screen" />;
  const view = ticketView(state, ticket);

  return (
    <main className={`print-screen stage-${stage}`}>
      <div className="print-beam" aria-hidden="true" />
      <h1 className="print-caption display" aria-live="assertive">
        {CAPTION[stage]}
      </h1>
      <div className="print-ticket">
        <Ticket view={view} phase={PHASE[stage]} printMs={T.print} />
      </div>
      <div className="print-after">
        <p className={`print-joined ${stage === 'joined' ? 'show' : ''}`}>
          You joined <b>{fmt(view.joinedCount ?? 0)}</b> others so far.
        </p>
        <button
          className={`print-next ${stage === 'joined' ? 'show' : ''}`}
          onClick={() => navigate(`/ticket/${gameId}`, { replace: true })}
          tabIndex={stage === 'joined' ? 0 : -1}
        >
          See your seat →
        </button>
      </div>
    </main>
  );
}
