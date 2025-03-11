import React, { useState, useEffect } from "react";
import { useParams,Link } from "react-router-dom";
import "../styles/ScheduleMatch.css";
function ScheduleMatch() {
  const { tournamentId } = useParams();
  const [matchFormat, setMatchFormat] = useState("knockout");
  const [rounds, setRounds] = useState(1);
  const [matchDate, setMatchDate] = useState("");
  const [matchTime, setMatchTime] = useState("10:00");
  const [matchesPerDay, setMatchesPerDay] = useState(1);
  const [matches, setMatches] = useState([]);

  const handleSchedule = async () => {
    if (!matchDate) {
      alert("Please select a match start date.");
      return;
    }
  
    let endpoint;
    let body;
  
    if (matchFormat === "round-robin") {
      endpoint = `/api/tournaments/${tournamentId}/schedule-roundrobin`;
      body = JSON.stringify({ rounds, matchDate, matchTime,matchesPerDay});
    } else if (matchFormat === "knockout") {
      endpoint = `/api/tournaments/${tournamentId}/schedule-knockout`;
      body = JSON.stringify({ matchDate, matchTime,matchesPerDay });
    } else if (matchFormat === "playoffs") {
      endpoint = `/api/tournaments/${tournamentId}/schedule-playoffs`;
      body = JSON.stringify({ matchDate, matchTime,matchesPerDay });
    }
  
    try {
      console.log("📢 Sending request to:", `http://localhost:5000${endpoint}`);
      console.log("📦 Request body:", body);
  
      const response = await fetch(`http://localhost:5000${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: body,
      });
  
      const responseText = await response.text();
      console.log("📩 Response text:", responseText);
  
      if (!response.ok) {
        console.error("❌ Server Error:", responseText);
        alert(`Error: ${responseText}`);
        return;
      }
  
      const data = JSON.parse(responseText);
      console.log("✅ Response from server:", data);
  
      setMatches(data.matches);
      alert("Schedule created successfully!");
    } catch (error) {
      console.error("🚨 Fetch Error:", error);
      alert("An unexpected error occurred.");
    }
  };
  
  return (
    <div className="generate-schedule">
      <nav className="navbar">
        <div className="logo-container">
          <img src="/logo.png" alt="Score It Logo" className="sch-logo" />
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
      <h1 className="title">GENERATE SCHEDULE</h1>
      <div className="form-container">
        <div className="form-group">
      <label>
        Match Format:
        <select className='input-field' value={matchFormat} onChange={(e) => setMatchFormat(e.target.value)}>
          <option value="knockout">Knockout</option>
          <option value="round-robin">Round Robin</option>
          <option value="playoffs">Playoffs</option>
        </select>
      </label>
      </div>
      <div className="form-group">
      {matchFormat === "round-robin" && (
        <label>
          Rounds:
          <input className='input-field'type="number" value={rounds} min="1" onChange={(e) => setRounds(Number(e.target.value))} />
        </label>
      )}
      </div>
      <div className="form-group">
      <label>Start Date:
        <input className='input-field'type="date" value={matchDate} onChange={(e) => setMatchDate(e.target.value)} />
      </label>
      </div>
      <div className="form-group">
      <label>Time:
        <input type="time" className='input-field' value={matchTime} onChange={(e) => setMatchTime(e.target.value)} />
      </label>
      </div>
      <div className="form-group">
          <label>Matches Per Day:
            <input className="input-field" type="number" value={matchesPerDay} min="1" onChange={(e) => setMatchesPerDay(Number(e.target.value))} />
          </label>
        </div>
      </div>
      <button className='generate-button'onClick={handleSchedule}>Generate Schedule</button>
    </div>
  );
}

export default ScheduleMatch;