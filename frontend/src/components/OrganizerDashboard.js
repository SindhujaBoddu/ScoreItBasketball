import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import "../styles/OrganizerDashboard.css";
function OrganizerDashboard() {
  const [tournaments, setTournaments] = useState([]);

  useEffect(() => {
    fetch('http://localhost:5000/organizer-tournaments')
      .then((res) => res.json())
      .then((data) => setTournaments(data));
  }, []);

  return (
    <div className="admin-home">
      <nav className="navbar">
        <div className="logo-container">
          <img src="./Logo.png" alt="Logo" className="org-logo" />
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
      <div className='container'>
      <h1 className='title'>My Tournaments</h1>
      <div className='card'>
      <Link to="/create-tournament"><button className='tournament-btn'>Create New Tournament</button></Link>
      <Link to="/manage-tournament"><button className='tournament-btn'>Manage Tournament</button></Link>
      </div>
      </div>
      <ul>
        {tournaments.map((tournament) => (
          <li key={tournament.id}>
            <Link to={`/tournament/${tournament.id}`}>{tournament.name}</Link>
          </li>
        ))}
      </ul>
      <ul>
  {tournaments.map((tournament) => (
    <li key={tournament.id}>
      <Link to={`/tournament/${tournament.id}`}>{tournament.name}</Link>
      <Link to={`/tournament/${tournament.id}/manage`}>
        <button>Manage</button>
      </Link>
    </li>
  ))}
</ul>

    </div>
  );
}

export default OrganizerDashboard;
