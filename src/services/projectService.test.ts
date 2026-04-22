import { describe, it, expect, vi, beforeEach } from 'vitest';
import projectService from './projectService';
import apiClient from './apiClient';

vi.mock('./apiClient', () => ({
    default: {
        get: vi.fn(),
        post: vi.fn(),
        put: vi.fn(),
        delete: vi.fn(),
    },
}));

describe('projectService', () => {
    const mockProject = {
        id: 1,
        name: 'Apollo Mission',
        description: 'Landing on the moon',
        status: 'ACTIVE',
    };

    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('getAll', () => {
        it('should fetch all projects and return data', async () => {
            const mockProjects = [mockProject, { ...mockProject, id: 2, name: 'Project Ares' }];
            (apiClient.get as any).mockResolvedValue({ data: mockProjects });

            const result = await projectService.getAll();

            expect(apiClient.get).toHaveBeenCalledWith('/projects');
            expect(result).toHaveLength(2);
            expect(result).toEqual(mockProjects);
        });
    });

    describe('getById', () => {
        it('should fetch a single project by ID', async () => {
            (apiClient.get as any).mockResolvedValue({ data: mockProject });

            const result = await projectService.getById(1);

            expect(apiClient.get).toHaveBeenCalledWith('/projects/1');
            expect(result).toEqual(mockProject);
        });
    });

    describe('create', () => {
        it('should post new project data and return the created project', async () => {
            const createData = { name: 'New Project', description: 'Test Description' };
            (apiClient.post as any).mockResolvedValue({ data: { ...createData, id: 99 } });

            const result = await projectService.create(createData);

            expect(apiClient.post).toHaveBeenCalledWith('/projects', createData);
            expect(result.id).toBe(99);
            expect(result.name).toBe('New Project');
        });
    });

    describe('update', () => {
        it('should put update data and correctly extract the ID from the payload', async () => {
            const updateData = { id: 1, name: 'Updated Apollo', description: 'Updated info' };
            const { id, ...expectedPayload } = updateData;

            (apiClient.put as any).mockResolvedValue({ data: updateData });

            const result = await projectService.update(updateData);

            // Verify that the ID was used in the URL and NOT in the body (per your implementation)
            expect(apiClient.put).toHaveBeenCalledWith(`/projects/${id}`, expectedPayload);
            expect(result).toEqual(updateData);
        });
    });

    describe('delete', () => {
        it('should call the delete endpoint with the correct ID', async () => {
            (apiClient.delete as any).mockResolvedValue({ status: 204 });

            await projectService.delete(1);

            expect(apiClient.delete).toHaveBeenCalledWith('/projects/1');
        });
    });

    describe('Error Handling Propagation', () => {
        it('should throw an error if the API call fails', async () => {
            const apiError = new Error('404 Not Found');
            (apiClient.get as any).mockRejectedValue(apiError);

            await expect(projectService.getById(404)).rejects.toThrow('404 Not Found');
        });
    });
});