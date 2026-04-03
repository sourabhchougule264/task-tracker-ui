import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAppDispatch } from '../store';
import { showNotification } from '../store/uiSlice';
import userService from '../services/userService';
import { UpdateUserRoleData } from '../types';

const USERS_QUERY_KEY = 'users';

export const useUsers = () => {
  return useQuery({
    queryKey: [USERS_QUERY_KEY],
    queryFn: userService.getAll,
  });
};

export const useUser = (username: string) => {
  return useQuery({
    queryKey: [USERS_QUERY_KEY, username],
    queryFn: () => userService.getByUsername(username),
    enabled: !!username,
  });
};

export const useUpdateUserRole = () => {
  const dispatch = useAppDispatch();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateUserRoleData) => userService.updateRole(data),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: [USERS_QUERY_KEY] });
      dispatch(showNotification({
        message: response.message || 'User role updated successfully!',
        severity: 'success',
      }));
    },
    onError: (error: any) => {
      dispatch(showNotification({
        message: error.response?.data?.message || 'Failed to update user role',
        severity: 'error',
      }));
    },
  });
};

export const useDeleteUser = () => {
  const dispatch = useAppDispatch();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (username: string) => userService.deleteUser(username),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [USERS_QUERY_KEY] });
      dispatch(showNotification({
        message: 'User deleted successfully!',
        severity: 'success',
      }));
    },
    onError: (error: any) => {
      dispatch(showNotification({
        message: error.response?.data?.message || 'Failed to delete user',
        severity: 'error',
      }));
    },
  });
};

