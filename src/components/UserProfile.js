import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import userService from '../api/userService';
import './Dashboard.css';

const UserProfile = () => {
  const { user: authUser } = useAuth();
  const [user, setUser] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [formData, setFormData] = useState({
    username: '',
    email: '',
  });

  useEffect(() => {
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    try {
      setLoading(true);
      const data = await userService.getCurrentUser();
      setUser(data);
      setFormData({
        username: data.username || '',
        email: data.email || '',
      });
      setError('');
    } catch (err) {
      setError('Failed to load user profile');
      console.error('Error fetching user profile:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');

    try {
      const updated = await userService.updateUser(user.id, {
        email: formData.email,
      });
      setUser(updated);
      setSuccess('Profile updated successfully!');
      setIsEditing(false);
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      username: user.username || '',
      email: user.email || '',
    });
    setIsEditing(false);
    setError('');
  };

  if (loading) {
    return (
      <div className="profile-container">
        <div className="loading">Loading profile...</div>
      </div>
    );
  }

  return (
    <div className="profile-container">
      <div className="profile-card">
        <div className="profile-header">
          <h2>User Profile</h2>
          {!isEditing && (
            <button
              className="btn-primary"
              onClick={() => setIsEditing(true)}
            >
              Edit Profile
            </button>
          )}
        </div>

        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">{success}</div>}

        {!isEditing ? (
          <div className="profile-info">
            <div className="profile-field">
              <label>Username:</label>
              <span>{user?.username}</span>
            </div>

            <div className="profile-field">
              <label>Email:</label>
              <span>{user?.email || 'Not provided'}</span>
            </div>

            <div className="profile-field">
              <label>Roles:</label>
              <span className="roles-list">
                {authUser?.roles && authUser.roles.length > 0 ? (
                  authUser.roles.map((role) => (
                    <span key={role} className="role-badge">
                      {role}
                    </span>
                  ))
                ) : (
                  'No roles assigned'
                )}
              </span>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="profile-form">
            <div className="form-group">
              <label htmlFor="username">Username</label>
              <input
                type="text"
                id="username"
                name="username"
                value={formData.username}
                disabled
                className="input-disabled"
              />
              <small>Username cannot be changed</small>
            </div>

            <div className="form-group">
              <label htmlFor="email">Email *</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                placeholder="Enter your email"
              />
            </div>

            <div className="form-actions">
              <button
                type="button"
                onClick={handleCancel}
                className="btn-secondary"
                disabled={saving}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn-primary"
                disabled={saving}
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default UserProfile;

