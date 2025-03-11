import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import "../styles/SignupPage.css";

function SignupPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('viewer'); // Default role: viewer
  const navigate = useNavigate();

  const handleSignup = async () => {
    console.log('Submitting signup data:', { name, email, password, role });
    const response = await fetch('http://localhost:5000/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password, role }),
    });

    const data = await response.json();
    console.log('Signup response:', data);
    if (data.success) {
      alert('Signup successful! Please log in.');
      navigate('/login');
    } else {
      if (data.error === 'Email already exists') {
        alert('Signup failed: This email is already registered.');
      } else if (data.error === 'All fields are required') {
        alert('Signup failed: Please fill in all the required fields.');
      } else {
        alert(`Signup failed: ${data.error}`);
      }
    }
  };

  return (
    <div className='signup-container'>
    <img src="/Logo.png" alt="24 Score It Logo" className="signup-logo" />
    <form className="signup-form">
      <label>Full Name:<input
        type="text"
        placeholder="Full Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
      /></label>
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
      <label>User<select value={role} onChange={(e) => setRole(e.target.value)}>
        <option value="viewer">Viewer</option>
        <option value="organizer">Organizer</option>
      </select></label>
      <button className='signup-btn' type='button' onClick={handleSignup}>Signup</button>
      </form>
    </div>
  );
}

export default SignupPage;
