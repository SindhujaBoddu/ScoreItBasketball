import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

function Playoffs() {
    const { tournamentId } = useParams();
    const navigate = useNavigate();
    const [topTeams, setTopTeams] = useState([]);
    const [matches, setMatches] = useState([]);
    const [playoffStage, setPlayoffStage] = useState(0);
    const [selectedHome,setSelectedHome]=useState("");
    const [selectedAway,setSelectedAway]=useState("");
    const [matchDate, setMatchDate] = useState("");
    const [matchTime, setMatchTime] = useState("");

    useEffect(() => {
        async function fetchData() {
            await fetchMatches();
            await fetchTopTeams();
            await fetchPlayoffStage();
        }
        fetchData();
    }, [tournamentId]);

    // ✅ Fetch Top Teams Based on Playoff Progress
    const fetchTopTeams = async () => {
        try {
            const response = await fetch(`http://localhost:5000/api/tournament/${tournamentId}/points-table`);
            if (!response.ok) throw new Error("Failed to fetch points table");

            const data = await response.json();
            if (!Array.isArray(data) || data.length === 0) {
                setTopTeams([]);
                return;
            }

            let topCount = 4;
            const playoffMatchesResponse = await fetch(`http://localhost:5000/api/tournament/${tournamentId}/matches`);
            const matches = await playoffMatchesResponse.json();

            const semiFinal1 = matches.filter(match => match.round === "Semifinal-1" && match.status === "completed");
            const semiFinal2 = matches.find(match => match.round === "Semifinal-2" && match.status === "completed");

            if (semiFinal1.length === 2 && semiFinal2) {
                topCount = 2;  // Proceed to Final
            } else if (semiFinal1.length === 2) {
                topCount = 3;  // Proceed to Semifinal-2
            }

            const sortedData = data
                .sort((a, b) => b.wins - a.wins || b.point_difference - a.point_difference)
                .slice(0, topCount)
                .map((team, index) => ({ rank: index + 1, name: team.team_name, points: team.wins }));

            setTopTeams(sortedData);
        } catch (error) {
            console.error("❌ Error fetching points table:", error);
        }
    };

    // ✅ Fetch Playoff Matches and Determine Stage
    const fetchMatches = async () => {
        try {
            const response = await fetch(`http://localhost:5000/api/tournament/${tournamentId}/matches`);
            const data = await response.json();
            const playoffMatches = data.filter(match => match.round.includes('Semifinal') || match.round.includes('Final'));

            setMatches(playoffMatches);

            const semiFinal1 = playoffMatches.filter(match => match.round === "Semifinal-1" && match.status === "completed");
            const semiFinal2 = playoffMatches.find(match => match.round === "Semifinal-2" && match.status === "completed");
            const finalMatch = playoffMatches.find(match => match.round === "Final" && match.status === "completed");

            if (finalMatch) {
                setPlayoffStage(3);  // Playoffs completed
            } else if (semiFinal1.length === 2 && semiFinal2) {
                setPlayoffStage(2);  // Ready for Final
            } else if (semiFinal1.length === 2) {
                setPlayoffStage(1);  // Ready for Semifinal-2
            } else {
                setPlayoffStage(0);  // Start with Semifinal-1
            }
        } catch (error) {
            console.error("Error fetching playoff matches:", error);
        }
    };

    // ✅ Fetch Playoff Stage
    const fetchPlayoffStage = async () => {
        try {
            const response = await fetch(`http://localhost:5000/api/tournament/${tournamentId}/playoff-stage`);
            const data = await response.json();
            setPlayoffStage(data.stage);
        } catch (error) {
            console.error("Error fetching playoff stage:", error);
        }
    };
    // ✅ Update Playoff Stage in DB
const updatePlayoffStage = async (newStage) => {
    try {
        await fetch(`http://localhost:5000/api/tournament/${tournamentId}/update-playoff-stage`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ stage: newStage })
        });
        setPlayoffStage(newStage);
    } catch (error) {
        console.error("Error updating playoff stage:", error);
    }
};


    // ✅ Manually Schedule Playoff Matches
    const handleScheduleMatch = async () => {
        if (!selectedHome||!selectedAway) {
            alert("Please select both teams for the match.");
            return;
        }
        if (selectedHome===selectedAway){
            alert("Teams cannot be the same.");
            return;
        }
        if (!matchDate || !matchTime) {
            alert("Please select a valid date and time.");
            return;
        }

        await fetch(`http://localhost:5000/api/tournament/${tournamentId}/schedule-manual-playoff`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                home_team: selectedHome,
                away_team: selectedAway,
                round: playoffStage === 0 ? "Semifinal-1" : playoffStage === 1 ? "Semifinal-2" : "Final",
                match_datetime: `${matchDate}T${matchTime}`
            })
        });

        alert("Matches scheduled successfully!");
        fetchMatches();
        updatePlayoffStage(playoffStage + 1);  // Move to next playoff stage
    };

    // ✅ Generate Match Options for Semifinal-1
    const generateSemifinal1Matches = () => {
        if (topTeams.length < 4) return [];

        return [
            { home_team: topTeams[0].name, away_team: topTeams[3].name, round: "Semifinal-1" },
            { home_team: topTeams[1].name, away_team: topTeams[2].name, round: "Semifinal-1" }
        ];
    };

    return (
        <div className="container">
            <h2>Playoffs</h2>

            <h3>
                {playoffStage === 0 ? "🔥 Top 4 Playoff Teams (Select 2 Matches for Semifinal-1)" :
                playoffStage === 1 ? "🏆 Top 3 Teams for Semifinal-2" :
                "🏆 Final Match - Top 2 Teams"}
            </h3>

            <ul>
                {topTeams.length > 0 ? (
                    topTeams.map(team => (
                        <li key={team.rank}>{team.rank}. {team.name} - {team.points} Points</li>
                    ))
                ) : (
                    <li>No teams available</li>
                )}
            </ul>

            <h3>Select Playoff Match</h3>
            <label>Home Team:</label>
            <select value={selectedHome} onChange={(e) => setSelectedHome(e.target.value)}>
                <option value="">Select Team</option>
                {topTeams.map(team => (
                    <option key={team.name} value={team.name}>{team.name}</option>
                ))}
            </select>

            <label>Away Team:</label>
            <select value={selectedAway} onChange={(e) => setSelectedAway(e.target.value)}>
                <option value="">Select Team</option>
                {topTeams.map(team => (
                    <option key={team.name} value={team.name}>{team.name}</option>
                ))}
            </select>

            <input type="date" value={matchDate} onChange={(e) => setMatchDate(e.target.value)} />
            <input type="time" value={matchTime} onChange={(e) => setMatchTime(e.target.value)} />
            <button onClick={handleScheduleMatch}>Schedule Matches</button><br />
            <button onClick={() => navigate(-1)}>Back</button>
        </div>
    );
}

export default Playoffs;
