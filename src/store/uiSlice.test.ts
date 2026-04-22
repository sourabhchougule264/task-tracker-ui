import { describe, it, expect } from 'vitest';
import uiReducer, {
    toggleSidebar,
    setSidebarOpen,
    setTheme,
    showNotification,
    hideNotification
} from './uiSlice';
import type { UIState } from '../types';

describe('uiSlice', () => {
    const initialState: UIState = {
        sidebarOpen: true,
        theme: 'light',
        notification: {
            open: false,
            message: '',
            severity: 'info',
        },
    };

    it('should return the initial state when passed an empty action', () => {
        const result = uiReducer(undefined, { type: '' });
        expect(result).toEqual(initialState);
    });

    describe('sidebar actions', () => {
        it('should toggle sidebarOpen from true to false', () => {
            const state = { ...initialState, sidebarOpen: true };
            const result = uiReducer(state, toggleSidebar());
            expect(result.sidebarOpen).toBe(false);
        });

        it('should toggle sidebarOpen from false to true', () => {
            const state = { ...initialState, sidebarOpen: false };
            const result = uiReducer(state, toggleSidebar());
            expect(result.sidebarOpen).toBe(true);
        });

        it('should set sidebarOpen to a specific boolean value', () => {
            const result = uiReducer(initialState, setSidebarOpen(false));
            expect(result.sidebarOpen).toBe(false);

            const secondResult = uiReducer(result, setSidebarOpen(true));
            expect(secondResult.sidebarOpen).toBe(true);
        });
    });

    describe('theme actions', () => {
        it('should update the theme', () => {
            const result = uiReducer(initialState, setTheme('dark'));
            expect(result.theme).toBe('dark');
        });
    });

    describe('notification actions', () => {
        it('should show notification and set open to true', () => {
            const payload = {
                message: 'Success!',
                severity: 'success' as const,
            };

            const result = uiReducer(initialState, showNotification(payload));

            expect(result.notification).toEqual({
                ...payload,
                open: true,
            });
        });

        it('should hide notification and set open to false', () => {
            const activeState: UIState = {
                ...initialState,
                notification: {
                    open: true,
                    message: 'Error',
                    severity: 'error',
                },
            };

            const result = uiReducer(activeState, hideNotification());

            expect(result.notification.open).toBe(false);
            expect(result.notification.message).toBe('Error');
        });
    });
});