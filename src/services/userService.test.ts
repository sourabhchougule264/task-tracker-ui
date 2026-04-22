import { describe, it, expect, vi, beforeEach } from 'vitest';
import userService from './userService';
import apiClient from './apiClient';

vi.mock('./apiClient', () => ({
    default: {
        get: vi.fn(),
        post: vi.fn(),
        delete: vi.fn(),
    },
}));

describe('userService', () => {
    const mockUser = {
        id: 'user-123',
        username: 'jdoe',
        email: 'jdoe@example.com',
        roles: ['Member'],
    };

    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('getAll', () => {
        it('should fetch all users and return the data array', async () => {
            const mockUsers = [mockUser, { ...mockUser, id: 'user-456', username: 'asmith' }];
            (apiClient.get as any).mockResolvedValue({ data: mockUsers });

            const result = await userService.getAll();

            expect(apiClient.get).toHaveBeenCalledWith('/users');
            expect(result).toEqual(mockUsers);
            expect(result).toHaveLength(2);
        });
    });

    describe('getByUsername', () => {
        it('should fetch a single user by their username', async () => {
            (apiClient.get as any).mockResolvedValue({ data: mockUser });

            const result = await userService.getByUsername('jdoe');

            expect(apiClient.get).toHaveBeenCalledWith('/users/username/jdoe');
            expect(result).toEqual(mockUser);
        });
    });

    describe('updateRole', () => {
        it('should post correct data to the assign-role endpoint', async () => {
            const updateData = { username: 'jdoe', role: 'Admin' };
            const mockResponse = { data: { message: 'Role updated successfully' } };

            (apiClient.post as any).mockResolvedValue(mockResponse);

            const result = await userService.updateRole(updateData);

            expect(apiClient.post).toHaveBeenCalledWith('/auth/assign-role', updateData);
            expect(result.message).toBe('Role updated successfully');
        });
    });

    describe('deleteUser', () => {
        it('should perform a sequential lookup and then delete the user', async () => {
            // 1. Mock the initial GET request to return the user with an ID
            (apiClient.get as any).mockResolvedValue({ data: mockUser });
            // 2. Mock the DELETE request
            (apiClient.delete as any).mockResolvedValue({ status: 204 });

            await userService.deleteUser('jdoe');

            // Verify the lookup happened first
            expect(apiClient.get).toHaveBeenCalledWith('/users/username/jdoe');

            // Verify the delete happened using the ID returned from the first call
            expect(apiClient.delete).toHaveBeenCalledWith('/users/user-123');
        });

        it('should not call delete if the user lookup fails to find an ID', async () => {
            // Mock user lookup returning no ID
            (apiClient.get as any).mockResolvedValue({ data: { username: 'unknown' } });

            await userService.deleteUser('unknown');

            expect(apiClient.get).toHaveBeenCalledWith('/users/username/unknown');
            expect(apiClient.delete).not.toHaveBeenCalled();
        });
    });

    describe('Error Propagation', () => {
        it('should bubble up errors from the apiClient', async () => {
            const apiError = new Error('Unauthorized');
            (apiClient.get as any).mockRejectedValue(apiError);

            await expect(userService.getAll()).rejects.toThrow('Unauthorized');
        });
    });
});