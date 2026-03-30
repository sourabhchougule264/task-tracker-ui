import React, { useState, useEffect } from 'react';
import userService from '../api/userService';

const UserSelector = ({ value, onChange, label, required = false, allowEmpty = true }) => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const data = await userService.getAllUsers();
      setUsers(data);
      setError('');
    } catch (err) {
      setError('Failed to load users');
      console.error('Error fetching users:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="form-group">
        <label>{label || 'Select User'}</label>
        <select disabled>
          <option>Loading users...</option>
        </select>
      </div>
    );
  }

  if (error) {
    return (
      <div className="form-group">
        <label>{label || 'Select User'}</label>
        <select disabled>
          <option>Failed to load users</option>
        </select>
        <small className="error-text">{error}</small>
      </div>
    );
  }

  return (
    <div className="form-group">
      <label htmlFor="user-selector">
        {label || 'Select User'}
        {required && ' *'}
      </label>
      <select
        id="user-selector"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
      >
        {allowEmpty && <option value="">-- Select User --</option>}
        {users.map((user) => (
          <option key={user.id} value={user.username}>
            {user.username} {user.email && `(${user.email})`}
          </option>
        ))}
      </select>
      {allowEmpty && <small>Leave empty to assign later</small>}
    </div>
  );
};

export default UserSelector;

