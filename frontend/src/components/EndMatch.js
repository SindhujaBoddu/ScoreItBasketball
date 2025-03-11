import React, { useState } from "react";
import { useParams, useNavigate,Link } from "react-router-dom";
import "../styles/EndMatch.css";
const EndMatch = () => {
  const { id,teamA, teamB, teamA_score, teamB_score } = useParams();
  const [winner, setWinner] = useState(null);
  const navigate = useNavigate();
  const handleEndMatch = async () => {
    if (!winner) {
      alert("Please select a winner before submitting.");
      return;
    }
  
    try {
      const response = await fetch("http://localhost:5000/api/end-match", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          teamA,
          teamB,
          teamA_score,
          teamB_score,
          winner,
        }),
      });
  
      if (response.ok) {
        const result = await response.json();
        console.log("✅ Match result updated:", result);
        alert(`🏆 ${winner} Wins!\n\nFinal Score:\n${teamA}: ${teamA_score} - ${teamB}: ${teamB_score}`);
        navigate(`/view-tournament/${result.tournament_id}`);
      } else {
        alert("Error updating match result");
      }
    } catch (error) {
      console.error("Error:", error);
      alert("Error updating match result");
    }
  };
  
  

  return (
    <div className="end-match">
      <nav className="navbar">
        <div className="logo-container">
          <img src="/logo.png"alt="Score It Logo" className="end-logo" />
        </div>
        <ul className="nav-links">
          <li><Link to ="/organizer">Home</Link></li>
          <li><Link to ="/game">Game</Link></li>
          <li><Link to="/view-tournament/:id">Tournaments</Link></li>
          <li><Link to="/about">About Us</Link></li>
          <li><Link to="/contact">Contact</Link></li>
          <li><Link to="/account">Account</Link></li>
        </ul>
      </nav>
      <h1 className="title">END MATCH</h1>
      <div className="match-box">
        <button 
          className={`win-button ${winner === teamA ? "selected" : ""}`}
          onClick={() => setWinner(teamA)}
        >
          {teamA} Win
        </button>
        <button 
          className={`win-button ${winner === teamB ? "selected" : ""}`}
          onClick={() => setWinner(teamB)}
        >
          {teamB} Win
        </button>
      </div>
      <button 
        className="submit-button"
        onClick={handleEndMatch}
      >
        Submit Result
      </button>
    </div>
  );
};

export default EndMatch;
