import React from 'react';
import { renderHook } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useLogin, useLogout } from './useAuth';
import { useAppDispatch } from '../store';
import authService from '../services/authService';
import { loginSuccess, logout as logoutAction, setError } from '../store/authSlice';

vi.mock('../store', () => ({
    useAppDispatch: vi.fn(),
}));

vi.mock('../services/authService', () => ({
    default: {
        login: vi.fn(),
        register: vi.fn(),
        confirm: vi.fn(),
        logout: vi.fn(),
    },
}));

vi.mock('../store/authSlice', () => ({
    loginSuccess: vi.fn((payload) => ({ type: 'auth/loginSuccess', payload })),
    logout: vi.fn(() => ({ type: 'auth/logout' })),
    setError: vi.fn((payload) => ({ type: 'auth/setError', payload })),
}));

vi.mock('../store/uiSlice', () => ({
    showNotification: vi.fn((payload) => ({ type: 'ui/showNotification', payload })),
}));

/**
 * FIXED WRAPPER FOR .TS FILES
 * Since we cannot use <QueryClientProvider> in a .ts file,
 * we use React.createElement to manually build the component tree.
 */
const createWrapper = () => {
    const queryClient = new QueryClient({
        defaultOptions: {
            queries: { retry: false },
            mutations: { retry: false }
        },
    });

    return ({ children }: { children: React.ReactNode }) =>
        React.createElement(QueryClientProvider, { client: queryClient }, children);
};

describe('Auth Hooks', () => {
    const dispatch = vi.fn();

    beforeEach(() => {
        vi.clearAllMocks();
        (useAppDispatch as any).mockReturnValue(dispatch);
    });

    describe('useLogin', () => {
        it('successfully logs in and dispatches loginSuccess', async () => {
            const mockResponse = {
                accessToken: 'abc',
                idToken: 'def',
                refreshToken: 'ghi',
                username: 'testuser',
            };
            (authService.login as any).mockResolvedValue(mockResponse);

            const { result } = renderHook(() => useLogin(), { wrapper: createWrapper() });

            await result.current.mutateAsync({ username: 'test', password: 'password' });

            // Now this will succeed because dispatch received the object from the mock
            expect(dispatch).toHaveBeenCalledWith(loginSuccess(mockResponse));
            expect(dispatch).toHaveBeenCalledWith(expect.objectContaining({
                payload: expect.objectContaining({ severity: 'success' })
            }));
        });

        it('handles "NEW_PASSWORD_REQUIRED" challenges', async () => {
            const mockChallenge = {
                challengeName: 'NEW_PASSWORD_REQUIRED',
                session: 'session_id',
                message: 'Please change your password',
            };
            (authService.login as any).mockResolvedValue(mockChallenge);

            const { result } = renderHook(() => useLogin(), { wrapper: createWrapper() });

            const response = await result.current.mutateAsync({ username: 'test', password: 'password' });

            expect(response).toEqual({
                success: false,
                challenge: 'NEW_PASSWORD_REQUIRED',
                session: 'session_id',
                error: 'Please change your password',
            });
            expect(dispatch).not.toHaveBeenCalledWith(loginSuccess(expect.any(Object)));
        });

        it('dispatches error notification on failed login', async () => {
            const errorResponse = { response: { data: { message: 'Unauthorized' } } };
            (authService.login as any).mockRejectedValue(errorResponse);

            const { result } = renderHook(() => useLogin(), { wrapper: createWrapper() });

            await result.current.mutateAsync({ username: 'test', password: 'password' });

            expect(dispatch).toHaveBeenCalledWith(setError('Unauthorized'));
            expect(dispatch).toHaveBeenCalledWith(expect.objectContaining({
                payload: expect.objectContaining({ severity: 'error' })
            }));
        });
    });

    describe('useLogout', () => {
        it('clears session, dispatches logout, and clears cache', () => {
            const { result } = renderHook(() => useLogout(), { wrapper: createWrapper() });

            result.current();

            expect(authService.logout).toHaveBeenCalled();
            expect(dispatch).toHaveBeenCalledWith(logoutAction());
        });
    });
});