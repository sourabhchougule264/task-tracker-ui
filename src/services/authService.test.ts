import { describe, it, expect, vi, beforeEach } from 'vitest';
import authService from './authService';
import apiClient from './apiClient';

vi.mock('./apiClient', () => ({
    default: {
        post: vi.fn(),
    },
}));

describe('authService', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        localStorage.clear();
    });

    describe('login', () => {
        it('should call /auth/login with credentials and return data', async () => {
            const mockCredentials = { username: 'jdoe', password: 'password123' };
            const mockResponse = { data: { accessToken: 'token-123', username: 'jdoe' } };

            (apiClient.post as any).mockResolvedValue(mockResponse);

            const result = await authService.login(mockCredentials);

            expect(apiClient.post).toHaveBeenCalledWith('/auth/login', mockCredentials);
            expect(result).toEqual(mockResponse.data);
        });
    });

    describe('register', () => {
        it('should call /auth/register and return success message', async () => {
            const mockData = { username: 'newuser', email: 'test@test.com', password: 'password' };
            const mockResponse = { data: { message: 'Registration successful' } };

            (apiClient.post as any).mockResolvedValue(mockResponse);

            const result = await authService.register(mockData);

            expect(apiClient.post).toHaveBeenCalledWith('/auth/register', mockData);
            expect(result.message).toBe('Registration successful');
        });
    });

    describe('confirm', () => {
        it('should call /auth/confirm with correct payload', async () => {
            const mockResponse = { data: { message: 'Confirmed' } };
            (apiClient.post as any).mockResolvedValue(mockResponse);

            const result = await authService.confirm('jdoe', '123456');

            expect(apiClient.post).toHaveBeenCalledWith('/auth/confirm', {
                username: 'jdoe',
                confirmationCode: '123456',
            });
            expect(result.message).toBe('Confirmed');
        });
    });

    describe('newPasswordChallenge', () => {
        it('should call /auth/new-password and return tokens', async () => {
            const mockPayload = { username: 'jdoe', newPassword: 'new', session: 'sess-1' };
            const mockResponse = { data: { accessToken: 'new-token' } };

            (apiClient.post as any).mockResolvedValue(mockResponse);

            const result = await authService.newPasswordChallenge(
                mockPayload.username,
                mockPayload.newPassword,
                mockPayload.session
            );

            expect(apiClient.post).toHaveBeenCalledWith('/auth/new-password', mockPayload);
            expect(result).toEqual(mockResponse.data);
        });
    });

    describe('forgotPassword', () => {
        it('should call /auth/forgot-password', async () => {
            (apiClient.post as any).mockResolvedValue({ data: { message: 'Code sent' } });

            const result = await authService.forgotPassword('jdoe');

            expect(apiClient.post).toHaveBeenCalledWith('/auth/forgot-password', { username: 'jdoe' });
            expect(result.message).toBe('Code sent');
        });
    });

    describe('confirmForgotPassword', () => {
        it('should call /auth/confirm-forgot-password with all fields', async () => {
            const mockResponse = { data: { message: 'Password reset' } };
            (apiClient.post as any).mockResolvedValue(mockResponse);

            const result = await authService.confirmForgotPassword('jdoe', '123', 'newPass');

            expect(apiClient.post).toHaveBeenCalledWith('/auth/confirm-forgot-password', {
                username: 'jdoe',
                confirmationCode: '123',
                newPassword: 'newPass',
            });
            expect(result.message).toBe('Password reset');
        });
    });

    describe('refreshToken', () => {
        it('should call /auth/refresh with token', async () => {
            const mockResponse = { data: { accessToken: 'fresh-token' } };
            (apiClient.post as any).mockResolvedValue(mockResponse);

            const result = await authService.refreshToken('old-refresh');

            expect(apiClient.post).toHaveBeenCalledWith('/auth/refresh', { refreshToken: 'old-refresh' });
            expect(result.accessToken).toBe('fresh-token');
        });
    });

    describe('logout', () => {
        it('should clear localStorage', () => {
            localStorage.setItem('accessToken', 'some-token');
            localStorage.setItem('user', 'some-user');

            authService.logout();

            expect(localStorage.getItem('accessToken')).toBeNull();
            expect(localStorage.length).toBe(0);
        });
    });

    describe('Error Handling', () => {
        it('should propagate errors from the apiClient', async () => {
            const apiError = new Error('Network Error');
            (apiClient.post as any).mockRejectedValue(apiError);

            await expect(authService.login({ username: 'u', password: 'p' }))
                .rejects.toThrow('Network Error');
        });
    });
});