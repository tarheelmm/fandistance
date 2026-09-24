import { Route, Routes } from 'react-router-dom';
import { PassportHome } from './PassportHome';
import { TicketBook, TicketDetail } from './TicketBook';
import { AddTeam, Leagues, SeasonSummary, TeamHome, Teams } from './Teams';
import { FanStats, Memories, Recognition } from './Recognition';
import { PinBoard } from './PinBoard';
import { LockerHelp, LockerRoom, LockerSettings } from './LockerRoom';
import './passport.css';

export function PassportRoutes() {
  return (
    <Routes>
      <Route index element={<PassportHome />} />
      <Route path="tickets" element={<TicketBook />} />
      <Route path="tickets/:teamId" element={<TicketBook />} />
      <Route path="ticket/:ticketId" element={<TicketDetail />} />
      <Route path="leagues" element={<Leagues />} />
      <Route path="teams" element={<Teams />} />
      <Route path="teams/:teamId" element={<TeamHome />} />
      <Route path="add-team" element={<AddTeam />} />
      <Route path="seasons/:season" element={<SeasonSummary />} />
      <Route path="stats" element={<FanStats />} />
      <Route path="recognition" element={<Recognition />} />
      <Route path="memories" element={<Memories />} />
      <Route path="pins" element={<PinBoard />} />
      <Route path="locker-room" element={<LockerRoom />} />
      <Route path="locker-room/settings" element={<LockerSettings />} />
      <Route path="locker-room/help" element={<LockerHelp />} />
      <Route path="*" element={<PassportHome />} />
    </Routes>
  );
}
