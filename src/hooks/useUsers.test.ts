import React from 'react';
import { renderHook, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import {
    useUsers,
    useUser,
    useUpdateUserRole,
    useDeleteUser
} from './useUsers';
import { useAppDispatch } from '../store';
import userService from '../services/userService';
import { showNotification } from '../store/uiSlice';

vi.mock('../store', () => ({
    useAppDispatch: vi.fn(),
}));

vi.mock('../services/userService', () => ({
    default: {
        getAll: vi.fn(),
        getByUsername: vi.fn(),
        updateRole: vi.fn(),
        deleteUser: vi.fn(),
    },
}));

vi.mock('../store/uiSlice', () => ({
    // Ensure we return an action object for dispatch to record
    showNotification: vi.fn((payload) => ({ type: 'ui/showNotification', payload })),
}));

const createWrapper = () => {
    const queryClient = new QueryClient({
        defaultOptions: {
            queries: { retry: false },
            mutations: { retry: false },
        },
    });
    return ({ children }: { children: React.ReactNode }) =>
        React.createElement(QueryClientProvider, { client: queryClient }, children);
};

describe('User Management Hooks', () => {
    const dispatch = vi.fn();

    beforeEach(() => {
        vi.clearAllMocks();
        (useAppDispatch as any).mockReturnValue(dispatch);
    });

    describe('User Queries', () => {
        it('useUsers: should fetch all users successfully', async () => {
            const mockUsers = [{ username: 'admin', email: 'admin@test.com' }];
            (userService.getAll as any).mockResolvedValue(mockUsers);

            const { result } = renderHook(() => useUsers(), { wrapper: createWrapper() });

            await waitFor(() => expect(result.current.isSuccess).toBe(true));
            expect(result.current.data).toEqual(mockUsers);
            expect(userService.getAll).toHaveBeenCalled();
        });

        it('useUser: should fetch a specific user by username', async () => {
            const mockUser = { username: 'jdoe', email: 'jdoe@test.com' };
            (userService.getByUsername as any).mockResolvedValue(mockUser);

            const { result } = renderHook(() => useUser('jdoe'), { wrapper: createWrapper() });

            await waitFor(() => expect(result.current.isSuccess).toBe(true));
            expect(userService.getByUsername).toHaveBeenCalledWith('jdoe');
            expect(result.current.data).toEqual(mockUser);
        });

        it('useUser: should not fetch if username is empty', () => {
            const { result } = renderHook(() => useUser(''), { wrapper: createWrapper() });
            expect(result.current.isLoading).toBe(false);
            expect(userService.getByUsername).not.toHaveBeenCalled();
        });
    });

    describe('User Mutations', () => {
        it('useUpdateUserRole: should dispatch success notification on success', async () => {
            (userService.updateRole as any).mockResolvedValue({ message: 'Role Changed' });

            const { result } = renderHook(() => useUpdateUserRole(), { wrapper: createWrapper() });

            await result.current.mutateAsync({ username: 'jdoe', role: 'Admin' });

            expect(userService.updateRole).toHaveBeenCalledWith({ username: 'jdoe', role: 'Admin' });
            expect(dispatch).toHaveBeenCalledWith(
                showNotification({
                    message: 'Role Changed',
                    severity: 'success',
                })
            );
        });

        it('useUpdateUserRole: should handle error and dispatch error notification', async () => {
            (userService.updateRole as any).mockRejectedValue({
                response: { data: { message: 'Permission Denied' } }
            });

            const { result } = renderHook(() => useUpdateUserRole(), { wrapper: createWrapper() });
            result.current.mutate({ username: 'jdoe', role: 'Admin' });

            await waitFor(() => expect(result.current.isError).toBe(true));
            expect(dispatch).toHaveBeenCalledWith(
                showNotification({
                    message: 'Permission Denied',
                    severity: 'error',
                })
            );
        });

        it('useDeleteUser: should dispatch success notification on deletion', async () => {
            (userService.deleteUser as any).mockResolvedValue({});

            const { result } = renderHook(() => useDeleteUser(), { wrapper: createWrapper() });
            await result.current.mutateAsync('jdoe');

            expect(userService.deleteUser).toHaveBeenCalledWith('jdoe');
            expect(dispatch).toHaveBeenCalledWith(
                showNotification({
                    message: 'User deleted successfully!',
                    severity: 'success',
                })
            );
        });
    });
});