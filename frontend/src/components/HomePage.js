import React from 'react';
import { Link } from 'react-router-dom';
import "../styles/HomePage.css";

function HomePage() {
  const isLoggedIn = false; // Replace with actual auth state
  const userRole = ''; // Replace with user's role from backend (organizer/viewer)

  return (
    <div className="Box">
    <img src="/Logo.png" alt="24 Score It Logo" className="home-logo"/>

      {!isLoggedIn ? (
        <div className="buttons">
          <Link to="/login"><button className="btn login">Login</button></Link>
          <Link to="/signup"><button className="btn signup">Signup</button></Link>
        </div>
      ) : userRole === 'organizer' ? (
        <div className="organizer-dashboard">
          <Link to="/create-tournament"><button>Create Tournament</button></Link>
          <Link to="/manage-tournaments"><button>Manage Tournaments</button></Link>
        </div>
      ) : (
        <div className="viewer-dashboard">
          <h2>Ongoing Tournaments</h2>
          {/* Replace with mapped data from API */}
          <div>Loading tournaments...</div>
        </div>
      )}
    </div>
  );
}

export default HomePage;
