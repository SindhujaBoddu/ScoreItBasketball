import React, { useEffect, useState } from "react";
import { useNavigate,Link } from "react-router-dom";
import '../styles/ViewerDashboard.css';
function ViewerDashboard() {
  const [tournaments, setTournaments] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  useEffect(() => {
    fetch("http://localhost:5000/api/tournaments")
      .then((response) => response.json())
      .then((data) => {
        console.log("Fetched tournaments:", data); 
        setTournaments(data.tournaments || []); // Ensure it's always an array
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching tournaments:", error);
        setTournaments([]); // Fallback to an empty array
        setLoading(false);
      });
  }, []);

  const viewTournament = (id) => {
    navigate(`/tournament/${id}`); // Navigate to tournament details page
  };
  if (loading) {
    return <p>Loading tournaments...</p>;
  }

  return (
    <div className="view-tourney">
      <nav className="navbar">
        <div className="logo-container">
          <img src="./Logo.png" alt="Score It Logo" className="view-logo" />
        </div>
        <ul className="nav-links">
        <li><Link to ="/">Home</Link></li> 
          <li><Link to ="/game">Game</Link></li>
          <li><Link to="/tournament">Tournaments</Link></li>
          <li><Link to="/about">About Us</Link></li>
          <li><Link to="/contact">Contact</Link></li>
          <li><Link to="/account">Account</Link></li>
        </ul>
      </nav>
      <h1 className="title">All Tournaments</h1>
      <div className="tournament-list">
      {tournaments.length === 0 ? (
        <p>No tournaments available.</p>
      ) : (
        <ul>
          {tournaments.map((tournament) => (
            <div className='tournament-card'key={tournament.id}>
            <span className="tournament-name">{tournament.name}</span>
            <button className='view-button'onClick={() => viewTournament(tournament.id)}>View Tourney</button>
            </div>
          ))}
        </ul>
      )}
    </div>
    </div>
  );
}

export default ViewerDashboard;
