import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import "../styles/LoginPage.css";

function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleLogin = async () => {
    try {
      const response = await fetch('http://localhost:5000/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (data.success) {
        // Check user role and redirect accordingly
        if (data.role === 'organizer') {
          navigate('/organizer'); // Redirect to organizer dashboard
        } else if (data.role === 'viewer') {
          navigate('/viewer'); // Redirect to viewer dashboard
        }
      } else {
        alert('Login failed: ' + data.message);
      }
    } catch (error) {
      console.error('Error during login:', error);
      alert('An error occurred. Please try again.');
    }
  };

  return (
    <div className='login-container'>
    <img src="/Logo.png" alt="24 Score It Logo" className="login-logo" />
    <form className='login-form'>
     <label>Email:<input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      /></label>
      <label>Password:<input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      /></label>
      <button className='login-btn' type='button' onClick={handleLogin}>Login</button>
      </form>
    </div>
  );
}

export default LoginPage;
