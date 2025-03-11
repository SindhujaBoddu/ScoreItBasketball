import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import HomePage from './components/HomePage';
import LoginPage from './components/LoginPage';
import OrganizerDashboard from './components/OrganizerDashboard';
import ViewerDashboard from './components/ViewerDashboard';
import SignupPage from './components/SignupPage';
import CreateTournament from './components/CreateTournament';
import ManageTournament from './components/ManageTournament';
import LiveMatch from './components/LiveMatch';
import CompletedMatch from './components/CompletedMatch';
import CreateTeams from './components/CreateTeams';
import ScheduleMatch from './components/ScheduleMatch';
import ViewTournament from './components/ViewTournament';
import EndMatch from './components/EndMatch';
import Tournament from './components/Tournament';
import Match from './components/Match';
import Playoffs from './components/playoffs';
function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/organizer" element={<OrganizerDashboard />} />
        <Route path="/viewer" element={<ViewerDashboard />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/create-tournament" element={<CreateTournament/>}/>
        <Route path="/manage-tournament" element={<ManageTournament/>}/>
        <Route path="/live-match/:matchId" element={<LiveMatch/>}/>
        <Route path="/completed-match" element={<CompletedMatch/>}/>
        <Route path="/create-teams/:tournamentId/:teams" element={<CreateTeams/>}/>
        <Route path="/schedule-match/:tournamentId" element={<ScheduleMatch/>}/>
        <Route path="/view-tournament/:id" element={<ViewTournament/>}/>
        <Route path="/end-match/:teamA/:teamB/:teamA_score/:teamB_score" element={<EndMatch/>}/>
        <Route path="/tournament/:id" element={<Tournament/>}/>
        <Route path="/match/:matchId" element={<Match/>}/>
        <Route path="/playoffs/:tournamentId" element={<Playoffs/>}/>
      </Routes>
    </Router>
  );
}

export default App;
