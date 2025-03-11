import React, { useState, useEffect } from 'react';
import { useParams, useNavigate,Link } from 'react-router-dom';
import "../styles/ViewTournament.css";

function ViewTournament() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [tournament, setTournament] = useState(null);
    const [matches, setMatches] = useState([]);
    const [playoffMatches, setPlayoffMatches] = useState([]);
    const [pointsTable, setPointsTable] = useState([]);
    const [playoffStage, setPlayoffStage] = useState(0);
    const [allMatchesCompleted, setAllMatchesCompleted] = useState(false);

    useEffect(() => {
        async function fetchData() {
            await fetchTournamentDetails();
            await fetchMatches();
            await fetchPointsTable();
            await fetchPlayoffStage();
        }
        fetchData();
    }, [id]);
    useEffect(() => {
        if (matches.length > 0) {
            const allNormalCompleted = matches.every(match => match.status === "completed");
            setAllMatchesCompleted(allNormalCompleted);
        }
    }, [matches]);

    useEffect(() => {
        console.log("Updated All Matches Completed:", allMatchesCompleted);
    }, [allMatchesCompleted]);

    const fetchTournamentDetails = async () => {
        try {
            const res = await fetch(`http://localhost:5000/tournament/${id}`);
            const data = await res.json();
            if (data?.id) {
                setTournament(data);
            }
        } catch (error) {
            console.error('Error fetching tournament details:', error);
        }
    };
    useEffect(() => {
        async function fetchPlayoffMatches() {
            try {
                const response = await fetch(`http://localhost:5000/api/tournament/${id}/playoff-matches`);
                if (!response.ok) throw new Error("Failed to fetch playoff matches");

                const data = await response.json();
                setPlayoffMatches(data);
            } catch (error) {
                console.error("Error fetching playoff matches:", error);
            }
        }

        fetchPlayoffMatches();
    }, [id]);
    const fetchMatches = async () => {
        try {
            const res = await fetch(`http://localhost:5000/api/tournament/${id}/matches`);
            const data = await res.json();
            if (!Array.isArray(data)) return;
    
            // 🏀 Separate Normal Matches & Playoffs
            const normalMatches = data.filter(match => 
                !match.round.includes("Semifinal") && !match.round.includes("Final")
            );
    
            let playoffMatches = data.filter(match => 
                match.round.includes("Semifinal") || match.round.includes("Final")
            );
    
            // 🏀 Ensure Correct Semifinal-1 (2 Matches) & Semifinal-2 (1 Match)
            let semifinal1Matches = playoffMatches.filter(match => match.round === "Semifinal-1");
            let semifinal2Match = playoffMatches.find(match => match.round === "Semifinal-2");
            let finalMatch = playoffMatches.find(match => match.round.includes("Final")) || null;

            const structuredPlayoffMatches = [...semifinal1Matches, semifinal2Match, finalMatch].filter(Boolean);

            setMatches(normalMatches);
            setPlayoffMatches(structuredPlayoffMatches);
    
            // ✅ Check if all normal matches are completed
            const allNormalCompleted = normalMatches.length > 0 && normalMatches.every(match => match.status === "completed");
            setAllMatchesCompleted(allNormalCompleted);

            // ✅ Determine Playoff Stage
            if (finalMatch && finalMatch.status === "completed") {
                setPlayoffStage(3); // Playoffs completed
            } else if (semifinal1Matches.length === 2 && semifinal1Matches.every(match => match.status === "completed") 
                && semifinal2Match && semifinal2Match.status === "completed") {
                setPlayoffStage(2); // Ready for Final
            } else if (semifinal1Matches.length === 2 && semifinal1Matches.every(match => match.status === "completed")) {
                setPlayoffStage(1); // Ready for Semifinal-2
            } else {
                setPlayoffStage(0); // Start with Semifinal-1
            }
            fetchPointsTable();
        } catch (error) {
            console.error('Error fetching matches:', error);
        }
    };

    const fetchPointsTable = async () => {
        try {
            const res = await fetch(`http://localhost:5000/api/tournament/${id}/points-table`);
            const data = await res.json();
            if (Array.isArray(data) && data.length > 0) {
                const sortedData = data.sort((a, b) => b.points - a.points || b.point_difference - a.point_difference);
                setPointsTable(sortedData);
            } else {
                setPointsTable([]); // Ensure an empty array if no data
            }
        } catch (error) {
            console.error('Error fetching points table:', error);
        }
    };

    const fetchPlayoffStage = async () => {
        try {
            const res = await fetch(`http://localhost:5000/api/tournament/${id}/playoff-stage`);
            const data = await res.json();
            setPlayoffStage(data.stage);
        } catch (error) {
            console.error('Error fetching playoff stage:', error);
        }
    };

    const deleteMatch = async (matchId) => {
        try {
            await fetch(`http://localhost:5000/api/matches/${matchId}`, { method: 'DELETE' });
            fetchMatches();
        } catch (error) {
            console.error('Error deleting match:', error);
        }
    };
    const isButtonDisabled = () => {
        if (playoffStage === 0) {
            // Disable if normal matches are not fully completed
            return matches.some(match => match.status !== "completed");
        } 
        if (playoffStage === 1) {
            // Disable if Semifinal-1 is not completed
            return playoffMatches.some(match => match.round === "Semifinal-1" && match.status !== "completed");
        } 
        if (playoffStage === 2) {
            // Disable if Semifinal-2 is not completed
            return playoffMatches.some(match => match.round === "Semifinal-2" && match.status !== "completed");
        } 
        if (playoffStage === 3) {
            // Disable if Final is not completed
            return playoffMatches.some(match => match.round === "Final" && match.status !== "completed");
        } 
        return false; // Enable by default
    };
    return (
        <div className="container1">
            <nav className="navbar">
                    <div className="logo-container">
                      <img src="/Logo.png" alt="Score It Logo" className="tour-logo" />
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
            <h2>{tournament?.name} ({tournament?.type})</h2>

            <h3>Scheduled Matches</h3>
            {matches.length > 0 ? matches.map((match, index) => (
                <div key={index} className="match-card">
                    <h3>{match.home_team} vs {match.away_team}</h3>
                    <p>Date: {new Date(match.time).toLocaleString()}</p>
                    <p>Status: {match.status}</p>
                    {match.status === 'scheduled' && (
                        <div className='buttons'>
                            <button onClick={() => navigate(`/live-match/${match.id}`)} className="start-btn">Start</button>
                            <button onClick={() => deleteMatch(match.id)} className="delete-btn">Delete</button>
                        </div>
                    )}
                    {match.status === 'completed' && (
                        <p className='match-result'>
                            🏆 Winner: {match.winner} <br />
                            Score: {match.home_team} = {match.scoreA} ---- {match.away_team} = {match.scoreB}
                        </p>
                    )}
                </div>
            )) : <p>No scheduled matches available.</p>}

            <h2>Playoffs</h2>
            <button 
    className="playoff-btn" 
    onClick={() => navigate(`/playoffs/${id}`)}
    disabled={isButtonDisabled()}
>
    {playoffStage === 0 ? "Proceed to Playoffs" :
     playoffStage === 1 ? "Schedule Semifinal-2" :
     "Schedule Final"}
</button>

{playoffMatches.length > 0 ? (
    <div>
        {["Semifinal-1", "Semifinal-2", "Final"].map((round) => (
            <div key={round}>
                <h4>{round}</h4>
                <div className="match-container">
                    {playoffMatches
                        .filter((match) => match.round === round)
                        .map((match, index) => (
                            
                            <div key={index} className="match-card">
                                <h3>{match.home_team} vs {match.away_team}</h3>
                                
                                <p>Status: {match.status}</p>

                                {match.status === 'scheduled' && (
                                    <div className='buttons'>
                                        <button onClick={() => navigate(`/live-match/${match.id}`)} className="start-btn">Start</button>
                                        <button onClick={() => deleteMatch(match.id)} className="delete-btn">Delete</button>
                                    </div>
                                )}

                                {match.status === 'completed' && (
                                    <p className='match-result'>
                                        🏆 Winner: {match.winner} <br />
                                        Score: {match.home_team} = {match.scoreA} ---- {match.away_team} = {match.scoreB}
                                    </p>
                                )}
                            </div>
                        ))}
                </div>
            </div>
        ))}
    </div>
) : (
    <p>No playoff matches scheduled yet.</p>
)}

            <h3>Points Table</h3>
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
                <td>{team.wins}</td>
            </tr>
        ))
    ) : (
        <tr>
            <td colSpan="5">No points data available</td>
        </tr>
    )}
</tbody>

            </table>
        </div>
    );
}

export default ViewTournament;
