import React, { useState, useEffect } from "react";
import { useParams,useNavigate,Link} from "react-router-dom";
import { io } from "socket.io-client";
import "../styles/LiveMatch.css";

const LiveMatch = () => {
  const { matchId } = useParams();
  const [match, setMatch] = useState(null);
  const [loading, setLoading] = useState(true);
  const [scoreA, setScoreA] = useState(0);
  const [scoreB, setScoreB] = useState(0);
  const [timeoutsA, setTimeoutsA] = useState(7);
  const [timeoutsB, setTimeoutsB] = useState(7);
  const [mainTimer, setMainTimer] = useState(600);
  const [secondTimer, setSecondTimer] = useState(120);
  const [isMainRunning, setIsMainRunning] = useState(false);
  const [isSecondRunning, setIsSecondRunning] = useState(false);
  const [players, setPlayers] = useState([]);
  const [teams,setTeams]=useState([]);
  const [fouls, setFouls] = useState({});
  const navigate=useNavigate();
  const socket = io("http://localhost:5000", {
    transports: ["websocket","polling"],
    reconnection: true,
    reconnectionAttempts: 10,
    reconnectionDelay: 2000
  });
  const getTeamById = (teamId) => {
    const team = teams.find(team => team.id === teamId);
    return team ? team.teamName : "Unknown Team";
  };
  useEffect(() => {
    if (localStorage.getItem("resetMatch") === "true") {
      setPlayers([]);  // Clear old player scores
      localStorage.removeItem("resetMatch");  // Remove flag
  }
    const fetchMatch = async () => {
      try {
        const response = await fetch(`http://localhost:5000/api/matches/${matchId}`);
        
        if (!response.ok) {
          console.error(`❌ API Error: ${response.status}`);
          const errorText = await response.text();
          throw new Error(`API request failed: ${errorText}`);
        }
    
        const data = await response.json();
        console.log("✅ Fetched match data:", data);
    
        if (!data.match) {
          console.warn("⚠️ No match data received");
          throw new Error("Match not found");
        }
    
        setMatch(data.match);
        setScoreA(data.match.scoreA || 0);
        setScoreB(data.match.scoreB || 0);
        setTimeoutsA(data.match.timeoutsA ?? 7);
        setTimeoutsB(data.match.timeoutsB ?? 7);
        setPlayers(Array.isArray(data.players) ? data.players.map(player => ({ ...player, score: 0 })) : []);
        
        setFouls(data.players.reduce((acc, player) => ({ ...acc, [player.id]: player.fouls || 0 }), {}));
      } catch (err) {
        console.error("❌ Error fetching match:", err);
        setMatch(null);
      } finally {
        setLoading(false);
      }
    };
    const fetchTeams = async () => {
      try {
        const response = await fetch(`http://localhost:5000/api/tournament/${matchId}/teams`);
        if (!response.ok) throw new Error("Failed to fetch teams");
        const data = await response.json();
        setTeams(data);  // ✅ Ensure teams are set correctly
      } catch (err) {
        console.error("Error fetching teams:", err);
      }
    };
    fetchMatch();
    fetchTeams();
    socket.on("connect", () => {
      console.log("✅ WebSocket Connected!");
    });

    socket.on("disconnect", () => {
      console.warn("❌ WebSocket Disconnected!");
    });

    // Listen for match updates
    socket.on("updateMatch", (updatedMatch) => {
      setMatch(updatedMatch);
      setScoreA(updatedMatch.scoreA || 0);
      setScoreB(updatedMatch.scoreB || 0);
    });

    // Listen for player updates
    socket.on("updatePlayers", (updatedPlayers) => {
      console.log("🔄 Players Updated:", updatedPlayers);
      setPlayers(updatedPlayers);
    });
    socket.on("playerFoulUpdated", (data) => {
      console.log(`✅ Foul updated for Player: ${data.playerId}, New Fouls: ${data.fouls}`);
      
      // Correctly updating the fouls state in the frontend
      setFouls(prevFouls => ({
        ...prevFouls,
        [data.playerId]: data.fouls,
      }));
    });
    return () => {
      socket.off("updateMatch");
      socket.off("updatePlayers");
      socket.off("connect");
      socket.off("disconnect");
      socket.disconnect();
    };
  }, [matchId]);
  const updatePlayerScore = async (playerId, points) => {
    try {
        const response = await fetch(`http://localhost:5000/api/players/${playerId}/score`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ points }),
        });

        if (response.ok) {
            const updatedPlayer = players.find(player => player.id === playerId);
            if (!updatedPlayer) return;

            const playerTeam = updatedPlayer.teamName;
            const isHomeTeam = match.home_team === playerTeam;
            const isAwayTeam = match.away_team === playerTeam;

            setPlayers(prevPlayers =>
                prevPlayers.map(player =>
                    player.id === playerId ? { ...player, score: (player.score || 0) + points } : player
                )
            );

            if (isHomeTeam) {
                setScoreA(prevScore => prevScore + points);
            } else if (isAwayTeam) {
                setScoreB(prevScore => prevScore + points);
            }

            // ✅ Emit the entire match object to ensure updates sync correctly
            const updatedMatch = {
                ...match,
                scoreA: isHomeTeam ? scoreA + points : scoreA,
                scoreB: isAwayTeam ? scoreB + points : scoreB,
                players: players.map(player =>
                    player.id === playerId ? { ...player, score: (player.score || 0) + points } : player
                ),
            };

            socket.emit("updateMatch", updatedMatch);
        }
    } catch (err) {
        console.error("Error updating player score:", err);
    }
};

  const handleFoul = async (playerId) => {
    try {
      const player = players.find(player => player.id === playerId);
      if (!player) {
        console.error("❌ Player not found!");
        return;
      }
  
      const playerTeamName = player.teamName;
      const isHomeTeam = match.home_team === playerTeamName;
      const isAwayTeam = match.away_team === playerTeamName;
  
      const response = await fetch(`http://localhost:5000/api/players/${playerId}/foul`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
      });
  
      if (response.ok) {
        const data = await response.json();
  
        setFouls(prevFouls => ({
          ...prevFouls,
          [playerId]: data.player.fouls,
        }));
  
        // ✅ Correctly emit event with proper team identification
        socket.emit("updateFoul", {
          playerId,
          team: isHomeTeam ? "home" : "away",
          fouls: data.player.fouls,
        });
      }
    } catch (err) {
      console.error("❌ Error updating foul:", err);
    }
  };
  const handleTimeout = (teamType) => {
    if (teamType === "home_team" && timeoutsA > 0) {
      setTimeoutsA(prev => prev - 1);
      socket.emit("updateTimeout", { matchId, timeoutsA: timeoutsA - 1, timeoutsB });
    } else if (teamType === "away_team" && timeoutsB > 0) {
      setTimeoutsB(prev => prev - 1);
      socket.emit("updateTimeout", { matchId, timeoutsA, timeoutsB: timeoutsB - 1 });
    }
  };
  useEffect(() => {
    let interval;
    if (isMainRunning && mainTimer > 0) {
      interval = setInterval(() => {
        setMainTimer(prev => {
          const newTime = prev - 1;
          socket.emit("updateMainTimer", newTime); // ✅ Emit timer update
          return newTime;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isMainRunning]);
  
  useEffect(() => {
    let interval;
    if (isSecondRunning && secondTimer > 0) {
      interval = setInterval(() => {
        setSecondTimer(prev => {
          const newTime = prev - 1;
          socket.emit("updateSecondTimer", newTime); // ✅ Emit timer update
          return newTime;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isSecondRunning]);

  const formatTime = (seconds) => {
    const min = Math.floor(seconds / 60);
    const sec = seconds % 60;
    return `${String(min).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
  };
  useEffect(() => {
    socket.on("connect", () => console.log("✅ Connected to WebSocket"));
    socket.on("disconnect", () => console.warn("❌ WebSocket Disconnected"));
    return () => {
      socket.off("connect");
      socket.off("disconnect");
    };
  }, []);
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
        <li><Link to ="/organizer">Home</Link></li> 
          <li><Link to ="/game">Game</Link></li>
          <li><Link to="/view-tournament/:id">Tournaments</Link></li>
          <li><Link to="/about">About Us</Link></li>
          <li><Link to="/contact">Contact</Link></li>
          <li><Link to="/account">Account</Link></li>
        </ul>
      </nav>

      <h1 className="match-title">{match.home_team} vs {match.away_team}</h1>
      <h2 className="match-score">Match Score</h2>

      <div className="timer-section">
        <div className="timer-box">
          <div className="time-display">{formatTime(mainTimer)}</div>
          <div className="controls">
            <button onClick={() => setIsMainRunning(true)}>Start</button>
            <button onClick={() => setIsMainRunning(false)}>Stop</button>
            <button onClick={() => setMainTimer(600)}>Reset</button>
          </div>
        </div>
        <div className="timer-box">
          <div className="time-display">{formatTime(secondTimer)}</div>
          <div className="controls">
            <button onClick={() => setIsSecondRunning(true)}>Start</button>
            <button onClick={() => setIsSecondRunning(false)}>Stop</button>
            <button onClick={() => setSecondTimer(120)}>Reset</button>
          </div>
        </div>
      </div>

      <div className="team-section">
        {["home_team", "away_team"].map((teamType, index) => (
          <div key={index} className="team-box">
            <h3>{teamType === "home_team" ? match.home_team : match.away_team}</h3>
            <div className="score">{teamType === "home_team" ? scoreA : scoreB}</div>
            <div className="timeouts">
              <p>Timeouts</p>
              <button 
  className="timeout-box" 
  onClick={() => handleTimeout(teamType)}
  disabled={teamType === "home_team" ? timeoutsA <= 0 : timeoutsB <= 0}
>
  {teamType === "home_team" ? timeoutsA : timeoutsB}
</button>

            </div>
            <div className="fouls">
  <p>Fouls:</p>
  <div className="foul-box">
    {teamType === "home_team"
      ? players.filter(p => p.teamName === match.home_team)
               .reduce((sum, p) => sum + (fouls[p.id] || 0), 0)
      : players.filter(p => p.teamName === match.away_team)
               .reduce((sum, p) => sum + (fouls[p.id] || 0), 0)}
  </div>
</div>
            <h4>Players:</h4>
            <ul className="player-list">
            {players
    .filter(player => 
      (teamType === "home_team" && match.home_team === player.teamName) ||
      (teamType === "away_team" && match.away_team === player.teamName)
    ).map(player => (
                  <li key={player.id} className="player-row">
                    <span className="player-name">{player.playerName}</span>
                    <span className="score-box">{player.score}</span>
                    <div className="player-buttons">
                      <button onClick={() => updatePlayerScore(player.id, 3)}>+3</button>
                      <button onClick={() => updatePlayerScore(player.id, 2)}>+2</button>
                      <button onClick={() => updatePlayerScore(player.id, 1)}>+1</button>
                      <button onClick={() => handleFoul(player.id)} className="btn red">F</button>
                    </div>
                  </li>
                ))}
            </ul>
          </div>
        ))}
      </div>
      <button 
  className="end-match-btn"
  onClick={() => navigate(`/end-match/${match.home_team}/${match.away_team}/${scoreA}/${scoreB}`)}
>
  End Match
</button>
    </div>
  );
};

export default LiveMatch;