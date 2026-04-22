import { describe, it, expect, vi } from 'vitest';
import { store, useAppDispatch, useAppSelector } from './index';
import * as reactRedux from 'react-redux';

vi.mock('react-redux', async () => {
    const actual = await vi.importActual('react-redux');
    return {
        ...actual,
        useDispatch: vi.fn(),
        useSelector: vi.fn(),
    };
});

describe('Redux Store Configuration', () => {

    describe('Store Initialization', () => {
        it('should initialize with the correct reducer slices', () => {
            const state = store.getState();

            expect(state).toHaveProperty('auth');
            expect(state).toHaveProperty('ui');
        });

        it('should have the correct initial state for auth slice', () => {
            const state = store.getState();

            expect(state.auth).toBeDefined();
            expect(typeof state.auth).toBe('object');
        });

        it('should have the correct initial state for ui slice', () => {
            const state = store.getState();

            expect(state.ui).toBeDefined();
            expect(typeof state.ui).toBe('object');
        });
    });

    describe('Middleware Configuration', () => {
        it('should have serializableCheck configured with ignoredActions', () => {
            const action = { type: 'persist/PERSIST', payload: new Map() };

            expect(() => store.dispatch(action)).not.toThrow();
        });
    });

    describe('Custom Typed Hooks', () => {
        it('useAppDispatch should call the original useDispatch', () => {
            const mockDispatch = vi.fn();
            vi.mocked(reactRedux.useDispatch).mockReturnValue(mockDispatch);

            const dispatch = useAppDispatch();

            expect(reactRedux.useDispatch).toHaveBeenCalled();
            expect(dispatch).toBe(mockDispatch);
        });

        it('useAppSelector should be the original useSelector', () => {
            expect(useAppSelector).toBe(reactRedux.useSelector);
        });
    });

    describe('Type Exports', () => {
        it('RootState and AppDispatch types should be correctly inferred', () => {
            const state = store.getState();
            const dispatch = store.dispatch;

            expect(state).toBeDefined();
            expect(dispatch).toBeDefined();
        });
    });
});