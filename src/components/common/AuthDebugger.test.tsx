import { render } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import authReducer from '../../store/authSlice';
import AuthDebugger from './AuthDebugger';

describe('AuthDebugger Component', () => {
    const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

    beforeEach(() => {
        vi.clearAllMocks();
    });

    afterEach(() => {
        consoleSpy.mockReset();
    });

    const renderWithState = (initialAuthState: any) => {
        const store = configureStore({
            reducer: { auth: authReducer },
            preloadedState: { auth: initialAuthState },
        });

        return render(
            <Provider store={store}>
                <AuthDebugger />
            </Provider>
        );
    };

    it('should log the initial state on mount', () => {
        const initialState = {
            user: null,
            isAuthenticated: false,
            loading: false,
            error: null,
        };

        renderWithState(initialState);

        expect(consoleSpy).toHaveBeenCalledWith(
            '🔍 Auth State Changed:',
            expect.objectContaining({
                isAuthenticated: false,
                hasUser: false,
                loading: false
            })
        );
    });

    it('should log updated state when a user is authenticated', () => {
        const authenticatedState = {
            user: { username: 'gemini_user', email: 'gemini@example.com', roles: ['USER'] },
            isAuthenticated: true,
            loading: false,
            error: null,
        };

        renderWithState(authenticatedState);

        expect(consoleSpy).toHaveBeenCalledWith(
            '🔍 Auth State Changed:',
            expect.objectContaining({
                isAuthenticated: true,
                hasUser: true,
                user: expect.objectContaining({ username: 'gemini_user' })
            })
        );
    });

    it('should log errors when the auth state contains an error', () => {
        const errorState = {
            user: null,
            isAuthenticated: false,
            loading: false,
            error: 'Invalid Credentials',
        };

        renderWithState(errorState);

        expect(consoleSpy).toHaveBeenCalledWith(
            '🔍 Auth State Changed:',
            expect.objectContaining({
                error: 'Invalid Credentials'
            })
        );
    });
});