import { useCallback, useEffect, useLayoutEffect, useState } from 'react';
import { Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import { Launch } from '../screens/Launch';
import { Home } from '../screens/Home';
import { TicketPrint } from '../screens/TicketPrint';
import { TicketSeat } from '../screens/TicketSeat';
import { GameDayHub } from '../screens/gameday/GameDayHub';
import { GameDayArea } from '../screens/gameday/GameDayArea';
import { PassportRoutes } from '../screens/passport/PassportRoutes';
import { BottomNav } from '../components/BottomNav';
import { DemoControls } from '../components/DemoControls';

const NO_NAV = [/^\/ticket\//];

export function App() {
  const location = useLocation();
  const navigate = useNavigate();
  const skipLaunch = new URLSearchParams(window.location.search).has('nolaunch');
  const [launching, setLaunching] = useState(!skipLaunch);

  const replayLaunch = useCallback(() => {
    navigate('/', { replace: true });
    setLaunching(true);
  }, [navigate]);

  // Cold start always enters Home after the launch sequence.
  useEffect(() => {
    if (!skipLaunch && location.pathname !== '/') navigate('/', { replace: true });
  }, []);

  useLayoutEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  const path = location.pathname;
  const showNav = !NO_NAV.some((r) => r.test(path));

  return (
    <>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/ticket/:gameId/print" element={<TicketPrint />} />
        <Route path="/ticket/:gameId" element={<TicketSeat />} />
        <Route path="/gameday" element={<GameDayHub />} />
        <Route path="/gameday/:gameId" element={<GameDayHub />} />
        <Route path="/gameday/:gameId/:area" element={<GameDayArea />} />
        <Route path="/passport/*" element={<PassportRoutes />} />
        <Route path="*" element={<Home />} />
      </Routes>
      {showNav && <BottomNav tone="dark" />}
      {/* Solid backing behind the phone's status bar (time, battery) in the installed app */}
      <div className="status-scrim" aria-hidden="true" />
      {!launching && <DemoControls onRestart={replayLaunch} />}
      {launching && <Launch onDone={() => setLaunching(false)} />}
    </>
  );
}
