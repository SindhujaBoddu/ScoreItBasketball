import React, { useState, useEffect } from 'react';
import { useParams, useNavigate,Link } from 'react-router-dom';
import "../styles/ViewTournament.css";

function Tournament() {
  const { id } = useParams(); // Get tournament ID from URL
  const navigate = useNavigate();
  const [matches, setMatches] = useState([]);
  const [pointsTable, setPointsTable] = useState([]);
  const [tournamentWinner, setTournamentWinner] = useState(null);

  // ✅ Fetch Matches
  useEffect(() => {
    fetch(`http://localhost:5000/api/tournament/${id}/matches`)
      .then(response => response.json())
      .then(data => {
        console.log("Fetched matches:", data); // Debugging output
        const matchData = Array.isArray(data) ? data : data.matches || [];
        setMatches(matchData); 
      })
      .catch(error => console.error('Error fetching matches:', error));
  }, [id]);

  // ✅ Fetch Points Table
  useEffect(() => {
    fetch(`http://localhost:5000/api/tournament/${id}/points-table`)
      .then(response => response.json())
      .then(data => {
        if (Array.isArray(data)) {
          setPointsTable(data.sort((a, b) => b.points - a.points)); // Sort by points
        } else {
          setPointsTable([]);
        }
      })
      .catch(error => console.error('Error fetching points table:', error));
  }, [id]);

  // ✅ Fetch Tournament Winner
  useEffect(() => {
    fetch(`http://localhost:5000/api/tournament/${id}`)
      .then(response => response.json())
      .then(data => setTournamentWinner(data.winner))
      .catch(error => console.error('Error fetching tournament winner:', error));
  }, [id]);

  return (
    <div className="container1">
      <nav className="navbar">
        <img src="/logo.png" alt="Logo" className='tour-logo' />
        <ul className="nav-links">
        <li><Link to ="/viewer">Home</Link></li> 
          <li><Link to ="/game">Game</Link></li>
          <li><Link to="/viewer">Tournaments</Link></li>
          <li><Link to="/about">About Us</Link></li>
          <li><Link to="/contact">Contact</Link></li>
          <li><Link to="/account">Account</Link></li>
        </ul>
      </nav>

      <h2>Matches for Tournament {id}</h2>

      {/* ✅ DEBUG: Show All Matches */}
      <h3>All Matches</h3>
      {matches.length > 0 ? (
        <div className="matches-container">
          {matches.map(match => (
            <div key={match.id} className="tournament-card">
              <h4>{match.home_team} vs {match.away_team}</h4>
              <p>Round: {match.round || "N/A"}</p>
              <p>Date: {new Date(match.time).toLocaleString()}</p>
              {match.status === 'completed' ? (
                <p className='match-result'>
                  🏆 Winner: {match.winner} <br />
                  Final Score: {match.home_team} {match.teamA_score} - {match.away_team} {match.teamB_score}
                </p>
              ) : (
                <button onClick={() => navigate(`/match/${match.id}`)} className="view-btn">
                  View Match
                </button>
              )}
            </div>
          ))}
        </div>
      ) : (
        <p>No matches available</p>
      )}

      {/* ✅ Matches by Round */}
      {["semifinal-1", "semifinal-2", "final"].map((round) => (
        matches.filter(match => match.round === round).length > 0 && (
          <div key={round} className="round-section">
            <h3>{round.replace("-", " ").toUpperCase()}</h3>
            {matches
              .filter(match => match.round === round)
              .map(match => (
                <div key={match.id} className="tournament-card">
                  <h4>{match.home_team} vs {match.away_team}</h4>
                  <p>Date: {new Date(match.time).toLocaleString()}</p>
                  {match.status === 'completed' ? (
                    <p className='match-result'>
                      🏆 Winner: {match.winner} <br />
                      Final Score: {match.home_team} {match.teamA_score} - {match.away_team} {match.teamB_score}
                    </p>
                  ) : (
                    <button onClick={() => navigate(`/match/${match.id}`)} className="view-btn">
                      View Match
                    </button>
                  )}
                </div>
              ))}
          </div>
        )
      ))}

      {/* ✅ Points Table */}
      <h2>Points Table</h2>
      <table border="1">
        <thead>
          <tr>
            <th>Team</th>
            <th>Played</th>
            <th>Wins</th>
            <th>Losses</th>
            <th>Points</th>
          </tr>
        </thead>
        <tbody>
          {pointsTable.length > 0 ? (
            pointsTable.map((team, index) => (
              <tr key={index}>
                <td>{team.team_name}</td>
                <td>{team.games_played}</td>
                <td>{team.wins}</td>
                <td>{team.losses}</td>
                <td>{team.wins * 1}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="5">No points data available</td>
            </tr>
          )}
        </tbody>
      </table>

      {/* ✅ Tournament Winner */}
      {tournamentWinner && <h3>Tournament Winner: {tournamentWinner}</h3>}
    </div>
  );

}

export default Tournament;
