import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Auth.css';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [challengeState, setChallengeState] = useState(null);

  const { login, completeNewPasswordChallenge } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const result = await login(username, password);

    if (result.success) {
      navigate('/dashboard');
    } else if (result.challenge === 'NEW_PASSWORD_REQUIRED') {
      // User needs to set a new password
      setChallengeState({
        username,
        session: result.session,
      });
      setError('You must set a new password to continue.');
    } else {
      setError(result.error);
    }

    setLoading(false);
  };

  const handleNewPasswordSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validate passwords match
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    // Validate password strength
    if (newPassword.length < 8) {
      setError('Password must be at least 8 characters long');
      return;
    }

    setLoading(true);

    const result = await completeNewPasswordChallenge(
      challengeState.username,
      newPassword,
      challengeState.session
    );

    if (result.success) {
      navigate('/dashboard');
    } else {
      setError(result.error);
    }

    setLoading(false);
  };

  // If in challenge state, show new password form
  if (challengeState) {
    return (
      <div className="auth-container">
        <div className="auth-card">
          <h2>Set New Password</h2>
          <p className="info-message">
            You must set a new password before you can continue.
          </p>
          <form onSubmit={handleNewPasswordSubmit}>
            <div className="form-group">
              <label htmlFor="newPassword">New Password</label>
              <input
                type="password"
                id="newPassword"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                placeholder="Enter new password"
              />
            </div>

            <div className="form-group">
              <label htmlFor="confirmPassword">Confirm Password</label>
              <input
                type="password"
                id="confirmPassword"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                placeholder="Confirm new password"
              />
            </div>

            {error && <div className="error-message">{error}</div>}

            <button type="submit" disabled={loading} className="btn-primary">
              {loading ? 'Setting Password...' : 'Set New Password'}
            </button>

            <button
              type="button"
              onClick={() => {
                setChallengeState(null);
                setError('');
                setNewPassword('');
                setConfirmPassword('');
              }}
              className="btn-secondary"
            >
              Cancel
            </button>
          </form>
        </div>
      </div>
    );
  }

  // Regular login form
  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>Login to Task Tracker</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="username">Username</label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value.toLowerCase())}
              required
              placeholder="Enter your username"
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="Enter your password"
            />
          </div>

          {error && <div className="error-message">{error}</div>}

          <button type="submit" disabled={loading} className="btn-primary">
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <div className="auth-links">
          <p>
            <Link to="/forgot-password">Forgot Password?</Link>
          </p>
          <p>
            Don't have an account? <Link to="/register">Register here</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;

