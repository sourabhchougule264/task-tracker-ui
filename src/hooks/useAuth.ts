import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useAppDispatch } from '../store';
import { loginSuccess, logout as logoutAction, setError } from '../store/authSlice';
import { showNotification } from '../store/uiSlice';
import authService from '../services/authService';
import type { LoginCredentials, RegisterData, ChallengeResponse } from '../types';

export const useLogin = () => {
  const dispatch = useAppDispatch();

  return useMutation({
    mutationFn: async (credentials: LoginCredentials): Promise<ChallengeResponse | { success: boolean; error?: string }> => {
      try {
        const response = await authService.login(credentials);

        console.log('Login response:', response);

        // Check if there's a challenge required
        if (response.challengeName) {
          console.log('Challenge detected:', response.challengeName);
          return {
            success: false,
            challenge: response.challengeName,
            session: response.session,
            error: response.message || 'Challenge required',
          };
        }

        // Check if we have valid tokens
        if (response.accessToken && response.idToken && response.refreshToken) {
          console.log('Valid tokens received, dispatching loginSuccess');

          dispatch(loginSuccess(response));

          dispatch(showNotification({
            message: 'Login successful!',
            severity: 'success',
          }));

          console.log('loginSuccess action dispatched successfully');
          return { success: true };
        }

        // If response doesn't have tokens or challenge, something went wrong
        console.warn('Response missing tokens:', response);
        const errorMessage = response.message || 'Invalid response from server';
        dispatch(setError(errorMessage));
        dispatch(showNotification({
          message: errorMessage,
          severity: 'error',
        }));
        return { success: false, error: errorMessage };

      } catch (error: any) {
        console.error('Login error caught:', error);
        const errorMessage = error.response?.data?.message || error.message || 'Login failed';
        dispatch(setError(errorMessage));
        dispatch(showNotification({
          message: errorMessage,
          severity: 'error',
        }));
        return { success: false, error: errorMessage };
      }
    },
    // Ensure mutation doesn't throw
    throwOnError: false,
  });
};

export const useRegister = () => {
  const dispatch = useAppDispatch();

  return useMutation({
    mutationFn: async (data: RegisterData) => {
      try {
        const response = await authService.register(data);
        dispatch(showNotification({
          message: response.message || 'Registration successful! Please check your email to confirm.',
          severity: 'success',
        }));
        return { success: true, message: response.message };
      } catch (error: any) {
        const errorMessage = error.response?.data?.message || 'Registration failed';
        dispatch(showNotification({
          message: errorMessage,
          severity: 'error',
        }));
        return { success: false, error: errorMessage };
      }
    },
  });
};

export const useConfirm = () => {
  const dispatch = useAppDispatch();

  return useMutation({
    mutationFn: async ({ username, code }: { username: string; code: string }) => {
      try {
        const response = await authService.confirm(username, code);
        dispatch(showNotification({
          message: response.message || 'Email confirmed successfully!',
          severity: 'success',
        }));
        return { success: true, message: response.message };
      } catch (error: any) {
        const errorMessage = error.response?.data?.message || 'Confirmation failed';
        dispatch(showNotification({
          message: errorMessage,
          severity: 'error',
        }));
        return { success: false, error: errorMessage };
      }
    },
  });
};

export const useLogout = () => {
  const dispatch = useAppDispatch();
  const queryClient = useQueryClient();

  return () => {
    authService.logout();
    dispatch(logoutAction());
    queryClient.clear(); // Clear all cached queries
    dispatch(showNotification({
      message: 'Logged out successfully',
      severity: 'info',
    }));
  };
};


