import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Auth.css';

const ConfirmRegistration = () => {
  const location = useLocation();
  const [username, setUsername] = useState(location.state?.username || '');
  const [confirmationCode, setConfirmationCode] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const { confirm } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    const result = await confirm(username, confirmationCode);

    if (result.success) {
      setSuccess(result.message);
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } else {
      setError(result.error);
    }

    setLoading(false);
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>Confirm Your Email</h2>
        <p className="info-text">
          Please check your email for the confirmation code.
        </p>

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
            <label htmlFor="confirmationCode">Confirmation Code</label>
            <input
              type="text"
              id="confirmationCode"
              value={confirmationCode}
              onChange={(e) => setConfirmationCode(e.target.value)}
              required
              placeholder="Enter the code from your email"
            />
          </div>

          {error && <div className="error-message">{error}</div>}
          {success && <div className="success-message">{success}</div>}

          <button type="submit" disabled={loading} className="btn-primary">
            {loading ? 'Confirming...' : 'Confirm Email'}
          </button>
        </form>

        <div className="auth-links">
          <p>
            Already confirmed? <Link to="/login">Login here</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ConfirmRegistration;

