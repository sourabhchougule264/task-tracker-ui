import React from 'react';
import { renderHook, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import {
    useTasks,
    useTask,
    useProjectTasks,
    useUserTasks,
    useCreateTask,
    useUpdateTask,
    useDeleteTask
} from './useTasks';
import { useAppDispatch } from '../store';
import taskService from '../services/taskService';
import { showNotification } from '../store/uiSlice';

vi.mock('../store', () => ({
    useAppDispatch: vi.fn(),
}));

vi.mock('../services/taskService', () => ({
    default: {
        getAll: vi.fn(),
        getById: vi.fn(),
        getByProject: vi.fn(),
        getAssignedToUser: vi.fn(),
        create: vi.fn(),
        update: vi.fn(),
        delete: vi.fn(),
    },
}));

vi.mock('../store/uiSlice', () => ({
    // Return an object so dispatch doesn't receive undefined
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

describe('Task Hooks', () => {
    const dispatch = vi.fn();

    beforeEach(() => {
        vi.clearAllMocks();
        (useAppDispatch as any).mockReturnValue(dispatch);
    });

    describe('Queries', () => {
        it('useTasks: fetches all tasks', async () => {
            const mockTasks = [{ id: 1, description: 'Task 1' }];
            (taskService.getAll as any).mockResolvedValue(mockTasks);

            const { result } = renderHook(() => useTasks(), { wrapper: createWrapper() });

            await waitFor(() => expect(result.current.isSuccess).toBe(true));
            expect(result.current.data).toEqual(mockTasks);
        });

        it('useTask: fetches task by id', async () => {
            const mockTask = { id: 10, description: 'Specific Task' };
            (taskService.getById as any).mockResolvedValue(mockTask);

            const { result } = renderHook(() => useTask(10), { wrapper: createWrapper() });

            await waitFor(() => expect(result.current.isSuccess).toBe(true));
            expect(taskService.getById).toHaveBeenCalledWith(10);
            expect(result.current.data).toEqual(mockTask);
        });

        it('useProjectTasks: fetches tasks for a project', async () => {
            const mockTasks = [{ id: 1, projectId: 5 }];
            (taskService.getByProject as any).mockResolvedValue(mockTasks);

            const { result } = renderHook(() => useProjectTasks(5), { wrapper: createWrapper() });

            await waitFor(() => expect(result.current.isSuccess).toBe(true));
            expect(taskService.getByProject).toHaveBeenCalledWith(5);
        });

        it('useUserTasks: fetches tasks assigned to a user', async () => {
            const mockTasks = [{ id: 1, assignedTo: 'jdoe' }];
            (taskService.getAssignedToUser as any).mockResolvedValue(mockTasks);

            const { result } = renderHook(() => useUserTasks('jdoe'), { wrapper: createWrapper() });

            await waitFor(() => expect(result.current.isSuccess).toBe(true));
            expect(taskService.getAssignedToUser).toHaveBeenCalledWith('jdoe');
        });
    });

    describe('Mutations', () => {
        it('useCreateTask: dispatches success notification', async () => {
            (taskService.create as any).mockResolvedValue({ id: 101 });

            const { result } = renderHook(() => useCreateTask(), { wrapper: createWrapper() });
            await result.current.mutateAsync({ description: 'New Task', projectId: 1 });

            expect(dispatch).toHaveBeenCalledWith(
                showNotification({
                    message: 'Task created successfully!',
                    severity: 'success',
                })
            );
        });

        it('useUpdateTask: handles errors gracefully', async () => {
            const errorMsg = 'Update failed';
            (taskService.update as any).mockRejectedValue({
                response: { data: { message: errorMsg } }
            });

            const { result } = renderHook(() => useUpdateTask(), { wrapper: createWrapper() });
            result.current.mutate({ id: 1, description: 'Updated' });

            await waitFor(() => expect(result.current.isError).toBe(true));
            expect(dispatch).toHaveBeenCalledWith(
                showNotification({
                    message: errorMsg,
                    severity: 'error',
                })
            );
        });

        it('useDeleteTask: dispatches success notification', async () => {
            (taskService.delete as any).mockResolvedValue({});

            const { result } = renderHook(() => useDeleteTask(), { wrapper: createWrapper() });
            await result.current.mutateAsync(1);

            expect(taskService.delete).toHaveBeenCalledWith(1);
            expect(dispatch).toHaveBeenCalledWith(
                showNotification({
                    message: 'Task deleted successfully!',
                    severity: 'success',
                })
            );
        });
    });
});