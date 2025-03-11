import React, { useState } from 'react'; 
import { useParams,useNavigate,Link} from 'react-router-dom';
import "../styles/CreateTeams.css";

function CreateTeams() {
  const { tournamentId } = useParams();
  const navigate=useNavigate();
  const [teamName, setTeamName] = useState('');
  const [players, setPlayers] = useState(['']);

  const handlePlayerChange = (index, value) => {
    const newPlayers = [...players];
    newPlayers[index] = value;
    setPlayers(newPlayers);
  };

  const addPlayerField = () => {
    setPlayers([...players, '']);
  };

  const handleTeamSubmit = async () => {
    console.log('Tournament ID:', tournamentId);
    console.log('Registering team with data:', { teamName, players });
    if (!tournamentId || !teamName || players.some(player => !player)) {
      alert('Tournament ID, Team Name, or Player Names are missing!');
      return;
    }
    try {
      const response = await fetch('http://localhost:5000/create-teams', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tournamentId, teamName, players }),
      });

      const data = await response.json();
      if (response.ok) {
        console.log('Response from server:', data);
        alert('Team and players registered successfully!');
        setTeamName('');
        setPlayers(['']);
      } else {
        console.error('Error from server:', data.error);
        alert(`Failed to register team: ${data.error}`);
      }
    } catch (error) {
      console.error('Fetch Error:', error);
      alert('An unexpected error occurred while registering the team and players');
    }
  };
  const handleScheduleMatch = () => {
    navigate(`/schedule-match/${tournamentId}`);
  };
  
  

  return (
    <div className='create-teams'>
      <nav className="navbar">
        <div className="logo-container">
          <img src="/logo.png" alt="Logo" className="team-logo" />
        </div>
        <ul className="nav-links">
          <li><Link to ="/organizer">Home</Link></li>
          <li><Link to ="/game">Game</Link></li>
          <li><Link to="/manage-tournament">Tournaments</Link></li>
          <li><Link to="/about">About Us</Link></li>
          <li><Link to="/contact">Contact</Link></li>
          <li><Link to="/account">Account</Link></li>
        </ul>
      </nav>
      <h1 className='title'>CREATE TEAMS</h1>
      <div className='form-container'>
      <div className='form-section'>
        <h2>Register Team</h2>
      <label>Name:</label>
      <input type="text" className='input-field' placeholder="Team Name" value={teamName} onChange={(e) => setTeamName(e.target.value)} />
      </div>
      <div className='form-section'>
      <h2>Register Player</h2>
      <label>Name:</label>
      {players.map((player, index) => (
        <input key={index} type="text" className='input-field' placeholder={`Player ${index + 1} Name`} value={player} onChange={(e) => handlePlayerChange(index, e.target.value)}/>
      ))}
      </div>
      </div>
      <div className='button-group'>
      <button className='primary-button' onClick={addPlayerField}>Add Player</button>
      <button className='primary-button' onClick={handleTeamSubmit}>Register Team</button>
      </div>
      <button className='schedule-button' onClick={handleScheduleMatch}>Schedule Match</button>
    </div>
  );
}

export default CreateTeams;