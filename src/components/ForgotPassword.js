import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import authService from '../api/authService';
import './Auth.css';

const ForgotPassword = () => {
  const [step, setStep] = useState(1); // Step 1: Enter username, Step 2: Enter code and new password
  const [username, setUsername] = useState('');
  const [confirmationCode, setConfirmationCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const navigate = useNavigate();

  // Step 1: Request password reset code
  const handleRequestCode = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = await authService.forgotPassword(username);
      setSuccessMessage(result.message);
      setStep(2);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send reset code. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Confirm password reset with code
  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError('');

    // Validate input
    if (!confirmationCode.trim()) {
      setError('Please enter the confirmation code');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (newPassword.length < 8) {
      setError('Password must be at least 8 characters long');
      return;
    }

    setLoading(true);

    try {
      const result = await authService.confirmForgotPassword(username, confirmationCode, newPassword);
      setSuccessMessage(result.message);
      // Redirect to login after successful password reset
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to reset password. Please check your code and try again.');
    } finally {
      setLoading(false);
    }
  };

  // Step 1: Request code form
  if (step === 1) {
    return (
      <div className="auth-container">
        <div className="auth-card">
          <h2>Reset Password</h2>
          <p className="info-message">
            Enter your username to receive a password reset code via email.
          </p>
          
          {error && <div className="error-message">{error}</div>}
          {successMessage && <div className="success-message">{successMessage}</div>}

          <form onSubmit={handleRequestCode}>
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

            <button type="submit" disabled={loading} className="btn-primary">
              {loading ? 'Sending Code...' : 'Send Reset Code'}
            </button>
          </form>

          <div className="auth-links">
            <p>
              Remember your password? <Link to="/login">Login here</Link>
            </p>
            <p>
              Don't have an account? <Link to="/register">Register here</Link>
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Step 2: Reset password form
  if (step === 2) {
    return (
      <div className="auth-container">
        <div className="auth-card">
          <h2>Enter Reset Code and New Password</h2>
          <p className="info-message">
            Check your email for the reset code and enter it along with your new password.
          </p>

          {error && <div className="error-message">{error}</div>}
          {successMessage && <div className="success-message">{successMessage}</div>}

          <form onSubmit={handleResetPassword}>
            <div className="form-group">
              <label htmlFor="confirmationCode">Reset Code</label>
              <input
                type="text"
                id="confirmationCode"
                value={confirmationCode}
                onChange={(e) => setConfirmationCode(e.target.value)}
                required
                placeholder="Enter the code from your email"
              />
            </div>

            <div className="form-group">
              <label htmlFor="newPassword">New Password</label>
              <input
                type="password"
                id="newPassword"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                placeholder="Enter new password (min 8 characters)"
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

            <button type="submit" disabled={loading} className="btn-primary">
              {loading ? 'Resetting Password...' : 'Reset Password'}
            </button>

            <button
              type="button"
              onClick={() => {
                setStep(1);
                setConfirmationCode('');
                setNewPassword('');
                setConfirmPassword('');
                setError('');
                setSuccessMessage('');
              }}
              className="btn-secondary"
            >
              Back
            </button>
          </form>

          <div className="auth-links">
            <p>
              Remember your password? <Link to="/login">Login here</Link>
            </p>
          </div>
        </div>
      </div>
    );
  }
};

export default ForgotPassword;
