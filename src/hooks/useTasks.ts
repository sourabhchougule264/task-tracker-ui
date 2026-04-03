import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAppDispatch } from '../store';
import { showNotification } from '../store/uiSlice';
import taskService from '../services/taskService';
import type { CreateTaskData, UpdateTaskData } from '../types';

const TASKS_QUERY_KEY = 'tasks';

export const useTasks = () => {
  return useQuery({
    queryKey: [TASKS_QUERY_KEY],
    queryFn: taskService.getAll,
  });
};

export const useTask = (id: number) => {
  return useQuery({
    queryKey: [TASKS_QUERY_KEY, id],
    queryFn: () => taskService.getById(id),
    enabled: !!id,
  });
};

export const useProjectTasks = (projectId: number) => {
  return useQuery({
    queryKey: [TASKS_QUERY_KEY, 'project', projectId],
    queryFn: () => taskService.getByProject(projectId),
    enabled: !!projectId,
  });
};

export const useUserTasks = (username: string) => {
  return useQuery({
    queryKey: [TASKS_QUERY_KEY, 'user', username],
    queryFn: () => taskService.getAssignedToUser(username),
    enabled: !!username,
  });
};

export const useCreateTask = () => {
  const dispatch = useAppDispatch();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateTaskData) => taskService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [TASKS_QUERY_KEY] });
      dispatch(showNotification({
        message: 'Task created successfully!',
        severity: 'success',
      }));
    },
    onError: (error: any) => {
      dispatch(showNotification({
        message: error.response?.data?.message || 'Failed to create task',
        severity: 'error',
      }));
    },
  });
};

export const useUpdateTask = () => {
  const dispatch = useAppDispatch();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateTaskData) => taskService.update(data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [TASKS_QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: [TASKS_QUERY_KEY, variables.id] });
      dispatch(showNotification({
        message: 'Task updated successfully!',
        severity: 'success',
      }));
    },
    onError: (error: any) => {
      dispatch(showNotification({
        message: error.response?.data?.message || 'Failed to update task',
        severity: 'error',
      }));
    },
  });
};

export const useDeleteTask = () => {
  const dispatch = useAppDispatch();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => taskService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [TASKS_QUERY_KEY] });
      dispatch(showNotification({
        message: 'Task deleted successfully!',
        severity: 'success',
      }));
    },
    onError: (error: any) => {
      dispatch(showNotification({
        message: error.response?.data?.message || 'Failed to delete task',
        severity: 'error',
      }));
    },
  });
};


