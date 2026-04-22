import { describe, it, expect, vi, beforeEach } from 'vitest';
import taskService from './taskService';
import apiClient from './apiClient';

vi.mock('./apiClient', () => ({
    default: {
        get: vi.fn(),
        post: vi.fn(),
        put: vi.fn(),
        delete: vi.fn(),
    },
}));

describe('taskService', () => {
    const mockTask = {
        id: 1,
        description: 'Fix bug in auth flow',
        projectId: 101,
        assignedTo: 'jdoe',
        status: 'IN_PROGRESS',
    };

    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('Get Queries', () => {
        it('getAll: should fetch all tasks', async () => {
            (apiClient.get as any).mockResolvedValue({ data: [mockTask] });

            const result = await taskService.getAll();

            expect(apiClient.get).toHaveBeenCalledWith('/tasks');
            expect(result).toEqual([mockTask]);
        });

        it('getById: should fetch a specific task by ID', async () => {
            (apiClient.get as any).mockResolvedValue({ data: mockTask });

            const result = await taskService.getById(1);

            expect(apiClient.get).toHaveBeenCalledWith('/tasks/1');
            expect(result).toEqual(mockTask);
        });

        it('getByProject: should fetch tasks filtered by projectId', async () => {
            (apiClient.get as any).mockResolvedValue({ data: [mockTask] });

            const result = await taskService.getByProject(101);

            expect(apiClient.get).toHaveBeenCalledWith('/tasks/project/101');
            expect(result).toEqual([mockTask]);
        });

        it('getAssignedToUser: should fetch tasks assigned to a specific username', async () => {
            (apiClient.get as any).mockResolvedValue({ data: [mockTask] });

            const result = await taskService.getAssignedToUser('jdoe');

            expect(apiClient.get).toHaveBeenCalledWith('/tasks/assigned/jdoe');
            expect(result).toEqual([mockTask]);
        });
    });

    describe('Mutations', () => {
        it('create: should post new task data', async () => {
            const newTask = { description: 'New Task', projectId: 101 };
            (apiClient.post as any).mockResolvedValue({ data: { ...newTask, id: 2 } });

            const result = await taskService.create(newTask as any);

            expect(apiClient.post).toHaveBeenCalledWith('/tasks', newTask);
            expect(result.id).toBe(2);
        });

        it('update: should extract ID for URL and pass remaining data in body', async () => {
            const updateData = { id: 1, description: 'Updated Description', status: 'COMPLETED' };
            const { id, ...expectedBody } = updateData;

            (apiClient.put as any).mockResolvedValue({ data: updateData });

            const result = await taskService.update(updateData as any);

            // Verify REST pattern: ID in URL, data in body
            expect(apiClient.put).toHaveBeenCalledWith(`/tasks/${id}`, expectedBody);
            expect(result).toEqual(updateData);
        });

        it('delete: should call the delete endpoint with correct ID', async () => {
            (apiClient.delete as any).mockResolvedValue({ status: 204 });

            await taskService.delete(1);

            expect(apiClient.delete).toHaveBeenCalledWith('/tasks/1');
        });
    });

    describe('Error Propagation', () => {
        it('should throw when the API returns an error', async () => {
            const mockError = new Error('Request failed with status code 500');
            (apiClient.get as any).mockRejectedValue(mockError);

            await expect(taskService.getAll()).rejects.toThrow('Request failed with status code 500');
        });
    });
});