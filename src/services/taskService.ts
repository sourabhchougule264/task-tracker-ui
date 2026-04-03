import apiClient from './apiClient';
import type { Task, CreateTaskData, UpdateTaskData } from '../types';

export const taskService = {
  getAll: async (): Promise<Task[]> => {
    const response = await apiClient.get<Task[]>('/tasks');
    return response.data;
  },

  getById: async (id: number): Promise<Task> => {
    const response = await apiClient.get<Task>(`/tasks/${id}`);
    return response.data;
  },

  getByProject: async (projectId: number): Promise<Task[]> => {
    const response = await apiClient.get<Task[]>(`/tasks/project/${projectId}`);
    return response.data;
  },

  getAssignedToUser: async (username: string): Promise<Task[]> => {
    const response = await apiClient.get<Task[]>(`/tasks/assigned/${username}`);
    return response.data;
  },

  create: async (data: CreateTaskData): Promise<Task> => {
    const response = await apiClient.post<Task>('/tasks', data);
    return response.data;
  },

  update: async (data: UpdateTaskData): Promise<Task> => {
    const { id, ...updateData } = data;
    const response = await apiClient.put<Task>(`/tasks/${id}`, updateData);
    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`/tasks/${id}`);
  },
};

export default taskService;


