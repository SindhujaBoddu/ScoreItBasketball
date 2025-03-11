import React, { useState, useEffect } from 'react';
import { useNavigate ,Link} from 'react-router-dom';
import "../styles/ManageTournament.css";

function ManageTournament() {
  const navigate = useNavigate();
  const [tournaments, setTournaments] = useState([]);
  const [playoffStages, setPlayoffStages] = useState({});
const [pointsTables, setPointsTables] = useState({});
const [winners, setWinners] = useState({});

  // ✅ Fetch all tournaments when component loads
  useEffect(() => {
    fetchTournaments();
  }, []);

  // ✅ Function to fetch tournaments from API
  const fetchTournaments = async () => {
    try {
        const res = await fetch('http://localhost:5000/api/tournament');
        const data = await res.json();

        if (!Array.isArray(data)) {
            console.error("Unexpected API response format:", data);
            return;
        }

        setTournaments(data);

        const stages = {};
        const tables = {};
        const winnersData = {};

        for (const tournament of data) {
            // Fetch the playoff stage (to check if the final match is completed)
            const stageRes = await fetch(`http://localhost:5000/api/tournament/${tournament.id}/playoff-stage`);
            const stageData = await stageRes.json();
            stages[tournament.id] = stageData.stage;

            // Fetch the points table
            const tableRes = await fetch(`http://localhost:5000/api/tournament/${tournament.id}/points-table`);
            const tableData = await tableRes.json();
            tables[tournament.id] = tableData;

            // Determine the winner (team with the highest points)
            if (stageData.stage === 3 && tableData.length > 0) {
                winnersData[tournament.id] = tableData[0].team_name;
            }
        }

        setPlayoffStages(stages);
        setPointsTables(tables);
        setWinners(winnersData);

    } catch (error) {
        console.error('Error fetching tournaments:', error);
    }
};


  // ✅ Handle Tournament Deletion
  const handleDelete = async (tournamentId) => {
    const confirmDelete = window.confirm('Are you sure you want to delete this tournament?');
    if (confirmDelete) {
      const response = await fetch(`http://localhost:5000/tournament/${tournamentId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        alert('Tournament deleted successfully!');
        fetchTournaments(); // ✅ Refresh list after deletion
      } else {
        const data = await response.json();
        alert(`Failed to delete tournament: ${data.error}`);
      }
    }
  };

  // ✅ Navigate to ViewTournament Page
  const handleViewTournament = (tournamentId) => {
    navigate(`/view-tournament/${tournamentId}`);
  };

  return (
    <div className="container">
      <nav className="navbar">
        <img src="/logo.png" alt="Logo" className="manage-logo" />
        <ul className="nav-links">
        <li><Link to ="/organizer">Home</Link></li> 
          <li><Link to ="/game">Game</Link></li>
          <li><Link to="/tournament">Tournaments</Link></li>
          <li><Link to="/about">About Us</Link></li>
          <li><Link to="/contact">Contact</Link></li>
          <li><Link to="/account">Account</Link></li>
        </ul>
      </nav>

      <h5 className='title'>All Tournaments</h5>

      <ul>
        {tournaments.length === 0 ? (
          <p>No tournaments available.</p>
        ) : (
          tournaments.map((tournament, index) => (
            <div className='tournament-list' key={tournament.id || index}>
              <div className='tournament-item'>
                <span>{tournament.name} ({tournament.type}) - Teams: {tournament.number_of_teams}</span>

                {playoffStages[tournament.id] === 3 ? ( 
                  // 🎉 Tournament Completed: Show Winner & Points Table
                  <div className="completed-tournament">
                    <h4>🏆 Winner: {winners[tournament.id]}</h4>
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
                        {pointsTables[tournament.id]?.map((team, idx) => (
                          <tr key={idx}>
                            <td>{team.team_name}</td>
                            <td>{team.games_played}</td>
                            <td>{team.wins}</td>
                            <td>{team.losses}</td>
                            <td>{team.points}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  // 🚀 Tournament Ongoing: Show "View" button
                  <div className='buttons'>
                    <button onClick={() => handleViewTournament(tournament.id)} className="view-btn">View</button>
                    <button onClick={() => handleDelete(tournament.id)} className="delete-btn">Delete</button>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </ul>
    </div>
);

}

export default ManageTournament;
