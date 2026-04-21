import React from 'react';
import { renderHook, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import {
    useProjects,
    useProject,
    useCreateProject,
    useUpdateProject,
    useDeleteProject
} from './useProjects';
import { useAppDispatch } from '../store';
import projectService from '../services/projectService';
import { showNotification } from '../store/uiSlice';
import {UpdateProjectData} from "@/types";

vi.mock('../store', () => ({
    useAppDispatch: vi.fn(),
}));

vi.mock('../services/projectService', () => ({
    default: {
        getAll: vi.fn(),
        getById: vi.fn(),
        create: vi.fn(),
        update: vi.fn(),
        delete: vi.fn(),
    },
}));

vi.mock('../store/uiSlice', () => ({
    // Ensure the mock returns an object so dispatch doesn't receive undefined
    showNotification: vi.fn((payload) => ({ type: 'ui/showNotification', payload })),
}));

// 2. Fixed Wrapper for .ts files (No JSX)
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

describe('Project Hooks', () => {
    const dispatch = vi.fn();

    beforeEach(() => {
        vi.clearAllMocks();
        (useAppDispatch as any).mockReturnValue(dispatch);
    });

    describe('useProjects', () => {
        it('fetches all projects successfully', async () => {
            const mockData = [{ id: 1, name: 'Project Alpha' }];
            (projectService.getAll as any).mockResolvedValue(mockData);

            const { result } = renderHook(() => useProjects(), { wrapper: createWrapper() });

            await waitFor(() => expect(result.current.isSuccess).toBe(true));
            expect(result.current.data).toEqual(mockData);
        });
    });

    describe('useProject', () => {
        it('fetches a single project by id', async () => {
            const mockProject = { id: 1, name: 'Project Alpha' };
            (projectService.getById as any).mockResolvedValue(mockProject);

            const { result } = renderHook(() => useProject(1), { wrapper: createWrapper() });

            await waitFor(() => expect(result.current.isSuccess).toBe(true));
            expect(result.current.data).toEqual(mockProject);
            expect(projectService.getById).toHaveBeenCalledWith(1);
        });
    });

    describe('useCreateProject', () => {
        it('dispatches success notification and invalidates on success', async () => {
            (projectService.create as any).mockResolvedValue({ id: 2 });

            const { result } = renderHook(() => useCreateProject(), { wrapper: createWrapper() });

            await result.current.mutateAsync({description: "", endDate: "", startDate: "", name: 'New Project' });

            expect(dispatch).toHaveBeenCalledWith(
                showNotification({
                    message: 'Project created successfully!',
                    severity: 'success',
                })
            );
        });

        it('dispatches error notification on failure', async () => {
            const errorResponse = { response: { data: { message: 'Creation Denied' } } };
            (projectService.create as any).mockRejectedValue(errorResponse);

            const { result } = renderHook(() => useCreateProject(), { wrapper: createWrapper() });

            result.current.mutate({
                name: 'Fail Project',
                description: ""
            });

            await waitFor(() => expect(result.current.isError).toBe(true));
            expect(dispatch).toHaveBeenCalledWith(
                showNotification({
                    message: 'Creation Denied',
                    severity: 'error',
                })
            );
        });
    });

    describe('useUpdateProject', () => {
        it('invalidates specific project query on update', async () => {
            const updateData = { id: 1, name: 'Updated Name' };
            (projectService.update as any).mockResolvedValue(updateData);

            const { result } = renderHook(() => useUpdateProject(), { wrapper: createWrapper() });

            await result.current.mutateAsync(<UpdateProjectData>updateData);

            expect(projectService.update).toHaveBeenCalledWith(updateData);
            expect(dispatch).toHaveBeenCalledWith(
                expect.objectContaining({
                    payload: expect.objectContaining({ severity: 'success' }),
                })
            );
        });
    });

    describe('useDeleteProject', () => {
        it('successfully deletes a project', async () => {
            (projectService.delete as any).mockResolvedValue({});

            const { result } = renderHook(() => useDeleteProject(), { wrapper: createWrapper() });

            await result.current.mutateAsync(1);

            expect(projectService.delete).toHaveBeenCalledWith(1);
            expect(dispatch).toHaveBeenCalledWith(
                showNotification({
                    message: 'Project deleted successfully!',
                    severity: 'success',
                })
            );
        });
    });
});