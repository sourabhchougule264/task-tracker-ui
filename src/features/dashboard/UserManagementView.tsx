import React, { useState } from 'react';
import {
  Box,
  Card,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Skeleton,
  Alert,
} from '@mui/material';
import { Edit, Delete, Group } from '@mui/icons-material';
import { useUsers, useUpdateUserRole, useDeleteUser } from '../../hooks/useUsers';
import type { UserProfile } from '../../types';

const UserManagementView: React.FC = () => {
  const { data: users, isLoading } = useUsers();
  const updateUserRole = useUpdateUserRole();
  const deleteUser = useDeleteUser();

  const [roleDialogOpen, setRoleDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const [newRole, setNewRole] = useState('');

  const availableRoles = ['Admin', 'Manager', 'Member'];

  const handleOpenRoleDialog = (user: UserProfile) => {
    setSelectedUser(user);
    setNewRole(user.roles && user.roles.length > 0 ? user.roles[0] : 'Member');
    setRoleDialogOpen(true);
  };

  const handleCloseRoleDialog = () => {
    setRoleDialogOpen(false);
    setSelectedUser(null);
    setNewRole('');
  };

  const handleUpdateRole = async () => {
    if (selectedUser && newRole) {
      await updateUserRole.mutateAsync({
        username: selectedUser.username,
        role: newRole,
      });
      handleCloseRoleDialog();
    }
  };

  const handleDeleteUser = async (username: string) => {
    if (window.confirm(`Are you sure you want to delete user "${username}"? This action cannot be undone.`)) {
      await deleteUser.mutateAsync(username);
    }
  };

  const getRoleColor = (role: string): 'default' | 'primary' | 'secondary' | 'error' => {
    switch (role) {
      case 'Admin': return 'error';
      case 'Manager': return 'secondary';
      case 'Member': return 'primary';
      default: return 'default';
    }
  };

  if (isLoading) {
    return (
      <Box>
        <Skeleton variant="text" width={200} height={40} sx={{ mb: 3 }} />
        <Skeleton variant="rectangular" height={400} sx={{ borderRadius: 2 }} />
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
        <Group color="primary" sx={{ fontSize: 40 }} />
        <Typography variant="h4" fontWeight={700}>
          User Management
        </Typography>
      </Box>

      <Alert severity="info" sx={{ mb: 3 }}>
        Manage user roles and permissions. Note: Deleting a user only removes them from the database.
        To completely remove a user, you must also delete them from AWS Cognito.
      </Alert>

      {!users || users.length === 0 ? (
        <Card sx={{ textAlign: 'center', py: 8 }}>
          <Group sx={{ fontSize: 80, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No Users Found
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Users will appear here after registration
          </Typography>
        </Card>
      ) : (
        <TableContainer component={Paper} sx={{ borderRadius: 2 }}>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: 'action.hover' }}>
                <TableCell sx={{ fontWeight: 600 }}>Username</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Email</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Roles</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                <TableCell sx={{ fontWeight: 600 }} align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {users.map((user) => (
                <TableRow
                  key={user.username}
                  sx={{
                    '&:hover': { bgcolor: 'action.hover' },
                    transition: 'background-color 0.2s',
                  }}
                >
                  <TableCell>{user.username}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                      {user.roles && user.roles.length > 0 ? (
                        user.roles.map((role) => (
                          <Chip
                            key={role}
                            label={role}
                            size="small"
                            color={getRoleColor(role)}
                          />
                        ))
                      ) : (
                        <Chip label="No Role" size="small" variant="outlined" />
                      )}
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={user.isActive ? 'Active' : 'Inactive'}
                      size="small"
                      color={user.isActive ? 'success' : 'default'}
                      variant="outlined"
                    />
                  </TableCell>
                  <TableCell align="right">
                    <IconButton
                      size="small"
                      color="primary"
                      onClick={() => handleOpenRoleDialog(user)}
                      title="Edit Role"
                    >
                      <Edit fontSize="small" />
                    </IconButton>
                    <IconButton
                      size="small"
                      color="error"
                      onClick={() => handleDeleteUser(user.username)}
                      title="Delete User"
                    >
                      <Delete fontSize="small" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <Dialog open={roleDialogOpen} onClose={handleCloseRoleDialog} maxWidth="sm" fullWidth>
        <DialogTitle>Update User Role</DialogTitle>
        <DialogContent>
          {selectedUser && (
            <Box sx={{ pt: 2 }}>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                User: <strong>{selectedUser.username}</strong>
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom sx={{ mb: 3 }}>
                Email: <strong>{selectedUser.email}</strong>
              </Typography>

              <FormControl fullWidth>
                <InputLabel>Role</InputLabel>
                <Select
                  value={newRole}
                  onChange={(e) => setNewRole(e.target.value)}
                  label="Role"
                >
                  {availableRoles.map((role) => (
                    <MenuItem key={role} value={role}>
                      {role}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <Alert severity="warning" sx={{ mt: 2 }}>
                Changing a user's role will replace their current role. Users can only have one role at a time.
              </Alert>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseRoleDialog}>Cancel</Button>
          <Button
            onClick={handleUpdateRole}
            variant="contained"
            disabled={!newRole || updateUserRole.isPending}
          >
            {updateUserRole.isPending ? 'Updating...' : 'Update Role'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default UserManagementView;




