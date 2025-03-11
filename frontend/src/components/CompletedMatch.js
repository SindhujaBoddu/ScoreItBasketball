import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';

function CompletedMatch() {
  const { matchId } = useParams();  // Get the match ID from the URL
  const [matchDetails, setMatchDetails] = useState(null);

  useEffect(() => {
    // Fetch the completed match details using matchId
    fetch(`http://localhost:5000/match/${matchId}`)
      .then((res) => res.json())
      .then((data) => setMatchDetails(data))
      .catch((error) => console.error('Error fetching match details:', error));
  }, [matchId]);

  if (!matchDetails) {
    return <div><h2>There are no matches</h2></div>;
  }

  return (
    <div>
      <h2>Completed Match Details</h2>
      <p>{matchDetails.home_team} vs {matchDetails.away_team}</p>
      <p>Status: {matchDetails.status}</p>
      <p>Score: {matchDetails.score}</p>
      <p>Time: {matchDetails.time}</p>
      {/* Add more match details as needed */}
    </div>
  );
}

export default CompletedMatch;
