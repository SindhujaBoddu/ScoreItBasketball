import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { io } from "socket.io-client";

const Match = () => {
  const { matchId } = useParams();
  const [match, setMatch] = useState(null);
  const [loading, setLoading] = useState(true);
  const [scoreA, setScoreA] = useState(0);
  const [scoreB, setScoreB] = useState(0);
  const [players, setPlayers] = useState([]);
  const [fouls, setFouls] = useState({});
  const [mainTimer, setMainTimer] = useState(600); // Default 10 minutes
  const [secondTimer, setSecondTimer] = useState(120); // Default 2 minutes
  const socket = io("http://localhost:5000", {
    transports: ["websocket", "polling"],
    reconnection: true,
    reconnectionAttempts: 10,
    reconnectionDelay: 2000,
  });

  useEffect(() => {
    const fetchMatch = async () => {
      try {
        setScoreA(0);  // Reset scores before fetching new match
        setScoreB(0);

        const response = await fetch(`http://localhost:5000/api/matches/${matchId}`);
        if (!response.ok) throw new Error("Failed to fetch match data");

        const data = await response.json();
        if (!data.match) throw new Error("Match not found");

        setMatch(data.match);
        const newScoreA = data.players
      .filter(player => player.teamName === data.match.home_team)
      .reduce((sum, player) => sum + (player.score || 0), 0);

    const newScoreB = data.players
      .filter(player => player.teamName === data.match.away_team)
      .reduce((sum, player) => sum + (player.score || 0), 0);

    setScoreA(newScoreA);
    setScoreB(newScoreB);
        setPlayers(data.players||[]);
        setFouls(data.players.reduce((acc, player) => ({ ...acc, [player.id]: player.fouls || 0 }), {}));
      } catch (err) {
        console.error("Error fetching match:", err);
        setMatch(null);
      } finally {
        setLoading(false);
      }
    };

    fetchMatch();
    socket.off("updateMatch");
  socket.off("updatePlayers");

    // ✅ Listen for live match updates
    socket.on("updateMatch", (updatedMatch) => {
      if (!updatedMatch || updatedMatch.matchId !== matchId) return; // Ensure correct match
    
      setMatch(updatedMatch);
    
      const newScoreA = updatedMatch.players
        .filter(player => player.teamName === updatedMatch.home_team)
        .reduce((sum, player) => sum + (player.score || 0), 0);
    
      const newScoreB = updatedMatch.players
        .filter(player => player.teamName === updatedMatch.away_team)
        .reduce((sum, player) => sum + (player.score || 0), 0);
    
      setScoreA(newScoreA);
      setScoreB(newScoreB);
    });
    
    
    
    
    
    

    socket.on("updatePlayers", (updatedPlayers) => {
      setPlayers(updatedPlayers);
    
      // 🔹 Recalculate team scores from the updated players list
      const newScoreA = updatedPlayers
        .filter(player => player.teamName === match.home_team)
        .reduce((sum, player) => sum + (player.score || 0), 0);
    
      const newScoreB = updatedPlayers
        .filter(player => player.teamName === match.away_team)
        .reduce((sum, player) => sum + (player.score || 0), 0);
    
      setScoreA(newScoreA);
      setScoreB(newScoreB);
    });
    

    socket.on("playerFoulUpdated", (data) => {
      setFouls((prevFouls) => ({ ...prevFouls, [data.playerId]: data.fouls }));
    });

    // ✅ Listen for timer updates
    socket.on("updateMainTimer", (newTime) => {
      console.log("🔄 Timer Updated (Main):", newTime);
      setMainTimer(newTime);
    });

    socket.on("updateSecondTimer", (newTime) => {
      console.log("🔄 Timer Updated (Second):", newTime);
      setSecondTimer(newTime);
    });
    socket.on("connect", () => console.log("✅ Connected to WebSocket"));
    socket.on("disconnect", () => console.warn("❌ WebSocket Disconnected"));
    return () => {
      socket.off("updateMatch");
      socket.off("updatePlayers");
      socket.off("playerFoulUpdated");
      socket.off("updateMainTimer");
      socket.off("updateSecondTimer");
      socket.disconnect();
    };
  }, [matchId]);

  const formatTime = (seconds) => {
    const min = Math.floor(seconds / 60);
    const sec = seconds % 60;
    return `${String(min).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
  };

  if (loading) return <p>Loading match data...</p>;
  if (!match) return <p>No match found!</p>;

  return (
    <div className="scoreboard-container">
      <nav className="navbar">
        <div className="logo">
          <span className="logo-box">24</span>
          <span className="logo-text">Score It</span>
        </div>
        <ul>
          <li>Home</li>
          <li>Game</li>
          <li>Tournaments</li>
          <li>About Us</li>
          <li>Contact</li>
          <li>Account</li>
        </ul>
      </nav>

      <h1 className="match-title">{match.home_team} vs {match.away_team}</h1>
      <h2 className="match-score">Match Score</h2>

      {/* ✅ Timer Display (Only Viewable) */}
      <div className="timer-section">
        <div className="timer-box">
          <p>Main Timer</p>
          <div className="time-display">{formatTime(mainTimer)}</div>
        </div>
        <div className="timer-box">
          <p>Secondary Timer</p>
          <div className="time-display">{formatTime(secondTimer)}</div>
        </div>
      </div>

      <div className="team-section">
        {["home_team", "away_team"].map((teamType, index) => (
          <div key={index} className="team-box">
            <h3>{teamType === "home_team" ? match.home_team : match.away_team}</h3>
            <div className="score">{teamType === "home_team" ? scoreA : scoreB}</div>
            <h4>Players:</h4>
            <ul className="player-list">
              {players
                .filter(player =>
                  (teamType === "home_team" && match.home_team === player.teamName) ||
                  (teamType === "away_team" && match.away_team === player.teamName)
                )
                .map(player => (
                  <li key={player.id} className="player-row">
                    <span className="player-name">{player.playerName}</span>
                    <span className="score-box">{player.score}</span>
                    <span className="foul-count"> Fouls: {fouls[player.id] || 0}</span>
                  </li>
                ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Match;
