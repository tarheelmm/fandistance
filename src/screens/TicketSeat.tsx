import { Navigate, useNavigate, useParams } from 'react-router-dom';
import { useStore } from '../state/store';
import { fmt, gameById, ticketView } from '../state/selectors';
import { Ticket } from '../components/Ticket';
import { StadiumMap } from '../components/StadiumMap';
import { Icon } from '../components/Icon';
import { useBack } from '../state/hooks';
import './ticket-seat.css';

/** YOUR TICKET + YOUR SEAT (Storyboard 3, panel 3). */
export function TicketSeat() {
  const { gameId = '' } = useParams();
  const { state, dispatch } = useStore();
  const navigate = useNavigate();
  const back = useBack('/');
  const game = gameById(state, gameId);
  const t = state.data.tickets[gameId];
  if (!game || !t) return <Navigate to="/" replace />;
  const view = ticketView(state, t);
  const seat = t.seat;
  const fan = state.data.fan;

  const enter = () => {
    dispatch({ type: 'checkIn', gameId, now: Date.now() });
    navigate(`/gameday/${gameId}`);
  };

  return (
    <main className="screen no-nav theme-light ts-screen">
      <div className="topbar">
        <button className="icon-btn" onClick={back} aria-label="Back">
          <Icon name="back" />
        </button>
        <h1>Your ticket</h1>
        <span className="icon-btn" aria-hidden="true" />
      </div>

      <div className="wrap">
        <section aria-label="Your ticket" className="ts-ticket">
          <Ticket view={view} />
        </section>

        <section aria-labelledby="ys-h" className="ts-seat">
          <h2 id="ys-h" className="ts-label">
            Your seat
          </h2>
          <StadiumMap seat={seat} />
          {seat.kind === 'seat' ? (
            <>
              <p className="ts-seatline">
                Section {seat.section} • Row {seat.row} • Seat {seat.seat}
              </p>
              <div className="ts-seatnums" aria-hidden="true">
                <div>
                  <span>Section</span>
                  <b>{seat.section}</b>
                </div>
                <div>
                  <span>Row</span>
                  <b>{seat.row}</b>
                </div>
                <div>
                  <span>Seat</span>
                  <b>{seat.seat}</b>
                </div>
              </div>
            </>
          ) : (
            <>
              <p className="ts-seatline">Standing Room Only</p>
              <p className="ts-sub">Every seat is taken tonight. You’re with the crowd on the concourse, highlighted above.</p>
            </>
          )}
          <p className="ts-sub">
            {t.location === 'venue'
              ? 'Your FanDistance seat for tonight’s game.'
              : `Your virtual seat for tonight — representing from ${fan.homeCity}, ${fmt(t.distanceMiles)} miles away.`}
          </p>
        </section>

        <p className="ts-joined">
          You joined <b>{fmt(t.joinedCount)}</b> others so far.
        </p>

        <button className="btn block ts-enter" onClick={enter}>
          {game.status === 'final' ? 'View Game Day' : 'Enter Game Day'}
        </button>
        <p className="ts-saved">
          <Icon name="check" size={14} stroke={2.6} /> You can close the app anytime. Your ticket and seat are saved.
        </p>
      </div>
    </main>
  );
}
