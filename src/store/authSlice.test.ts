import authReducer, {
    loginSuccess,
    logout,
    initializeAuth
} from './authSlice';
import { jwtDecode } from 'jwt-decode';
import { vi, describe, it, expect, beforeEach } from 'vitest';

// 1. Mock jwt-decode
vi.mock('jwt-decode', () => ({
    jwtDecode: vi.fn(),
}));

describe('Auth Slice', () => {
    beforeEach(() => {
        // Clear localStorage and mocks before each test
        localStorage.clear();
        vi.clearAllMocks();
    });

    it('should return initial state', () => {
        const state = authReducer(undefined, { type: 'unknown' });
        expect(state.loading).toBe(true);
        expect(state.isAuthenticated).toBe(false);
    });

    describe('loginSuccess', () => {
        it('should set user and isAuthenticated true when token is valid', () => {
            const mockDecoded = {
                'cognito:username': 'sourabh',
                email: 'sourabh@example.com',
                'cognito:groups': ['ADMIN'],
                exp: (Date.now() + 10000) / 1000 // Valid for 10 more seconds
            };

            (jwtDecode as any).mockReturnValue(mockDecoded);

            const action = loginSuccess({
                accessToken: 'access',
                idToken: 'id-token',
                refreshToken: 'refresh'
            });

            const state = authReducer(undefined, action);

            expect(localStorage.getItem('idToken')).toBe('id-token');
            expect(state.isAuthenticated).toBe(true);
            expect(state.user?.username).toBe('sourabh');
            expect(state.loading).toBe(false);
        });

        it('should set isAuthenticated false if token decoding fails', () => {
            (jwtDecode as any).mockImplementation(() => {
                throw new Error('Invalid token');
            });

            const action = loginSuccess({ accessToken: 'a', idToken: 'bad', refreshToken: 'r' });
            const state = authReducer(undefined, action);

            expect(state.isAuthenticated).toBe(false);
            expect(localStorage.getItem('idToken')).toBeNull(); // Should have cleared on error
        });
    });

    describe('logout', () => {
        it('should clear user state and localStorage', () => {
            localStorage.setItem('accessToken', 'some-token');
            const initialState = {
                user: { username: 'test', email: 'test@test.com', roles: [] },
                isAuthenticated: true,
                loading: false,
                error: null,
            };

            const state = authReducer(initialState, logout());

            expect(state.user).toBeNull();
            expect(state.isAuthenticated).toBe(false);
            expect(localStorage.getItem('accessToken')).toBeNull();
        });
    });

    describe('initializeAuth', () => {
        it('should restore user if a valid token exists in localStorage', () => {
            localStorage.setItem('idToken', 'valid-token');
            (jwtDecode as any).mockReturnValue({
                'cognito:username': 'auto_user',
                email: 'auto@example.com',
                exp: (Date.now() + 10000) / 1000
            });

            const state = authReducer(undefined, initializeAuth());

            expect(state.isAuthenticated).toBe(true);
            expect(state.user?.username).toBe('auto_user');
        });

        it('should not authenticate if token is expired', () => {
            localStorage.setItem('idToken', 'expired-token');
            (jwtDecode as any).mockReturnValue({
                exp: (Date.now() - 10000) / 1000 // Expired 10 seconds ago
            });

            const state = authReducer(undefined, initializeAuth());

            expect(state.isAuthenticated).toBe(false);
            expect(localStorage.getItem('idToken')).toBeNull();
        });
    });
});