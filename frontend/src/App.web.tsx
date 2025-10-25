import React, { useState } from 'react';
import './App.css';

const App = () => {
  const [user, setUser] = useState(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [isLogin, setIsLogin] = useState(true);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const endpoint = isLogin ? '/api/auth/login' : '/api/auth/register';
    const body = isLogin ? { email, password } : { email, password, name };
    
    try {
      const response = await fetch(`http://localhost:3002${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setUser(data.user);
        alert(`${isLogin ? 'Login' : 'Registration'} successful!`);
      } else {
        alert(data.error || 'Authentication failed');
      }
    } catch (error) {
      alert('Network error. Make sure backend is running on port 3002');
    }
  };

  if (user) {
    return (
      <div className="app">
        <header className="header">
          <h1>SLD App</h1>
          <button onClick={() => setUser(null)}>Logout</button>
        </header>
        <main className="main">
          <h2>Welcome, {user.name}!</h2>
          <p>✅ Authentication working</p>
          <p>✅ Backend connected</p>
          <p>📱 Mobile app features available in React Native version</p>
        </main>
      </div>
    );
  }

  return (
    <div className="app">
      <header className="header">
        <h1>SLD App - Web Demo</h1>
      </header>
      <main className="main">
        <form onSubmit={handleAuth} className="form">
          <h2>{isLogin ? 'Login' : 'Register'}</h2>
          
          {!isLogin && (
            <input
              type="text"
              placeholder="Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          )}
          
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          
          <button type="submit">
            {isLogin ? 'Login' : 'Register'}
          </button>
          
          <button type="button" onClick={() => setIsLogin(!isLogin)}>
            Switch to {isLogin ? 'Register' : 'Login'}
          </button>
        </form>
      </main>
    </div>
  );
};

export default App;