import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import userService from '../api/userService';
import authService from '../api/authService';
import './Dashboard.css';

const AVAILABLE_ROLES = ['ADMIN', 'TASK_CREATOR', 'READ_ONLY'];

const UserManagement = () => {
  const { isAdmin } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [selectedRole, setSelectedRole] = useState('');

  useEffect(() => {
    if (isAdmin()) {
      fetchUsers();
    }
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

  const handleChangeRole = async () => {
    if (!selectedUser || !selectedRole) return;

    try {
      await authService.assignRole(selectedUser.username, selectedRole);
      setSuccess(`Role changed to ${selectedRole} for ${selectedUser.username}`);
      setTimeout(() => setSuccess(''), 3000);
      setShowRoleModal(false);
      setSelectedUser(null);
      setSelectedRole('');
      fetchUsers();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to change role');
    }
  };

  const handleDeleteUser = async (userId, username) => {
    if (!window.confirm(`Are you sure you want to delete user ${username}?`)) {
      return;
    }

    try {
      await userService.deleteUser(userId);
      setSuccess(`User ${username} deleted successfully`);
      setTimeout(() => setSuccess(''), 3000);
      fetchUsers();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete user');
    }
  };

  const openRoleModal = (user) => {
    setSelectedUser(user);
    setShowRoleModal(true);
    // Pre-select user's current role if they have one
    setSelectedRole('');
  };

  if (!isAdmin()) {
    return (
      <div className="unauthorized">
        <h2>Access Denied</h2>
        <p>You don't have permission to access user management.</p>
      </div>
    );
  }

  if (loading) {
    return <div className="loading">Loading users...</div>;
  }

  return (
    <div className="user-management">
      <div className="management-header">
        <h2>User Management</h2>
        <button
          onClick={fetchUsers}
          title="Refresh Users"
          style={{
            background: 'none',
            border: 'none',
            fontSize: '24px',
            cursor: 'pointer',
            padding: '5px',
            transition: 'transform 0.2s'
          }}
          onMouseEnter={(e) => e.target.style.transform = 'rotate(90deg)'}
          onMouseLeave={(e) => e.target.style.transform = 'rotate(0deg)'}
        >
          🔄
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}

      <div className="users-table-container">
        <table className="users-table">
          <thead>
            <tr>
              <th>Username</th>
              <th>Email</th>
              <th>Roles</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id}>
                <td>
                  <strong>{user.username}</strong>
                </td>
                <td>{user.email || 'N/A'}</td>
                <td>
                  <div className="roles-list">
                    {user.roles && user.roles.length > 0 ? (
                      user.roles.map((role) => (
                        <span key={role} className="role-badge">
                          {role}
                        </span>
                      ))
                    ) : (
                      <span className="no-role">No roles</span>
                    )}
                  </div>
                </td>
                <td>
                  <div className="action-buttons">
                    <button
                      className="btn-small btn-primary"
                      onClick={() => openRoleModal(user)}
                      title="Change Role"
                    >
                      Change Role
                    </button>
                    <button
                      className="btn-small btn-danger"
                      onClick={() => handleDeleteUser(user.id, user.username)}
                      title="Delete User"
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {users.length === 0 && (
          <div className="no-data">No users found</div>
        )}
      </div>

      {showRoleModal && (
        <div className="modal-overlay" onClick={() => setShowRoleModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>
                Change Role - {selectedUser?.username}
              </h2>
              <button className="modal-close" onClick={() => setShowRoleModal(false)}>
                ×
              </button>
            </div>

            <div className="modal-body">
              <div className="form-group">
                <label htmlFor="role">Select New Role</label>
                <select
                  id="role"
                  value={selectedRole}
                  onChange={(e) => setSelectedRole(e.target.value)}
                >
                  <option value="">-- Select Role --</option>
                  {AVAILABLE_ROLES.map((role) => (
                    <option key={role} value={role}>
                      {role}
                    </option>
                  ))}
                </select>
              </div>
              <p className="info-text" style={{ marginTop: '10px', fontSize: '14px', color: '#666' }}>
                This will replace any existing role with the selected role.
              </p>
            </div>

            <div className="modal-actions">
              <button
                className="btn-secondary"
                onClick={() => setShowRoleModal(false)}
              >
                Cancel
              </button>
              <button
                className="btn-primary"
                onClick={handleChangeRole}
                disabled={!selectedRole}
              >
                Change Role
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;

