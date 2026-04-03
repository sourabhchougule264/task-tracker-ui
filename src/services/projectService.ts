import apiClient from './apiClient';
import type { Project, CreateProjectData, UpdateProjectData } from '../types';

export const projectService = {
  getAll: async (): Promise<Project[]> => {
    const response = await apiClient.get<Project[]>('/projects');
    return response.data;
  },

  getById: async (id: number): Promise<Project> => {
    const response = await apiClient.get<Project>(`/projects/${id}`);
    return response.data;
  },

  create: async (data: CreateProjectData): Promise<Project> => {
    const response = await apiClient.post<Project>('/projects', data);
    return response.data;
  },

  update: async (data: UpdateProjectData): Promise<Project> => {
    const { id, ...updateData } = data;
    const response = await apiClient.put<Project>(`/projects/${id}`, updateData);
    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`/projects/${id}`);
  },
};

export default projectService;


