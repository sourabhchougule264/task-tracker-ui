import { describe, it, expect } from 'vitest';
import { TaskStatus } from './index';
import type { AuthState, UIState, Task } from './index';

describe('Type Definitions & Enums', () => {

    describe('TaskStatus Enum', () => {
        it('should have the correct string values mapping', () => {
            expect(TaskStatus.NEW).toBe('NEW');
            expect(TaskStatus.IN_PROGRESS).toBe('IN_PROGRESS');
            expect(TaskStatus.BLOCKED).toBe('BLOCKED');
            expect(TaskStatus.COMPLETED).toBe('COMPLETED');
            expect(TaskStatus.NOT_STARTED).toBe('NOT_STARTED');
        });

        it('should support reverse lookup or iteration', () => {
            const keys = Object.keys(TaskStatus);
            expect(keys).toContain('NEW');
            expect(keys.length).toBe(5);
        });
    });

    describe('Interface Conformance (Initial States)', () => {
        it('should allow creating a valid AuthState', () => {
            const initialState: AuthState = {
                user: null,
                isAuthenticated: false,
                loading: false,
                error: null,
            };

            expect(initialState.isAuthenticated).toBe(false);
            expect(initialState.user).toBeNull();
        });

        it('should allow creating a valid UIState', () => {
            const initialState: UIState = {
                sidebarOpen: true,
                theme: 'light',
                notification: {
                    open: false,
                    message: '',
                    severity: 'info',
                },
            };

            expect(initialState.theme).toBe('light');
            expect(initialState.notification.open).toBe(false);
        });

        it('should correctly handle Task interface structure', () => {
            const mockTask: Task = {
                id: 1,
                description: 'Test Task',
                status: TaskStatus.NEW,
                ownerUsername: 'admin',
            };

            expect(mockTask.id).toBe(1);
            expect(mockTask.status).toBe(TaskStatus.NEW);
        });
    });

    describe('Type Integrity Checks', () => {
        it('should verify that TaskStatus is used within a Task object', () => {
            const statuses: TaskStatus[] = [
                TaskStatus.NEW,
                TaskStatus.COMPLETED
            ];

            expect(statuses).toHaveLength(2);
            expect(typeof statuses[0]).toBe('string');
        });
    });
});