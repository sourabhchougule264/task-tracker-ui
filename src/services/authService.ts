import apiClient from './apiClient';
import type { LoginCredentials, RegisterData, AuthResponse } from '../types';

export const authService = {
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    const response = await apiClient.post<AuthResponse>('/auth/login', credentials);
    return response.data;
  },

  register: async (data: RegisterData): Promise<{ message: string }> => {
    const response = await apiClient.post<{ message: string }>('/auth/register', data);
    return response.data;
  },

  confirm: async (username: string, confirmationCode: string): Promise<{ message: string }> => {
    const response = await apiClient.post<{ message: string }>('/auth/confirm', {
      username,
      confirmationCode,
    });
    return response.data;
  },

  newPasswordChallenge: async (
    username: string,
    newPassword: string,
    session: string
  ): Promise<AuthResponse> => {
    const response = await apiClient.post<AuthResponse>('/auth/new-password', {
      username,
      newPassword,
      session,
    });
    return response.data;
  },

  forgotPassword: async (username: string): Promise<{ message: string }> => {
    const response = await apiClient.post<{ message: string }>('/auth/forgot-password', {
      username,
    });
    return response.data;
  },

  confirmForgotPassword: async (
    username: string,
    confirmationCode: string,
    newPassword: string
  ): Promise<{ message: string }> => {
    const response = await apiClient.post<{ message: string }>('/auth/confirm-forgot-password', {
      username,
      confirmationCode,
      newPassword,
    });
    return response.data;
  },

  refreshToken: async (refreshToken: string): Promise<AuthResponse> => {
    const response = await apiClient.post<AuthResponse>('/auth/refresh', {
      refreshToken,
    });
    return response.data;
  },

  logout: (): void => {
    localStorage.clear();
  },
};

export default authService;


