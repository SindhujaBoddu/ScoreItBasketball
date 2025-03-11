import React, { useState } from 'react';
import { useNavigate,Link } from 'react-router-dom';
import "../styles/CreateTournament.css";
function CreateTournament() {
  const [name, setName] = useState('');
  const [type, setType] = useState('');
  const [teams, setTeams] = useState(0);
  const navigate=useNavigate();

  const handleSubmit = async () => {
    console.log('Creating tournament with data:',{name,type,teams});
    const response = await fetch('http://localhost:5000/create-tournament', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, type, teams }),
    });
    const data=await response.json();
    if (response.ok) {
      console.log('Response from server:',data);
      alert('Tournament created successfully!');
      navigate(`/create-teams/${data.tournamentId}/${teams}`);
    }else{
      console.error('Error from server:',data.error);
      alert('Failed to create tournament:${data.error}');
    }
  };

  return (
    <div className='create-tournament'>
    <nav className="navbar">
        <div className="logo-container">
          <img src="./Logo.png" alt="Logo" className="tor-logo" />
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
      <h1 className='title'>CREATE TOURNAMENTS</h1>
      <div className='form-container'>
      <div className='form-group'>
      <label>Name:</label><input type="text" className='input-field' placeholder="Tournament Name" value={name} onChange={(e) => setName(e.target.value)} />
      </div>
      <div className='form-group'>
        <label>Type:</label>
      <select className='input-field' value={type} onChange={(e) => setType(e.target.value)}>
        <option value="">Select Type</option>
        <option value="knockout">Knockout</option>
        <option value="round-robin">Round Robin</option>
      </select>
      </div>
      <div className='form-group'>
      <label>Teams:</label>
      <input type="number" className='input-field' placeholder="Number of Teams" value={teams} onChange={(e) => setTeams(e.target.value)} />
      </div>
      </div>
      <button className='create-button' onClick={handleSubmit}>Create</button>
    </div>
  );
}

export default CreateTournament;
