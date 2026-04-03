import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAppDispatch } from '../store';
import { showNotification } from '../store/uiSlice';
import projectService from '../services/projectService';
import type { CreateProjectData, UpdateProjectData } from '../types';

const PROJECTS_QUERY_KEY = 'projects';

export const useProjects = () => {
  return useQuery({
    queryKey: [PROJECTS_QUERY_KEY],
    queryFn: projectService.getAll,
  });
};

export const useProject = (id: number) => {
  return useQuery({
    queryKey: [PROJECTS_QUERY_KEY, id],
    queryFn: () => projectService.getById(id),
    enabled: !!id,
  });
};

export const useCreateProject = () => {
  const dispatch = useAppDispatch();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateProjectData) => projectService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [PROJECTS_QUERY_KEY] });
      dispatch(showNotification({
        message: 'Project created successfully!',
        severity: 'success',
      }));
    },
    onError: (error: any) => {
      dispatch(showNotification({
        message: error.response?.data?.message || 'Failed to create project',
        severity: 'error',
      }));
    },
  });
};

export const useUpdateProject = () => {
  const dispatch = useAppDispatch();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateProjectData) => projectService.update(data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [PROJECTS_QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: [PROJECTS_QUERY_KEY, variables.id] });
      dispatch(showNotification({
        message: 'Project updated successfully!',
        severity: 'success',
      }));
    },
    onError: (error: any) => {
      dispatch(showNotification({
        message: error.response?.data?.message || 'Failed to update project',
        severity: 'error',
      }));
    },
  });
};

export const useDeleteProject = () => {
  const dispatch = useAppDispatch();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => projectService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [PROJECTS_QUERY_KEY] });
      dispatch(showNotification({
        message: 'Project deleted successfully!',
        severity: 'success',
      }));
    },
    onError: (error: any) => {
      dispatch(showNotification({
        message: error.response?.data?.message || 'Failed to delete project',
        severity: 'error',
      }));
    },
  });
};


