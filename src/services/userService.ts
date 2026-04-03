import apiClient from './apiClient';
import type { UserProfile, UpdateUserRoleData } from '../types';

export const userService = {
  getAll: async (): Promise<UserProfile[]> => {
    const response = await apiClient.get<UserProfile[]>('/users');
    return response.data;
  },

  getByUsername: async (username: string): Promise<UserProfile> => {
    const response = await apiClient.get<UserProfile>(`/users/username/${username}`);
    return response.data;
  },

  updateRole: async (data: UpdateUserRoleData): Promise<{ message: string }> => {
    const response = await apiClient.post<{ message: string }>('/auth/assign-role', {
      username: data.username,
      role: data.role,
    });
    return response.data;
  },

  deleteUser: async (username: string): Promise<void> => {
    // First get user by username to get the ID
    const user = await apiClient.get<UserProfile>(`/users/username/${username}`);
    if (user.data.username) {
      // Delete from Cognito first
      await apiClient.delete(`/auth/delete-user/${username}`);
    }
  },
};

export default userService;


